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

  const handlePrediction = (formData) => {
    // This is where we'll add the prediction logic later
    // For now, let's use dummy data
    setPredictionData({
      totalPitStops: 2,
      pitStopStrategy: [
        { lap: 18, compound: 'Soft' },
        { lap: 39, compound: 'Medium' }
      ]
    });
    console.log('Form data received:', formData.driver);

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