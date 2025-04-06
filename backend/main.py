from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib

from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI()

# ✅ CORS configuration
origins = [
    "http://localhost:5173",                      # Local dev
    "https://f1-race-strategy.onrender.com"       # Replace with actual frontend Render URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load models and encoders
pitstops_model = joblib.load("pitstops_model.pkl")
pitlap_model = joblib.load("pitlap_model.pkl")
tire_model = joblib.load("tire_model.pkl")
scaler = joblib.load("scaler.pkl")
label_encoders = joblib.load("label_encoders.pkl")

# ✅ Load dataset for lookup
data = pd.read_csv("final_data_clean.csv")

# ✅ Root route
@app.get("/")
def read_root():
    return {"message": "Race Strategy Prediction API is live!"}

# ✅ Input schema
class InputFeatures(BaseModel):
    eventYear: int
    EventName: str
    Team: str
    Driver: str
    meanAirTemp: float
    Rainfall: float

# ✅ Predict route
@app.post("/predict")
def predict_strategy(input: InputFeatures):
    try:
        # Step 1: Filter dataset with essential fields only
        filtered = data[
            (data["eventYear"] == input.eventYear) &
            (data["EventName"] == input.EventName) &
            (data["Team"] == input.Team) &
            (data["Driver"] == input.Driver) &
            (data["Rainfall"] == input.Rainfall)
        ]

        if filtered.empty:
            raise HTTPException(status_code=404, detail="No matching race found in the dataset.")

        # Step 2: Use first matching row and override user-controlled values
        row = filtered.iloc[0].copy()
        row["meanAirTemp"] = input.meanAirTemp
        row["Rainfall"] = input.Rainfall

        # Step 3: Encode categoricals
        for col, le in label_encoders.items():
            if col in row:
                row[col] = le.transform([row[col]])[0]

        # Step 4: Scale numeric features
        numeric_features = scaler.feature_names_in_
        row_scaled = row[numeric_features].values.reshape(1, -1)
        row_scaled = scaler.transform(row_scaled)

        # Step 5: Predictions
        total_pitstops = pitstops_model.predict(row_scaled)[0]
        pit_laps = pitlap_model.predict(row_scaled)[0]

        if total_pitstops == 1:
            pit_laps = [pit_laps]
        else:
            pit_laps = sorted(list(pit_laps))[:int(total_pitstops)]

        tire_strategy = []
        for lap in pit_laps:
            compound_encoded = tire_model.predict(np.hstack((row_scaled, [[lap]])))[0]
            compound = label_encoders["Compound"].inverse_transform([compound_encoded])[0]
            tire_strategy.append({
                "Lap": int(lap),
                "Compound": compound
            })

        return {
            "Total Pit Stops": int(total_pitstops),
            "Pit Stop Laps": [int(lap) for lap in pit_laps],
            "Tire Strategy": tire_strategy
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
