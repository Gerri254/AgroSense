import { Droplets, Thermometer, Waves } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ThresholdStatus = () => {
  const { sensorData, config } = useApp();

  const thresholds = [
    {
      id: 'soil',
      title: 'Soil Moisture',
      current: sensorData.soilMoisture,
      target: `Min: ${config.minSoilMoisture}%`,
      unit: '%',
      icon: Droplets,
      className: 'threshold-card-large'
    },
    {
      id: 'temp',
      title: 'Temperature',
      current: sensorData.temperature,
      target: `Max: ${config.maxTemperature}°C`,
      unit: '°C',
      icon: Thermometer,
      className: 'threshold-card-medium'
    },
    {
      id: 'water',
      title: 'Water Level',
      current: sensorData.waterLevel,
      target: `Min: ${config.minWaterLevel}%`,
      unit: '%',
      icon: Waves,
      className: 'threshold-card-small'
    },
  ];

  return (
    <div className="threshold-status">
      <h1>Threshold Status</h1>
      <div className="threshold-container">
        {thresholds.map((item) => {
          const Icon = item.icon;
          const currentValue = typeof item.current === 'number' ? item.current.toFixed(1) : '0.0';

          return (
            <div key={item.id} className={`threshold-card ${item.className}`}>
              <div className="threshold-info">
                <h3>{item.title}</h3>
                <p><strong>Current:</strong> {currentValue}{item.unit}</p>
                <p><strong>Target:</strong> {item.target}</p>
              </div>
              <Icon className="threshold-icon" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThresholdStatus;
