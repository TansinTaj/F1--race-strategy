import React, { useState } from 'react';

const InputForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    track: '',
    year: '2024',
    team: '',
    driver: '',
    trackTempMin: '',
    trackTempMax: '',
    rainfall: ''
  });

  // Track options based on 2024 F1 calendar
  const tracks = [
    'Bahrain International Circuit',
    'Jeddah Corniche Circuit',
    'Albert Park Circuit',
    'Suzuka Circuit',
    'Shanghai International Circuit',
    'Miami International Autodrome',
    'Imola',
    'Monaco',
    'Circuit Gilles Villeneuve',
    'Circuit de Barcelona-Catalunya',
    'Red Bull Ring',
    'Silverstone',
    'Hungaroring',
    'Circuit de Spa-Francorchamps',
    'Zandvoort',
    'Monza',
    'Marina Bay Street Circuit',
    'Circuit of the Americas',
    'Autódromo Hermanos Rodríguez',
    'Interlagos',
    'Las Vegas Strip Circuit',
    'Yas Marina Circuit'
  ];

  // F1 teams for 2024
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

  // Driver options based on teams
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

  // Rainfall options
  const rainfallOptions = [
    'No Rain',
    'Light Rain',
    'Medium Rain',
    'Heavy Rain'
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
      // Reset driver when team changes
      ...(name === 'team' ? { driver: '' } : {})
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
            <option value="2024">2024</option>
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
              <option key={driver} value={driver}>{driver}</option>
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