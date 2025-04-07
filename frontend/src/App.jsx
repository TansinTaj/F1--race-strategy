import React, { useState } from 'react';
import Header from './Components/Header';
import InputForm from './Components/InputForm';
import PredictionOutput from './Components/PredictionOutput';
import './Components/styles/Dashboard.css';

const App = () => {
  // ✅ Add initial formData state with all fields
  const [formData, setFormData] = useState({
    track: '',
    year: '',
    team: '',
    driver: '',
    meanAirTemp: '',
    trackConditionIndex: '',
    fuelConsumptionPerStint: 2.5,
    stintPerformance: 0.5,
    tyreDegradationPerStint: 0.5,
  });

  const [predictionData, setPredictionData] = useState({
    totalPitStops: null,
    pitStopStrategy: [],
  });

  const handlePrediction = async (formData) => {
    try {
      console.log("Sending form data:", formData);
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const result = await response.json();

      setPredictionData({
        totalPitStops: result["Total Pit Stops"],
        pitStopStrategy: result["Tire Strategy"].map(strategy => ({
          lap: strategy.Lap,
          compound: strategy.Compound
        }))
      });

      console.log('Prediction result:', result);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      alert("Prediction failed. Please check inputs or try again later.");
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        {/* ✅ Pass formData and setFormData */}
        <InputForm
          formData={formData}
          setFormData={setFormData}
          handleSubmit={(e) => {
            e.preventDefault();
            handlePrediction(formData);
          }}
        />
        <PredictionOutput data={predictionData} />
      </div>
    </div>
  );
};

export default App;
