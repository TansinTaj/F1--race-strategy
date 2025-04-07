import React, { useState } from 'react';
import axios from 'axios';
import './styles/Dashboard.css';

const VALIDATION_RANGES = {
  temperature: { min: -50, max: 60 },
  trackCondition: { min: 1, max: 10 },
  performance: { min: 0, max: 1 }
};

const InputForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    track: '',
    eventYear: 2024,
    team: '',
    driver: '',
    trackTempMin: '',
    trackTempMax: '',
    rainfall: '',
    trackConditionIndex: 5,
    fuelConsumptionPerStint: 0.5,
    stintPerformance: 0.5,
    tyreDegradationPerStint: 0.5,
  });

  const tracks = [...]; // trimmed for brevity
  const years = ['2018', '2019', '2020', '2021', '2022'];
  const teams = [...]; // trimmed for brevity
  const driverOptions = { ... };
  const driverInfo = { ... };
  const rainfallOptions = ['No Rain', 'Light Rain', 'Medium Rain', 'Heavy Rain'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value, ...(name === 'team' ? { driver: '' } : {}) }));
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const validateFormData = (data) => {
    const errors = [];
    if (!data.track) errors.push('Track is required');
    if (!data.team) errors.push('Team is required');
    if (!data.driver) errors.push('Driver is required');
    if (!data.rainfall) errors.push('Rainfall is required');

    const tempMin = parseInt(data.trackTempMin);
    const tempMax = parseInt(data.trackTempMax);
    if (isNaN(tempMin) || isNaN(tempMax)) errors.push('Temperature values must be valid numbers');
    else {
      if (tempMin < VALIDATION_RANGES.temperature.min || tempMin > VALIDATION_RANGES.temperature.max)
        errors.push(`Minimum temperature must be between ${VALIDATION_RANGES.temperature.min}°C and ${VALIDATION_RANGES.temperature.max}°C`);
      if (tempMax < VALIDATION_RANGES.temperature.min || tempMax > VALIDATION_RANGES.temperature.max)
        errors.push(`Maximum temperature must be between ${VALIDATION_RANGES.temperature.min}°C and ${VALIDATION_RANGES.temperature.max}°C`);
      if (tempMin > tempMax) errors.push('Minimum temperature cannot be higher than maximum temperature');
    }

    if (data.trackConditionIndex < VALIDATION_RANGES.trackCondition.min || 
        data.trackConditionIndex > VALIDATION_RANGES.trackCondition.max) {
      errors.push(`Track condition must be between ${VALIDATION_RANGES.trackCondition.min} and ${VALIDATION_RANGES.trackCondition.max}`);
    }

    const performanceInputs = {
      'Fuel consumption': data.fuelConsumptionPerStint,
      'Stint performance': data.stintPerformance,
      'Tyre degradation': data.tyreDegradationPerStint
    };

    Object.entries(performanceInputs).forEach(([label, value]) => {
      if (value < VALIDATION_RANGES.performance.min || value > VALIDATION_RANGES.performance.max) {
        errors.push(`${label} must be between ${VALIDATION_RANGES.performance.min} and ${VALIDATION_RANGES.performance.max}`);
      }
    });

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      alert('Please correct the following errors:\n' + validationErrors.join('\n'));
      return;
    }

    try {
      const tempMin = parseInt(formData.trackTempMin);
      const tempMax = parseInt(formData.trackTempMax);

      const backendData = {
        eventYear: parseInt(formData.eventYear),
        EventName: formData.track,
        Team: formData.team,
        Driver: formData.driver,
        meanAirTemp: (tempMin + tempMax) / 2,
        Rainfall: formData.rainfall,
        trackConditionIndex: Math.min(10, Math.max(1, formData.trackConditionIndex)),
        fuelConsumptionPerStint: Math.min(1, Math.max(0, formData.fuelConsumptionPerStint)),
        stintPerformance: Math.min(1, Math.max(0, formData.stintPerformance)),
        tyreDegradationPerStint: Math.min(1, Math.max(0, formData.tyreDegradationPerStint))
      };

      const response = await axios.post('http://localhost:8000/predict', backendData);

      if (response.data) {
        const prediction = {
          totalPitStops: response.data["Total Pit Stops"],
          pitStopLaps: response.data["Pit Stop Laps"],
          tireStrategy: response.data["Tire Strategy"]
        };
        onSubmit(prediction);
      } else {
        throw new Error('No data received from the backend');
      }

    } catch (error) {
      console.error('Prediction error:', error);
      if (error.response) {
        if (error.response.status === 404) alert('No matching race found.');
        else if (error.response.status === 422) alert('Invalid input data.');
        else alert(`Server error: ${error.response.data.detail || 'Unknown error'}`);
      } else alert('An unexpected error occurred.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
      {/* Form fields here */}
    </form>
  );
};

export default InputForm;
