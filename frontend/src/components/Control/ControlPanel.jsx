import { useState } from 'react';
import { Power, Fan, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ControlPanel = () => {
  const { actuatorStatus, controlPump, controlFan, sensorData, config } = useApp();
  const [showConfirm, setShowConfirm] = useState(null);

  const handlePumpToggle = () => {
    if (actuatorStatus.waterPump.mode === 'auto') {
      alert('Cannot manually control pump in automatic mode. Switch to manual mode in settings.');
      return;
    }
    const newStatus = !actuatorStatus.waterPump.status;
    controlPump(newStatus, 'manual');
    setShowConfirm(null);
  };

  const handleFanToggle = () => {
    if (actuatorStatus.coolingFan.mode === 'auto') {
      alert('Cannot manually control fan in automatic mode. Switch to manual mode in settings.');
      return;
    }
    const newStatus = !actuatorStatus.coolingFan.status;
    controlFan(newStatus, 'manual');
    setShowConfirm(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-800">Manual Override Active</h3>
            <p className="text-xs text-yellow-700 mt-1">
              Manual controls are only available when actuators are in Manual Mode.
              Switch mode in Settings if needed.
            </p>
          </div>
        </div>
      </div>

      {/* Current Conditions */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Conditions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Soil Moisture</p>
            <p className="text-2xl font-bold text-blue-600">{sensorData.soilMoisture.toFixed(0)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              Min: {config.minSoilMoisture}%
            </p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Temperature</p>
            <p className="text-2xl font-bold text-orange-600">{sensorData.temperature.toFixed(1)}°C</p>
            <p className="text-xs text-gray-500 mt-1">
              Max: {config.maxTemperature}°C
            </p>
          </div>
          <div className="text-center p-3 bg-cyan-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Humidity</p>
            <p className="text-2xl font-bold text-cyan-600">{sensorData.humidity.toFixed(0)}%</p>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Water Level</p>
            <p className="text-2xl font-bold text-indigo-600">{sensorData.waterLevel.toFixed(0)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              Min: {config.minWaterLevel}%
            </p>
          </div>
        </div>
      </section>

      {/* Water Pump Control - FR 2.2 */}
      <section className="card border-l-4 border-blue-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Water Pump</h2>
              <p className="text-sm text-gray-600">
                Mode: <span className="font-medium">{actuatorStatus.waterPump.mode}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${
              actuatorStatus.waterPump.status ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            }`}></div>
            <span className={`text-lg font-bold ${
              actuatorStatus.waterPump.status ? 'text-green-600' : 'text-gray-500'
            }`}>
              {actuatorStatus.waterPump.status ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowConfirm('pump-on')}
            disabled={actuatorStatus.waterPump.mode === 'auto' || actuatorStatus.waterPump.status}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Power className="w-5 h-5" />
            <span>Turn ON</span>
          </button>
          <button
            onClick={() => setShowConfirm('pump-off')}
            disabled={actuatorStatus.waterPump.mode === 'auto' || !actuatorStatus.waterPump.status}
            className="w-full btn-danger disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Power className="w-5 h-5" />
            <span>Turn OFF</span>
          </button>
        </div>

        {actuatorStatus.waterPump.mode === 'auto' && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 text-center">
              🤖 Pump is in automatic mode based on soil moisture threshold
            </p>
          </div>
        )}
      </section>

      {/* Cooling Fan Control - FR 2.2 */}
      <section className="card border-l-4 border-teal-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Fan className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Cooling Fan</h2>
              <p className="text-sm text-gray-600">
                Mode: <span className="font-medium">{actuatorStatus.coolingFan.mode}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${
              actuatorStatus.coolingFan.status ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            }`}></div>
            <span className={`text-lg font-bold ${
              actuatorStatus.coolingFan.status ? 'text-green-600' : 'text-gray-500'
            }`}>
              {actuatorStatus.coolingFan.status ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowConfirm('fan-on')}
            disabled={actuatorStatus.coolingFan.mode === 'auto' || actuatorStatus.coolingFan.status}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Power className="w-5 h-5" />
            <span>Turn ON</span>
          </button>
          <button
            onClick={() => setShowConfirm('fan-off')}
            disabled={actuatorStatus.coolingFan.mode === 'auto' || !actuatorStatus.coolingFan.status}
            className="w-full btn-danger disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Power className="w-5 h-5" />
            <span>Turn OFF</span>
          </button>
        </div>

        {actuatorStatus.coolingFan.mode === 'auto' && (
          <div className="mt-3 p-3 bg-teal-50 rounded-lg">
            <p className="text-sm text-teal-700 text-center">
              🤖 Fan is in automatic mode based on temperature threshold
            </p>
          </div>
        )}
      </section>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Confirm Action</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to {showConfirm.includes('on') ? 'turn ON' : 'turn OFF'} the{' '}
              {showConfirm.includes('pump') ? 'Water Pump' : 'Cooling Fan'}?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (showConfirm.includes('pump')) {
                    handlePumpToggle();
                  } else {
                    handleFanToggle();
                  }
                }}
                className="flex-1 btn-primary"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
