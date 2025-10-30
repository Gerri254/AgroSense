import { Droplets, Thermometer, Wind, Waves, Zap, Fan } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const SensorGrid = () => {
  const { sensorData, actuatorStatus } = useApp();

  const sensors = [
    {
      id: 'soil',
      title: 'Soil Moisture',
      value: sensorData.soilMoisture,
      unit: '%',
      icon: Droplets,
      className: 'sensor-card-soil',
      status: 'Optimal Range'
    },
    {
      id: 'temp',
      title: 'Temperature',
      value: sensorData.temperature,
      unit: '°C',
      icon: Thermometer,
      className: 'sensor-card-temp',
      status: 'Normal'
    },
    {
      id: 'humidity',
      title: 'Humidity',
      value: sensorData.humidity,
      unit: '%',
      icon: Wind,
      className: 'sensor-card-humidity',
      status: 'Good'
    },
    {
      id: 'water',
      title: 'Water Level',
      value: sensorData.waterLevel,
      unit: '%',
      icon: Waves,
      className: 'sensor-card-water',
      status: 'Sufficient'
    },
    {
      id: 'pump',
      title: 'Water Pump',
      value: actuatorStatus.waterPump.status ? 'ON' : 'OFF',
      unit: '',
      icon: Zap,
      className: 'sensor-card-pump',
      status: actuatorStatus.waterPump.mode
    },
    {
      id: 'fan',
      title: 'Cooling Fan',
      value: actuatorStatus.coolingFan.status ? 'ON' : 'OFF',
      unit: '',
      icon: Fan,
      className: 'sensor-card-fan',
      status: actuatorStatus.coolingFan.mode
    },
  ];

  return (
    <div className="sensor-grid-section">
      <h1>System Overview</h1>
      <div className="sensor-grid-container">
        {sensors.map((sensor) => {
          const Icon = sensor.icon;
          const isActuator = sensor.id === 'pump' || sensor.id === 'fan';
          const displayValue = isActuator
            ? sensor.value
            : typeof sensor.value === 'number'
              ? sensor.value.toFixed(1)
              : '0.0';

          return (
            <div key={sensor.id} className={`sensor-card ${sensor.className}`}>
              <div className="sensor-card-header">
                <span className="sensor-card-title">{sensor.title}</span>
                <Icon className="sensor-card-icon" />
              </div>
              <div className="sensor-card-value">
                {displayValue}
                <span className="sensor-card-unit">{sensor.unit}</span>
              </div>
              <div className="sensor-card-status">{sensor.status}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SensorGrid;
