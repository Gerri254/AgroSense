import { useState } from 'react';
import { Save, RefreshCw, Phone, Sliders } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Settings = () => {
  const { config, updateConfig, actuatorStatus, controlPump, controlFan } = useApp();
  const [localConfig, setLocalConfig] = useState(config);
  const [gsmNumber, setGsmNumber] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    const defaultConfig = {
      minSoilMoisture: 30,
      maxSoilMoisture: 70,
      minTemperature: 15,
      maxTemperature: 35,
      minWaterLevel: 20,
      maxHumidity: 80
    };
    setLocalConfig(defaultConfig);
  };

  const togglePumpMode = () => {
    const newMode = actuatorStatus.waterPump.mode === 'auto' ? 'manual' : 'auto';
    if (newMode === 'auto') {
      controlPump(false, 'auto');
    }
  };

  const toggleFanMode = () => {
    const newMode = actuatorStatus.coolingFan.mode === 'auto' ? 'manual' : 'auto';
    if (newMode === 'auto') {
      controlFan(false, 'auto');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Threshold Settings - FR 2.1 */}
      <section className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Sliders className="w-6 h-6 text-agro-green" />
          <h2 className="text-lg font-semibold text-gray-800">Threshold Configuration</h2>
        </div>

        <div className="space-y-6">
          {/* Soil Moisture Thresholds */}
          <div className="border-b pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Soil Moisture Thresholds
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Minimum (%) - Start Irrigation
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={localConfig.minSoilMoisture}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      minSoilMoisture: Number(e.target.value)
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Maximum (%) - Stop Irrigation
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={localConfig.maxSoilMoisture || 70}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      maxSoilMoisture: Number(e.target.value)
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full relative">
              <div
                className="absolute h-2 bg-blue-500 rounded-full"
                style={{
                  left: `${localConfig.minSoilMoisture}%`,
                  width: `${(localConfig.maxSoilMoisture || 70) - localConfig.minSoilMoisture}%`
                }}
              ></div>
            </div>
          </div>

          {/* Temperature Thresholds */}
          <div className="border-b pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Temperature Thresholds
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Minimum (°C)
                </label>
                <input
                  type="number"
                  min="-50"
                  max="100"
                  value={localConfig.minTemperature || 15}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      minTemperature: Number(e.target.value)
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Maximum (°C) - Activate Fan
                </label>
                <input
                  type="number"
                  min="-50"
                  max="100"
                  value={localConfig.maxTemperature}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      maxTemperature: Number(e.target.value)
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Water Level Threshold */}
          <div className="border-b pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Water Level Threshold
            </label>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Minimum (%) - Low Water Alert
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={localConfig.minWaterLevel}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    minWaterLevel: Number(e.target.value)
                  })
                }
                className="input-field"
              />
            </div>
          </div>

          {/* Save/Reset Buttons */}
          <div className="flex space-x-3">
            <button onClick={handleSave} className="flex-1 btn-primary flex items-center justify-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
            <button onClick={handleReset} className="btn-secondary flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {saved && (
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <p className="text-sm text-green-700 font-medium">✓ Configuration saved successfully!</p>
            </div>
          )}
        </div>
      </section>

      {/* Automation Mode Control */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Automation Control</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-800">Water Pump Mode</h3>
              <p className="text-xs text-gray-600">
                {actuatorStatus.waterPump.mode === 'auto'
                  ? 'Automatic irrigation based on soil moisture'
                  : 'Manual control only'}
              </p>
            </div>
            <button
              onClick={togglePumpMode}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                actuatorStatus.waterPump.mode === 'auto'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              {actuatorStatus.waterPump.mode === 'auto' ? 'Auto' : 'Manual'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-800">Cooling Fan Mode</h3>
              <p className="text-xs text-gray-600">
                {actuatorStatus.coolingFan.mode === 'auto'
                  ? 'Automatic cooling based on temperature'
                  : 'Manual control only'}
              </p>
            </div>
            <button
              onClick={toggleFanMode}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                actuatorStatus.coolingFan.mode === 'auto'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              {actuatorStatus.coolingFan.mode === 'auto' ? 'Auto' : 'Manual'}
            </button>
          </div>
        </div>
      </section>

      {/* GSM Configuration - FR 2.3 */}
      <section className="card border-l-4 border-purple-500">
        <div className="flex items-center space-x-3 mb-4">
          <Phone className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-800">SMS Alert Configuration</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Configure phone number to receive critical SMS alerts (optional).
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (with country code)
          </label>
          <input
            type="tel"
            placeholder="+1234567890"
            value={gsmNumber}
            onChange={(e) => setGsmNumber(e.target.value)}
            className="input-field"
          />
          <button className="mt-3 btn-primary w-full md:w-auto">
            Save Phone Number
          </button>
        </div>
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-xs text-purple-700">
            📱 You will receive SMS alerts for critical events like low water level,
            extreme temperatures, and system failures.
          </p>
        </div>
      </section>

      {/* System Information */}
      <section className="card bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">System Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Device ID:</span>
            <span className="font-medium">ESP8266-01</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Firmware Version:</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dashboard Version:</span>
            <span className="font-medium">1.0.0</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
