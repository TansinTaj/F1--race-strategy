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
  const payload = {
    eventYear: formData.year,
    EventName: formData.track,
    Team: formData.team,
    Driver: formData.driver,
    meanAirTemp:
      (parseFloat(formData.trackTempMin) + parseFloat(formData.trackTempMax)) / 2,
    Rainfall: formData.rainfall
  };

  try {
    const response = await fetch('https://f1-race-strategy.onrender.com/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Prediction:', data);

    setPredictionData(data);
  } catch (err) {
    console.error('Prediction failed:', err);
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
