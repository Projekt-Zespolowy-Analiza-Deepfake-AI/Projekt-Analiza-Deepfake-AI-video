import os
import sys
sys.path.append('/var/www/ml')
import uuid

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# ==========================================
# AI MODEL IMPORT
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

AI_MODEL_PATH = os.path.abspath(
    os.path.join(BASE_DIR, "..", "ai_model")
)

sys.path.append(AI_MODEL_PATH)

from predict import predict_video

# ==========================================
# FLASK
# ==========================================

app = Flask(__name__)
CORS(app)

# ==========================================
# RATE LIMITING
# ==========================================

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

# ==========================================
# DATABASE
# ==========================================

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///deepfake.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# max 100 MB
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024

db = SQLAlchemy(app)

# ==========================================
# DATABASE MODEL
# ==========================================

class Analysis(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    public_id = db.Column(
        db.String(36),
        unique=True,
        nullable=False
    )

    original_name = db.Column(
        db.String(100)
    )

    saved_path = db.Column(
        db.String(200)
    )

    score = db.Column(
        db.Float
    )

    prediction = db.Column(
        db.String(20)
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )


with app.app_context():
    db.create_all()

# ==========================================
# FILE CONFIG
# ==========================================

ALLOWED_EXTENSIONS = {
    'mp4',
    'avi',
    'mov',
    'mkv'
}

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    'uploads'
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

# ==========================================
# HELPERS
# ==========================================

def allowed_file(filename):

    return (
        '.' in filename and
        filename.rsplit(
            '.',
            1
        )[1].lower() in ALLOWED_EXTENSIONS
    )


def cleanup_old_data(hours=24):

    limit = (
        datetime.utcnow() -
        timedelta(hours=hours)
    )

    old_records = Analysis.query.filter(
        Analysis.created_at < limit
    ).all()

    count = 0

    for record in old_records:

        if os.path.exists(record.saved_path):
            os.remove(record.saved_path)

        db.session.delete(record)

        count += 1

    db.session.commit()

    return count

# ==========================================
# ROUTES
# ==========================================

@app.route('/')
def home():

    return "Backend is running."

# ==========================================
# DETECT
# ==========================================

@app.route('/detect', methods=['POST'])
@limiter.limit("5 per minute")

def detect():

    cleanup_old_data(hours=24)

    if 'video' not in request.files:

        return jsonify({
            "error": "No file provided"
        }), 400

    video_file = request.files['video']

    if not allowed_file(video_file.filename):

        return jsonify({
            "error": "Invalid file type"
        }), 400

    # ======================================
    # SAVE FILE
    # ======================================

    p_id = str(uuid.uuid4())

    original_name = secure_filename(
        video_file.filename
    )

    extension = os.path.splitext(
        original_name
    )[1]

    unique_name = f"{p_id}{extension}"

    file_path = os.path.join(
        UPLOAD_FOLDER,
        unique_name
    )

    video_file.save(file_path)

    # ======================================
    # MODEL PREDICTION
    # ======================================

    try:

        result = predict_video(file_path)

        probability = result["final_score"]

        prediction = result["prediction"]

    except Exception as e:

        if os.path.exists(file_path):
            os.remove(file_path)

        return jsonify({
            "error": "Model prediction failed",
            "details": str(e)
        }), 500

    # ======================================
    # SAVE TO DATABASE
    # ======================================

    new_record = Analysis(
        public_id=p_id,
        original_name=original_name,
        saved_path=file_path,
        score=probability,
        prediction=prediction
    )

    db.session.add(new_record)

    db.session.commit()

    # ======================================
    # RESPONSE
    # ======================================

    return jsonify({

        "analysis_id": p_id,

        "status": "success",

        "score": probability,

        "prediction": prediction,

        "note": (
            "Result will be stored "
            "for 24 hours."
        )
    })

# ==========================================
# HISTORY
# ==========================================

@app.route('/history', methods=['GET'])
@limiter.limit("20 per minute")

def get_history():

    all_analyses = Analysis.query.order_by(
        Analysis.created_at.desc()
    ).all()

    results = []

    for item in all_analyses:

        results.append({

            "analysis_id": item.public_id,

            "filename": item.original_name,

            "score": item.score,

            "prediction": item.prediction,

            "date": item.created_at.strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        })

    return jsonify(results)

# ==========================================
# ANALYSIS DETAILS
# ==========================================

@app.route('/analysis/<string:p_id>', methods=['GET'])

def get_analysis_details(p_id):

    item = Analysis.query.filter_by(
        public_id=p_id
    ).first()

    if not item:

        return jsonify({
            "error": (
                "Analysis not found "
                "or expired"
            )
        }), 404

    return jsonify({

        "analysis_id": item.public_id,

        "original_name": item.original_name,

        "score": item.score,

        "prediction": item.prediction,

        "date": item.created_at
    })

# ==========================================
# CLEANUP
# ==========================================

@app.route('/cleanup', methods=['POST'])
@limiter.limit("1 per minute")

def manual_cleanup():

    deleted = cleanup_old_data(hours=24)

    return jsonify({
        "message": (
            f"Successfully deleted "
            f"{deleted} old records/files."
        )
    })

# ==========================================
# RUN
# ==========================================

if __name__ == '__main__':

    app.run(
        debug=True,
        port=5000
    )
