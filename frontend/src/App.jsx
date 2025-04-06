import React, { useState } from 'react';
import Header from './Components/Header';
import InputForm from './Components/InputForm';
import PredictionOutput from './Components/PredictionOutput';
import './Components/styles/Dashboard.css';

const App = () => {
  const [predictionData, setPredictionData] = useState({
    totalPitStops: null,
    pitStopStrategy: []
  });

  const handlePrediction = async (formData) => {
    try {
      const response = await fetch("https://f1-strategy-api.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventYear: parseInt(formData.year),
          EventName: formData.track,
          Team: formData.team,
          Driver: formData.driver,
          meanAirTemp:
            (parseFloat(formData.trackTempMin) + parseFloat(formData.trackTempMax)) / 2,
          Rainfall: formData.rainfall,
        }),
      });

      const result = await response.json();

      setPredictionData({
        totalPitStops: result.total_pit_stops,
        pitStopStrategy: result.strategy,
      });

      console.log("Prediction result:", result);
    } catch (error) {
      console.error("Prediction failed:", error);
      alert("Prediction failed. Please try again later.");
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <InputForm onSubmit={handlePrediction} />
        <PredictionOutput data={predictionData} />
      </div>
    </div>
  );
};

export default App;
