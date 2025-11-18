import { Droplets, Thermometer, Waves, Droplet, Fan, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import SensorCard from './SensorCard';
import ActuatorCard from './ActuatorCard';
import AlertCard from './AlertCard';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const { sensorData, actuatorStatus, lastAlert, config, controlPump, controlFan } = useApp();
  const [previousData, setPreviousData] = useState(sensorData);

  // Update previous data for trend calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviousData(sensorData);
    }, 5000);
    return () => clearTimeout(timer);
  }, [sensorData]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Alert Section - FR 1.4 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">System Alerts</h2>
        <AlertCard alert={lastAlert} />
      </section>

      {/* Real-time Sensor Monitoring - FR 1.1 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Real-Time Sensors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SensorCard
            title="Soil Moisture"
            value={sensorData.soilMoisture}
            unit="%"
            icon={Droplets}
            color="blue"
            threshold={config.soilMoisture}
            previousValue={previousData.soilMoisture}
          />
          <SensorCard
            title="Temperature"
            value={sensorData.temperature}
            unit="°C"
            icon={Thermometer}
            color="orange"
            threshold={config.temperature}
            previousValue={previousData.temperature}
          />
          <SensorCard
            title="Humidity"
            value={sensorData.humidity}
            unit="%"
            icon={Droplet}
            color="cyan"
            threshold={null}
            previousValue={previousData.humidity}
          />
          <SensorCard
            title="Water Level"
            value={sensorData.waterLevel}
            unit="%"
            icon={Waves}
            color="indigo"
            threshold={config.waterLevel}
            previousValue={previousData.waterLevel}
          />
        </div>

        {/* Last Update Time */}
        {sensorData.timestamp && (
          <p className="text-xs text-gray-500 text-center mt-3">
            Last updated: {new Date(sensorData.timestamp).toLocaleString()}
          </p>
        )}
      </section>

      {/* Actuator Status - FR 1.3 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Actuator Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActuatorCard
            title="Water Pump"
            status={actuatorStatus.waterPump.status}
            mode={actuatorStatus.waterPump.mode}
            icon={Zap}
            color="blue"
            previewOnly={true}
          />
          <ActuatorCard
            title="Cooling Fan"
            status={actuatorStatus.coolingFan.status}
            mode={actuatorStatus.coolingFan.mode}
            icon={Fan}
            color="teal"
            previewOnly={true}
          />
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600">Avg Soil</p>
            <p className="text-lg font-bold text-blue-600">{sensorData.soilMoisture.toFixed(0)}%</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600">Avg Temp</p>
            <p className="text-lg font-bold text-orange-600">{sensorData.temperature.toFixed(1)}°C</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600">Water</p>
            <p className="text-lg font-bold text-indigo-600">{sensorData.waterLevel.toFixed(0)}%</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600">Status</p>
            <p className="text-lg font-bold text-green-600">
              {actuatorStatus.waterPump.status || actuatorStatus.coolingFan.status ? 'Active' : 'Idle'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
