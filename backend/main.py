from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Initialize FastAPI app
app = FastAPI()

# ✅ CORS configuration
origins = [
    "http://localhost:5173",                      # Local dev
    "https://f1-race-strategy.onrender.com"       # Render frontend URL
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
    Rainfall: float

# ✅ Predict route
@app.post("/predict")
def predict_strategy(input: InputFeatures):
    try:
        # Filter dataset by matching on selected fields
        filtered = data[
            (data["eventYear"] == input.eventYear) &
            (data["EventName"] == input.EventName) &
            (data["Team"] == input.Team) &
            (data["Driver"] == input.Driver) &
            (data["Rainfall"] == input.Rainfall)
        ]

        if filtered.empty:
            raise HTTPException(status_code=404, detail="No matching race found in the dataset.")

        row = filtered.iloc[0].copy()

        # Step 1: Fill inferred features from matched row
        input_dict = {
            "eventYear": input.eventYear,
            "EventName": input.EventName,
            "Team": input.Team,
            "Driver": input.Driver,
            "meanAirTemp": row["meanAirTemp"],
            "TrackTempAvg": row["TrackTempAvg"],
            "Rainfall": input.Rainfall
        }

        input_df = pd.DataFrame([input_dict])

        # Step 2: Encode categoricals
        for col, le in label_encoders.items():
            if col in input_df.columns:
                input_df[col] = le.transform(input_df[col])

        # Step 3: Scale
        row_scaled = scaler.transform(input_df[scaler.feature_names_in_])

        # Step 4: Predict
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
            tire_strategy.append({"Lap": int(lap), "Compound": compound})

        return {
            "Total Pit Stops": int(total_pitstops),
            "Pit Stop Laps": [int(lap) for lap in pit_laps],
            "Tire Strategy": tire_strategy
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})
