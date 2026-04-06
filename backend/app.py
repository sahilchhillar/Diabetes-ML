import os
import json
import pickle

import numpy as np
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# # Expected feature names in order
# with open("../azure/model/feature_names.pkl", "rb") as f:
# 	features = pickle.load(f)


FEATURE_NAMES = [
    "HighBP", "HighChol", "CholCheck", "BMI", "Smoker",
    "Stroke", "HeartDiseaseorAttack", "PhysActivity", "Fruits", "Veggies",
    "HvyAlcoholConsump", "AnyHealthcare", "NoDocbcCost", "GenHlth", "MentHlth",
    "PhysHlth", "DiffWalk", "Sex", "Age", "Education", "Income",
]

# ---------------------------------------------------------------------------
# Azure ML Endpoint config — store these in .env, never hardcode
# ---------------------------------------------------------------------------
SCORING_URI = os.getenv("SCORING_URI")
API_KEY     = os.getenv("API_KEY")

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)

    # print(data)

    # Validate all expected features are present
    missing = [f for f in FEATURE_NAMES if f not in data]
    if missing:
        return jsonify({"error": f"Missing features: {', '.join(missing)}"}), 400

    # Build input array in correct feature order
    try:
        values = [float(data[f]) for f in FEATURE_NAMES]
    except (ValueError, TypeError) as exc:
        return jsonify({"error": f"Invalid feature value: {exc}"}), 400

    # print(values)
    # Hit Azure ML endpoint
    input_payload = json.dumps({"data": [values]})

    try:
        response = requests.post(
            url=SCORING_URI,
            data=input_payload,
            headers=HEADERS,
            timeout=30
        )
        response.raise_for_status()
    except requests.exceptions.Timeout:
        return jsonify({"error": "Azure ML endpoint timed out"}), 504
    except requests.exceptions.RequestException as exc:
        return jsonify({"error": f"Azure ML endpoint error: {str(exc)}"}), 502

    # Parse response from score.py
    result = response.json()
    print(result)

    prediction  = int(result["result"][0])
    message     = "Diabetes" if prediction == 1 else "No Diabetes"

    return jsonify({
        "prediction": prediction,
        "message":    message,
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)