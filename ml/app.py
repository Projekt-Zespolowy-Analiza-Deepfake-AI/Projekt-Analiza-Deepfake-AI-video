from flask import Flask, request
app = Flask(__name__)

@app.route ('/predict', methods=['POST'])
def predict():
	return {"result": "fake/not fake"}

app.run(port=5000)
