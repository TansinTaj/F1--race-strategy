import React, { useState } from 'react';
import Header from './Components/Header';
import InputForm from './Components/InputForm';
import PredictionOutput from './Components/PredictionOutput';
import './Components/styles/Dashboard.css';

const App = () => {
  const [predictionData, setPredictionData] = useState({
    totalPitStops: null,
    pitStopStrategy: [],
  });

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <InputForm
          onSubmit={(prediction) => {
            setPredictionData({
              totalPitStops: prediction.totalPitStops,
              pitStopStrategy: prediction.tireStrategy.map(strategy => ({
                lap: strategy.Lap,
                compound: strategy.Compound,
              })),
            });
          }}
        />
        <PredictionOutput data={predictionData} />
      </div>
    </div>
  );
};

export default App;
