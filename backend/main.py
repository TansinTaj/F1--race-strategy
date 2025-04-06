@app.post("/predict")
def predict_strategy(input: InputFeatures):
    try:
        # Filter only on key identifying features (no rainfall)
        filtered = data[
            (data["eventYear"] == input.eventYear) &
            (data["EventName"] == input.EventName) &
            (data["Team"] == input.Team) &
            (data["Driver"] == input.Driver)
        ]

        if filtered.empty:
            raise HTTPException(status_code=404, detail="No matching race found in the dataset.")

        # Pick the first matching row
        row = filtered.iloc[0].copy()

        # Override with user input
        row["meanAirTemp"] = input.meanAirTemp
        row["Rainfall"] = input.Rainfall

        # Encode categoricals
        for col, le in label_encoders.items():
            if col in row:
                row[col] = le.transform([row[col]])[0]

        # Scale
        numeric_features = scaler.feature_names_in_
        row_scaled = row[numeric_features].values.reshape(1, -1)
        row_scaled = scaler.transform(row_scaled)

        # Predict total pitstops
        total_pitstops = pitstops_model.predict(row_scaled)[0]

        # Predict pit laps
        pit_laps = pitlap_model.predict(row_scaled)[0]
        if total_pitstops == 1:
            pit_laps = [pit_laps]
        else:
            pit_laps = sorted(list(pit_laps))[:int(total_pitstops)]

        # Predict tire compound
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
