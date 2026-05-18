import os
import cv2
import numpy as np
from PIL import Image

import torch
import torchvision.transforms as T

from model import DeepfakeDetector


# ==========================================
# CONFIG
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "best_model.pth"
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

NUM_FRAMES = 20


# ==========================================
# TRANSFORM
# ==========================================

transform = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
])


# ==========================================
# LOAD MODEL
# ==========================================

model = DeepfakeDetector().to(DEVICE)

model.load_state_dict(
    torch.load(MODEL_PATH, map_location=DEVICE)
)

model.eval()

print(f"Model loaded on {DEVICE}")


# ==========================================
# HELPERS
# ==========================================

def load_video_frames(video_path, num_frames):
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise Exception(
            f"Could not open video: {video_path}"
        )

    total_frames = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    if total_frames <= 0:
        cap.release()

        raise Exception(
            "Could not determine frame count"
        )

    frame_indices = np.linspace(
        0,
        total_frames - 1,
        num_frames
    ).astype(int)

    frames = []

    for idx in frame_indices:

        cap.set(
            cv2.CAP_PROP_POS_FRAMES,
            int(idx)
        )

        ret, frame = cap.read()

        if not ret:
            continue

        frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        frames.append(frame)

    cap.release()

    if len(frames) == 0:
        raise Exception(
            "No frames found in video"
        )

    return frames


def compute_fft_from_rgb(frame_rgb):
    gray = cv2.cvtColor(
        frame_rgb,
        cv2.COLOR_RGB2GRAY
    )

    gray = cv2.resize(gray, (224, 224))

    fft = np.fft.fft2(gray)

    fft = np.fft.fftshift(fft)

    fft = np.log1p(np.abs(fft))

    fft = (
        fft - fft.mean()
    ) / (
        fft.std() + 1e-6
    )

    return torch.tensor(
        fft,
        dtype=torch.float32
    ).unsqueeze(0)


def verdict(score):

    if score >= 0.90:
        return "FAKE"

    elif score <= 0.40:
        return "REAL"

    else:
        return "SUSPICIOUS"


# ==========================================
# MAIN PREDICTION
# ==========================================

def predict_video(video_path):

    frames = load_video_frames(
        video_path,
        NUM_FRAMES
    )

    rgb_list = []
    fft_list = []

    for frame in frames:

        img = Image.fromarray(frame)

        rgb = transform(img)

        fft = compute_fft_from_rgb(frame)

        rgb_list.append(rgb)

        fft_list.append(fft)

    rgb = torch.stack(
        rgb_list
    ).unsqueeze(0).to(DEVICE)

    fft = torch.stack(
        fft_list
    ).unsqueeze(0).to(DEVICE)

    with torch.no_grad():

        output = model(rgb, fft)

        prob = torch.sigmoid(output)

        score = prob.item()

    return {

        "final_score": round(score, 6),

        "prediction": verdict(score)
    }


# ==========================================
# LOCAL TEST
# ==========================================

if __name__ == "__main__":

    test_video = "Ronaldo.mp4"

    result = predict_video(test_video)

    print(result)