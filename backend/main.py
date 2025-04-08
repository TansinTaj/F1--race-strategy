from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
from typing import List, Dict, Any
import pandas as pd
import numpy as np
import joblib
import logging
from fastapi.middleware.cors import CORSMiddleware

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="F1 Race Strategy Predictor", description="Predicts pit stop strategy and tire compounds for F1 races")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models and preprocessing tools
try:
    logger.info("Loading models and preprocessing tools...")
    pitstops_model = joblib.load("pitstops_model.pkl")
    pitlap_model = joblib.load("pitlap_model.pkl")
    tire_model = joblib.load("tire_model.pkl")
    scaler = joblib.load("scaler.pkl")
    label_encoders = joblib.load("label_encoders.pkl")
    data = pd.read_csv("final_data_clean.csv")
    logger.info("All models and data loaded successfully!")
except Exception as e:
    logger.error(f"Error loading models or data: {str(e)}")
    raise

class InputFeatures(BaseModel):
    eventYear: int
    EventName: str
    Team: str
    Driver: str
    meanAirTemp: float
    Rainfall: str
    trackConditionIndex: int

    @validator('eventYear')
    def validate_year(cls, v):
        if v not in [2018, 2019, 2020, 2021, 2022]:
            raise ValueError('Year must be between 2018 and 2022')
        return v

    @validator('trackConditionIndex')
    def validate_track_condition(cls, v):
        if not 1 <= v <= 10:
            raise ValueError('Track condition must be between 1 and 10')
        return v

    @validator('meanAirTemp')
    def validate_temperature(cls, v):
        if not -50 <= v <= 60:
            raise ValueError('Temperature must be between -50°C and 60°C')
        return v

    @validator('Rainfall')
    def validate_rainfall(cls, v):
        valid_options = ["No Rain", "Light Rain", "Medium Rain", "Heavy Rain"]
        if v not in valid_options:
            raise ValueError(f'Rainfall must be one of: {", ".join(valid_options)}')
        return v

@app.get("/")
def read_root():
    return {
        "message": "F1 Race Strategy Prediction API",
        "version": "2.0",
        "models": ["Pit Stop Strategy", "Tire Compound"]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": {
            "pitstops_model": pitstops_model is not None,
            "pitlap_model": pitlap_model is not None,
            "tire_model": tire_model is not None
        },
        "data_loaded": not data.empty,
        "preprocessing_tools": {
            "scaler": scaler is not None,
            "label_encoders": label_encoders is not None
        }
    }

@app.get("/model-info")
def model_info():
    return {
        "supported_years": sorted(data["eventYear"].unique().tolist()),
        "supported_teams": sorted(data["Team"].unique().tolist()),
        "supported_tracks": sorted(data["EventName"].unique().tolist()),
        "rainfall_options": ["No Rain", "Light Rain", "Medium Rain", "Heavy Rain"],
        "track_condition_range": {"min": 1, "max": 10},
        "performance_metrics_range": {"min": 0, "max": 1}
    }

def prepare_input_data(input_features: InputFeatures) -> tuple[pd.Series, np.ndarray]:
    filtered = data[
        (data["eventYear"] == input_features.eventYear) &
        (data["EventName"] == input_features.EventName) &
        (data["Team"] == input_features.Team) &
        (data["Driver"] == input_features.Driver)
    ]

    if filtered.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No matching race found for {input_features.Driver} with {input_features.Team} "
                   f"at {input_features.EventName} in {input_features.eventYear}"
        )

    row = filtered.iloc[0].copy()

    # Update values from user input
    row["meanAirTemp"] = input_features.meanAirTemp
    row["Rainfall"] = {
        "No Rain": 0.0,
        "Light Rain": 0.25,
        "Medium Rain": 0.5,
        "Heavy Rain": 0.75
    }.get(input_features.Rainfall, 0.0)
    row["trackConditionIndex"] = input_features.trackConditionIndex

    # Encode categorical features
    for col, le in label_encoders.items():
        if col in row:
            row[col] = le.transform([row[col]])[0]

    numeric_features = scaler.feature_names_in_
    missing_cols = [col for col in numeric_features if col not in row.index]
    if missing_cols:
        raise HTTPException(
            status_code=500,
            detail=f"Missing required features: {missing_cols}"
        )

    row_scaled = scaler.transform(row[numeric_features].values.reshape(1, -1))
    return row, row_scaled

def predict_pit_strategy(row_scaled: np.ndarray) -> tuple[int, List[int]]:
    try:
        total_pitstops = int(pitstops_model.predict(row_scaled)[0])
        pit_laps = pitlap_model.predict(row_scaled)[0]
        if total_pitstops == 1:
            pit_laps = [int(pit_laps)]
        else:
            pit_laps = sorted([int(lap) for lap in pit_laps])[:total_pitstops]
        return total_pitstops, pit_laps
    except Exception as e:
        logger.error(f"Error in pit strategy prediction: {str(e)}")
        raise HTTPException(status_code=500, detail="Error predicting pit strategy")

def predict_tire_compounds(row_scaled: np.ndarray, pit_laps: List[int]) -> List[Dict[str, Any]]:
    try:
        tire_strategy = []
        for lap in pit_laps:
            compound_encoded = tire_model.predict(np.hstack((row_scaled, [[lap]])))[0]
            compound = label_encoders["Compound"].inverse_transform([compound_encoded])[0]
            tire_strategy.append({
                "Lap": int(lap),
                "Compound": compound
            })
        return tire_strategy
    except Exception as e:
        logger.error(f"Error in tire compound prediction: {str(e)}")
        raise HTTPException(status_code=500, detail="Error predicting tire compounds")

@app.post("/predict")
def predict_strategy(input_features: InputFeatures):
    logger.info(f"Received prediction request: {input_features.dict()}")
    try:
        row, row_scaled = prepare_input_data(input_features)
        total_pitstops, pit_laps = predict_pit_strategy(row_scaled)
        tire_strategy = predict_tire_compounds(row_scaled, pit_laps)

        response = {
            "Total Pit Stops": total_pitstops,
            "Pit Stop Laps": pit_laps,
            "Tire Strategy": tire_strategy,
            "Race Details": {
                "Event": input_features.EventName,
                "Year": input_features.eventYear,
                "Team": input_features.Team,
                "Driver": input_features.Driver
            },
            "Conditions": {
                "Temperature": input_features.meanAirTemp,
                "Rainfall": input_features.Rainfall,
                "Track Condition": input_features.trackConditionIndex
            },
            "Performance Metrics": {
                "Fuel Consumption": row["fuel_slope"],
                "Stint Performance": row["lag_slope_mean"],
                "Tyre Degradation": row["deg_slope"]
            }
        }

        logger.info(f"Prediction successful: {response}")
        return response
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
