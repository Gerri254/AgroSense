import { Sprout, Wifi, WifiOff, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Header = () => {
  const { deviceOnline, mqttConnected, logout, lastSeen } = useApp();

  const getTimeSinceLastSeen = () => {
    if (!lastSeen) return 'Never';
    const seconds = Math.floor((new Date() - lastSeen) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <header className="bg-gradient-to-r from-agro-green to-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Sprout className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Smart Agriculture</h1>
              <p className="text-xs text-green-100">IoT Monitoring System</p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-4">
            {/* Device Status */}
            <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2">
              {deviceOnline ? (
                <>
                  <div className="status-indicator status-online"></div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-medium">Device Online</p>
                    <p className="text-xs text-green-100">{getTimeSinceLastSeen()}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="status-indicator status-offline"></div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-medium">Device Offline</p>
                    <p className="text-xs text-red-100">{getTimeSinceLastSeen()}</p>
                  </div>
                </>
              )}
            </div>

            {/* MQTT Connection Status */}
            <div className="flex items-center space-x-1 bg-white/20 rounded-lg px-3 py-2">
              {mqttConnected ? (
                <Wifi className="w-5 h-5" title="MQTT Connected" />
              ) : (
                <WifiOff className="w-5 h-5" title="MQTT Disconnected" />
              )}
              <span className="text-xs hidden md:inline">
                {mqttConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
