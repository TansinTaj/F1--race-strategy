import React, { useState } from 'react';
import { driverOptions as driverCodeMap } from "./DriverOptions"; // adjust path if needed

const InputForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    track: '',
    year: '',
    team: '',
    driver: '',
    trackTempMin: '',
    trackTempMax: '',
    rainfall: ''
  });

  const years = ['2018', '2019', '2020', '2021', '2022'];

  const tracks = [
    'Abu Dhabi Grand Prix', 
    'Australian Grand Prix', 
    'Austrian Grand Prix', 
    'Azerbaijan Grand Prix', 
    'Bahrain Grand Prix', 
    'Belgian Grand Prix', 
    'Brazilian Grand Prix', 
    'British Grand Prix', 
    'Canadian Grand Prix', 
    'Chinese Grand Prix',
    'Dutch Grand Prix', 
    'Eifel Grand Prix', 
    'Emilia Romagna Grand Prix', 
    'French Grand Prix', 
    'German Grand Prix', 
    'Hungarian Grand Prix', 
    'Italian Grand Prix', 
    'Japanese Grand Prix', 
    'Mexican Grand Prix', 
    'Mexico City Grand Prix', 
    'Miami Grand Prix', 
    'Monaco Grand Prix', 
    'Portuguese Grand Prix', 
    'Qatar Grand Prix', 
    'Russian Grand Prix', 
    'Sakhir Grand Prix', 
    'Singapore Grand Prix', 
    'Spanish Grand Prix', 
    'Styrian Grand Prix', 
    'São Paulo Grand Prix', 
    'Turkish Grand Prix', 
    'Tuscan Grand Prix', 
    'United States Grand Prix'
  ];

  const teams = [
    'Red Bull Racing',
    'Mercedes',
    'Ferrari',
    'McLaren',
    'Aston Martin',
    'Alpine',
    'Williams',
    'Visa Cash App RB',
    'Stake F1 Team',
    'Haas F1 Team'
  ];

  const driverOptions = {
    'Red Bull Racing': ['Max Verstappen', 'Sergio Perez'],
    'Mercedes': ['Lewis Hamilton', 'George Russell'],
    'Ferrari': ['Charles Leclerc', 'Carlos Sainz'],
    'McLaren': ['Lando Norris', 'Oscar Piastri'],
    'Aston Martin': ['Fernando Alonso', 'Lance Stroll'],
    'Alpine': ['Esteban Ocon', 'Pierre Gasly'],
    'Williams': ['Alex Albon', 'Logan Sargeant'],
    'Visa Cash App RB': ['Yuki Tsunoda', 'Daniel Ricciardo'],
    'Stake F1 Team': ['Valtteri Bottas', 'Zhou Guanyu'],
    'Haas F1 Team': ['Kevin Magnussen', 'Nico Hülkenberg']
  };

  const rainfallOptions = ['No Rain', 'Rain'];

  const getDriverCode = (fullName) => {
    const match = driverCodeMap.find(d => d.label === fullName);
    return match ? match.value : fullName;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
      ...(name === 'team' ? { driver: '' } : {})
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const meanAirTemp = (
      (parseFloat(formData.trackTempMin) + parseFloat(formData.trackTempMax)) / 2
    ).toFixed(2);

    const rainfallValue = formData.rainfall === 'No Rain' ? 0 : 1;

    onSubmit({
      eventYear: parseInt(formData.year),
      EventName: formData.track,
      Team: formData.team,
      Driver: formData.driver,
      meanAirTemp: parseFloat(meanAirTemp),
      Rainfall: rainfallValue
    });
  };

  return (
    <div className="input-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Track</label>
          <select
            name="track"
            value={formData.track}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select track</option>
            {tracks.map(track => (
              <option key={track} value={track}>{track}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Year</label>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Team</label>
          <select
            name="team"
            value={formData.team}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select team</option>
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Driver</label>
          <select
            name="driver"
            value={formData.driver}
            onChange={handleChange}
            required
            disabled={!formData.team}
          >
            <option value="" disabled>Select driver</option>
            {formData.team && driverOptions[formData.team].map(driver => (
              <option key={driver} value={getDriverCode(driver)}>{driver}</option>
            ))}
          </select>
        </div>

        <div className="temperature-inputs">
          <div className="form-group">
            <label>Track Temp (°C)</label>
            <div className="temp-range">
              <input
                type="number"
                name="trackTempMin"
                placeholder="Min"
                value={formData.trackTempMin}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="trackTempMax"
                placeholder="Max"
                value={formData.trackTempMax}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Rainfall</label>
          <select
            name="rainfall"
            value={formData.rainfall}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select option</option>
            {rainfallOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="predict-button">PREDICT</button>
      </form>
    </div>
  );
};

export default InputForm;
