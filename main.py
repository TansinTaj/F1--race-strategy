from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib

# Load models and encoders
pitstops_model = joblib.load("pitstops_model.pkl")
pitlap_model = joblib.load("pitlap_model.pkl")
tire_model = joblib.load("tire_model.pkl")
scaler = joblib.load("scaler.pkl")
label_encoders = joblib.load("label_encoders.pkl")

# Load dataset to lookup additional features
data = pd.read_csv("final_data_clean.csv")

# Define API app
app = FastAPI()

# Define expected input schema
class InputFeatures(BaseModel):
    eventYear: int
    EventName: str
    Team: str
    Driver: str
    meanAirTemp: float
    Rainfall: float

@app.post("/predict")
def predict_strategy(input: InputFeatures):
    # Step 1: Filter dataset based on user input
    filtered = data[
        (data["eventYear"] == input.eventYear) &
        (data["EventName"] == input.EventName) &
        (data["Team"] == input.Team) &
        (data["Driver"] == input.Driver)
    ]

    if filtered.empty:
        raise HTTPException(status_code=404, detail="No matching race found in the dataset.")

    # Take the first match (assuming only one row matches)
    row = filtered.iloc[0].copy()

    # Step 2: Replace user-controlled fields
    row["meanAirTemp"] = input.meanAirTemp
    row["Rainfall"] = input.Rainfall

    # Step 3: Encode categorical values
    for col, le in label_encoders.items():
        if col in row:
            row[col] = le.transform([row[col]])[0]

    # Step 4: Scale numerical features
    numeric_features = scaler.feature_names_in_
    row_scaled = row[numeric_features].values.reshape(1, -1)
    row_scaled = scaler.transform(row_scaled)

    # Step 5: Make predictions
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
