import { useApp } from '../../context/AppContext';

const SystemHealth = () => {
  const { deviceOnline, mqttConnected, sensorData } = useApp();

  // Calculate health percentage
  const calculateHealth = () => {
    let health = 0;
    if (deviceOnline) health += 40;
    if (mqttConnected) health += 40;
    if (sensorData.timestamp) health += 20;
    return health;
  };

  const healthPercentage = calculateHealth();

  // Count active sensors
  const activeSensors = [
    sensorData.soilMoisture > 0,
    sensorData.temperature > 0,
    sensorData.humidity > 0,
    sensorData.waterLevel > 0
  ].filter(Boolean).length;

  return (
    <div className="system-health">
      <h1>System Health</h1>
      <div className="system-health-container">
        <div className="health-circle" style={{ '--progress': `${healthPercentage}%` }}>
          <h2>
            {healthPercentage}
            <small>%</small>
          </h2>
        </div>
        <div className="health-stats">
          <p>
            <span>Status:</span> {deviceOnline ? 'Online' : 'Offline'}
          </p>
          <p>
            <span>Connection:</span> {mqttConnected ? 'Active' : 'Disconnected'}
          </p>
          <p>
            <span>Sensors:</span> {activeSensors}/4
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
