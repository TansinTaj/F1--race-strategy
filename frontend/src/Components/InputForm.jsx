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

  const tracks = [Abu Dhabi Grand Prix', 'Australian Grand Prix', 'Austrian Grand Prix', 'Azerbaijan Grand Prix', 'Bahrain Grand Prix', 'Belgian Grand Prix', 'Brazilian Grand Prix', 'British Grand Prix', 'Canadian Grand Prix', 'Chinese Grand Prix', 'Dutch Grand Prix', 'Eifel Grand Prix', 'Emilia Romagna Grand Prix', 'French Grand Prix', 'German Grand Prix', 'Hungarian Grand Prix', 'Italian Grand Prix', 'Japanese Grand Prix', 'Mexican Grand Prix', 'Mexico City Grand Prix', 'Miami Grand Prix', 'Monaco Grand Prix', 'Portuguese Grand Prix', 'Qatar Grand Prix', 'Russian Grand Prix', 'Sakhir Grand Prix', 'Singapore Grand Prix', 'Spanish Grand Prix', 'Styrian Grand Prix', 'São Paulo Grand Prix', 'Turkish Grand Prix', 'Tuscan Grand Prix', 'United States Grand Prix']; // trimmed for brevity
  const years = ['2018', '2019', '2020', '2021', '2022'];
  const teams = ['Alfa Romeo', 'Alfa Romeo Racing', 'AlphaTauri', 'Alpine', 'Aston Martin', 'Ferrari', 'Force India', 'Haas F1 Team', 'McLaren', 'Mercedes', 'Racing Point', 'Red Bull Racing', 'Renault', 'Sauber', 'Toro Rosso', 'Williams']; 
 const driverOptions = {
    'Alfa Romeo': ['BOT', 'ZHO'],
    'Alfa Romeo Racing': ['GIO', 'KUB', 'RAI'],
    'AlphaTauri': ['GAS', 'KVY', 'TSU'],
    'Alpine': ['ALO', 'OCO'],
    'Aston Martin': ['HUL', 'STR', 'VET'],
    'Ferrari': ['LEC', 'RAI', 'SAI', 'VET'],
    'Force India': ['OCO', 'PER'],
    'Haas F1 Team': ['GRO', 'MAG', 'MAZ', 'MSC'],
    'McLaren': ['ALO', 'NOR', 'RIC', 'SAI', 'VAN'],
    'Mercedes': ['BOT', 'HAM', 'RUS'],
    'Racing Point': ['HUL', 'PER', 'STR'],
    'Red Bull Racing': ['ALB', 'GAS', 'PER', 'RIC', 'VER'],
    'Renault': ['HUL', 'OCO', 'RIC', 'SAI'],
    'Sauber': ['ERI', 'LEC'],
    'Toro Rosso': ['ALB', 'GAS', 'HAR', 'KVY'],
    'Williams': ['ALB', 'KUB', 'LAT', 'RUS', 'SIR', 'STR']
  };

  const driverInfo = {
    'ALB': {
      name: 'Alexander Albon',
      history: {
        'Toro Rosso': '2019 (First half)',
        'Red Bull Racing': '2019-2020',
        'Williams': '2022'
      }
    },
    'ALO': {
      name: 'Fernando Alonso',
      history: {
        'McLaren': '2018',
        'Alpine': '2021-2022'
      }
    },
    'BOT': {
      name: 'Valtteri Bottas',
      history: {
        'Mercedes': '2018-2021',
        'Alfa Romeo': '2022'
      }
    },
    'ERI': {
      name: 'Marcus Ericsson',
      history: {
        'Sauber': '2018'
      }
    },
    'GAS': {
      name: 'Pierre Gasly',
      history: {
        'Toro Rosso': '2018, 2019 (Second half)',
        'Red Bull Racing': '2019 (First half)',
        'AlphaTauri': '2020-2022'
      }
    },
    'GIO': {
      name: 'Antonio Giovinazzi',
      history: {
        'Alfa Romeo Racing': '2019-2021'
      }
    },
    'GRO': {
      name: 'Romain Grosjean',
      history: {
        'Haas F1 Team': '2018-2020'
      }
    },
    'HAM': {
      name: 'Lewis Hamilton',
      history: {
        'Mercedes': '2018-2022'
      }
    },
    'HAR': {
      name: 'Brendon Hartley',
      history: {
        'Toro Rosso': '2018'
      }
    },
    'HUL': {
      name: 'Nico Hulkenberg',
      history: {
        'Renault': '2018-2019',
        'Racing Point': '2020 (Substitute)',
        'Aston Martin': '2022 (First 2 races)'
      }
    },
    'KUB': {
      name: 'Robert Kubica',
      history: {
        'Williams': '2019',
        'Alfa Romeo Racing': '2021 (2 races)'
      }
    },
    'KVY': {
      name: 'Daniil Kvyat',
      history: {
        'Toro Rosso': '2019',
        'AlphaTauri': '2020'
      }
    },
    'LAT': {
      name: 'Nicholas Latifi',
      history: {
        'Williams': '2020-2022'
      }
    },
    'LEC': {
      name: 'Charles Leclerc',
      history: {
        'Sauber': '2018',
        'Ferrari': '2019-2022'
      }
    },
    'MAG': {
      name: 'Kevin Magnussen',
      history: {
        'Haas F1 Team': '2018-2020, 2022'
      }
    },
    'MAZ': {
      name: 'Nikita Mazepin',
      history: {
        'Haas F1 Team': '2021'
      }
    },
    'MSC': {
      name: 'Mick Schumacher',
      history: {
        'Haas F1 Team': '2021-2022'
      }
    },
    'NOR': {
      name: 'Lando Norris',
      history: {
        'McLaren': '2019-2022'
      }
    },
    'OCO': {
      name: 'Esteban Ocon',
      history: {
        'Force India': '2018',
        'Renault': '2020',
        'Alpine': '2021-2022'
      }
    },
    'PER': {
      name: 'Sergio Perez',
      history: {
        'Force India': '2018',
        'Racing Point': '2019-2020',
        'Red Bull Racing': '2021-2022'
      }
    },
    'RAI': {
      name: 'Kimi Räikkönen',
      history: {
        'Ferrari': '2018',
        'Alfa Romeo Racing': '2019-2021'
      }
    },
    'RIC': {
      name: 'Daniel Ricciardo',
      history: {
        'Red Bull Racing': '2018',
        'Renault': '2019-2020',
        'McLaren': '2021-2022'
      }
    },
    'RUS': {
      name: 'George Russell',
      history: {
        'Williams': '2019-2021',
        'Mercedes': '2020 (Sakhir GP), 2022'
      }
    },
    'SAI': {
      name: 'Carlos Sainz',
      history: {
        'Renault': '2018',
        'McLaren': '2019-2020',
        'Ferrari': '2021-2022'
      }
    },
    'SIR': {
      name: 'Sergey Sirotkin',
      history: {
        'Williams': '2018'
      }
    },
    'STR': {
      name: 'Lance Stroll',
      history: {
        'Williams': '2018',
        'Racing Point': '2019-2020',
        'Aston Martin': '2021-2022'
      }
    },
    'TSU': {
      name: 'Yuki Tsunoda',
      history: {
        'AlphaTauri': '2021-2022'
      }
    },
    'VAN': {
      name: 'Stoffel Vandoorne',
      history: {
        'McLaren': '2018'
      }
    },
    'VER': {
      name: 'Max Verstappen',
      history: {
        'Red Bull Racing': '2018-2022'
      }
    },
    'VET': {
      name: 'Sebastian Vettel',
      history: {
        'Ferrari': '2018-2020',
        'Aston Martin': '2021-2022'
      }
    },
    'ZHO': {
      name: 'Zhou Guanyu',
      history: {
        'Alfa Romeo': '2022'
      }
    }
  };
  
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
