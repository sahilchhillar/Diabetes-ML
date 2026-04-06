import os
import json
import joblib
import numpy as np
import pickle

def init():
    global model, scaler
    
    # Use AZUREML_MODEL_DIR instead of Model.get_model_path() (SDK v1 — broken)
    model_dir = os.environ["AZUREML_MODEL_DIR"]
    model_path = os.path.join(model_dir, "model.pkl")
    
    with open("./model/scaler.pkl", "rb") as f:
        scaler = pickle.load(f)

    print(f"Loading model from: {model_path}")
    model = joblib.load(model_path)
    print("Model loaded successfully")

def run(raw_data):
    try:
        parsed = json.loads(raw_data)
        
        data = np.array(parsed["data"]).reshape(1, -1)
        data = scaler.transform(data)

        result = model.predict(data)
        return {"result": result.tolist()}  # tolist() not to_list()
    except Exception as e:
        return json.dumps({"error": str(e)})  # fixed typo: erroe → error