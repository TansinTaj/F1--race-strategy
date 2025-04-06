import React from 'react';

const PredictionOutput = ({ data }) => {
  return (
    <div className="prediction-output">
      <div className="total-pitstops">
        <h2>Total Pit Stops</h2>
        <div className="pitstop-number">{data.totalPitStops || '-'}</div>
      </div>

      <div className="pitstop-strategy">
        <h2>Pit Stop Lap</h2>
        <table>
          <thead>
            <tr>
              <th>Pit Stop Lap</th>
              <th>Tyre Compound</th>
            </tr>
          </thead>
          <tbody>
            {data.pitStopStrategy.map((stop, index) => (
              <tr key={index}>
                <td>{stop.lap}</td>
                <td>{stop.compound}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PredictionOutput;