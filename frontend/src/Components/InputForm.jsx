import React, { useState, useEffect } from "react";
import axios from "axios";

const InputForm = () => {
  const [formData, setFormData] = useState({
    track: "",
    year: "",
    team: "",
    driver: "",
    temperature: "",
    rainfall: "",
    tire_wear_rate: 0.5,
    fuel_consumption_rate: 0.5,
    pit_stop_time_loss: 0.5,
    average_lap_time: 0.5,
    lap_time_variance: 0.5,
  });

  const [tracks, setTracks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios.get("https://race-strategy-fastapi.onrender.com/get_options")
      .then(response => {
        setTracks(response.data.tracks);
        setTeams(response.data.teams);
        setDrivers(response.data.drivers);
      })
      .catch(error => {
        console.error("Error fetching options:", error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: parseFloat(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ["track", "year", "team", "driver", "temperature", "rainfall"];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("https://race-strategy-fastapi.onrender.com/predict_strategy", formData);
      console.log("Prediction result:", response.data);
      // TODO: Display the result in your UI
    } catch (error) {
      console.error("Error sending data to backend:", error);

      if (error.response) {
        // Backend returned an error response
        if (error.response.status === 404) {
          alert('Backend endpoint not found (404). Please check the server URL.');
        } else if (error.response.status === 500) {
          alert('Server error (500). Please try again later.');
        } else {
          alert(`Unexpected error from server: ${error.response.statusText}`);
        }
      } else if (error.request) {
        // No response received
        alert('No response from server. Please check your internet connection or server status.');
      } else {
        // Error setting up the request
        alert(`Error in setting up the request: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-form space-y-4">
      <select name="track" value={formData.track} onChange={handleChange} required>
        <option value="">Select Track</option>
        {tracks.map(track => (
          <option key={track} value={track}>{track}</option>
        ))}
      </select>

      <input
        type="number"
        name="year"
        placeholder="Enter Year"
        value={formData.year}
        onChange={handleChange}
        required
      />

      <select name="team" value={formData.team} onChange={handleChange} required>
        <option value="">Select Team</option>
        {teams.map(team => (
          <option key={team} value={team}>{team}</option>
        ))}
      </select>

      <select name="driver" value={formData.driver} onChange={handleChange} required>
        <option value="">Select Driver</option>
        {drivers.map(driver => (
          <option key={driver} value={driver}>{driver}</option>
        ))}
      </select>

      <input
        type="number"
        name="temperature"
        placeholder="Temperature (°C)"
        value={formData.temperature}
        onChange={handleChange}
        required
      />

      <select name="rainfall" value={formData.rainfall} onChange={handleChange} required>
        <option value="">Rainfall</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>

      {/* Sliders */}
      <label>
        Tire Wear Rate: {formData.tire_wear_rate}
        <input type="range" name="tire_wear_rate" min="0" max="1" step="0.01" value={formData.tire_wear_rate} onChange={handleSliderChange} />
      </label>

      <label>
        Fuel Consumption Rate: {formData.fuel_consumption_rate}
        <input type="range" name="fuel_consumption_rate" min="0" max="1" step="0.01" value={formData.fuel_consumption_rate} onChange={handleSliderChange} />
      </label>

      <label>
        Pit Stop Time Loss: {formData.pit_stop_time_loss}
        <input type="range" name="pit_stop_time_loss" min="0" max="1" step="0.01" value={formData.pit_stop_time_loss} onChange={handleSliderChange} />
      </label>

      <label>
        Average Lap Time: {formData.average_lap_time}
        <input type="range" name="average_lap_time" min="0" max="1" step="0.01" value={formData.average_lap_time} onChange={handleSliderChange} />
      </label>

      <label>
        Lap Time Variance: {formData.lap_time_variance}
        <input type="range" name="lap_time_variance" min="0" max="1" step="0.01" value={formData.lap_time_variance} onChange={handleSliderChange} />
      </label>

      <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded">
        {isLoading ? "Predicting..." : "Predict Race Strategy"}
      </button>
    </form>
  );
};

export default InputForm;
