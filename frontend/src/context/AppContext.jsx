/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';
import socketService from '../services/socketService';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Backend connection state
  const [backendConnected, setBackendConnected] = useState(false);

  // Device status
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  // Sensor data
  const [sensorData, setSensorData] = useState({
    soilMoisture: 0,
    temperature: 0,
    humidity: 0,
    waterLevel: 0,
    timestamp: null
  });

  // Actuator status
  const [actuatorStatus, setActuatorStatus] = useState({
    waterPump: { status: false, mode: 'auto' },
    coolingFan: { status: false, mode: 'auto' }
  });

  // Alerts
  const [alerts, setAlerts] = useState([]);
  const [lastAlert, setLastAlert] = useState(null);

  // Configuration/Thresholds
  const [config, setConfig] = useState({
    minSoilMoisture: 30,
    maxSoilMoisture: 70,
    minTemperature: 15,
    maxTemperature: 35,
    minWaterLevel: 20,
    maxHumidity: 80
  });

  // Historical data (mock for now - would come from backend/localStorage)
  const [historicalData, setHistoricalData] = useState([]);

  // Action logs
  const [actionLogs, setActionLogs] = useState([]);

  // Initialize backend connection
  useEffect(() => {
    if (isAuthenticated) {
      connectToBackend();
    }

    return () => {
      socketService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const connectToBackend = async () => {
    try {
      // Check backend health
      const health = await apiService.checkHealth();
      console.log('✅ Backend health:', health);
      setBackendConnected(health.status === 'OK');

      // Connect to WebSocket
      socketService.connect();

      // Subscribe to WebSocket events
      socketService.on('connection', (data) => {
        setBackendConnected(data.connected);
      });

      // Subscribe to real-time sensor data
      socketService.on('sensor-data', (data) => {
        setSensorData({
          soilMoisture: data.soilMoisture || 0,
          temperature: data.temperature || 0,
          humidity: data.humidity || 0,
          waterLevel: data.waterLevel || 0,
          timestamp: new Date(data.timestamp)
        });

        setDeviceOnline(true);
        setLastSeen(new Date());

        // Add to historical data
        addToHistoricalData(data);
      });

      // Subscribe to actuator status
      socketService.on('actuator-status', (data) => {
        setActuatorStatus(prev => ({
          waterPump: {
            ...prev.waterPump,
            ...(data.waterPump || {}),
            mode: data.waterPump?.mode || prev.waterPump?.mode || 'auto'
          },
          coolingFan: {
            ...prev.coolingFan,
            ...(data.coolingFan || {}),
            mode: data.coolingFan?.mode || prev.coolingFan?.mode || 'auto'
          }
        }));
      });

      // Subscribe to actuator mode changes
      socketService.on('actuator-mode-change', (data) => {
        console.log('🔧 Mode change received:', data);
        setActuatorStatus(prev => ({
          ...prev,
          [data.actuator === 'pump' ? 'waterPump' : 'coolingFan']: {
            ...prev[data.actuator === 'pump' ? 'waterPump' : 'coolingFan'],
            mode: data.mode
          }
        }));
      });

      // Subscribe to device status
      socketService.on('device-status', (data) => {
        setDeviceOnline(data.online);
        setLastSeen(new Date(data.lastSeen));
      });

      // Subscribe to alerts
      socketService.on('alert', (alert) => {
        const newAlert = {
          id: alert._id || Date.now(),
          ...alert,
          timestamp: new Date(alert.timestamp)
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 50));
        setLastAlert(newAlert);
      });

      // Load initial data from backend
      await loadInitialData();

    } catch (error) {
      console.error('❌ Backend connection error:', error);
      setBackendConnected(false);
    }
  };

  const loadInitialData = async () => {
    try {
      // Load current sensor data
      const currentData = await apiService.getCurrentSensorData();
      if (currentData) {
        setSensorData({
          soilMoisture: currentData.soilMoisture || 0,
          temperature: currentData.temperature || 0,
          humidity: currentData.humidity || 0,
          waterLevel: currentData.waterLevel || 0,
          timestamp: new Date(currentData.timestamp)
        });
      }

      // Load historical data
      const historyResponse = await apiService.getSensorHistory({ limit: 100 });
      if (historyResponse && historyResponse.data) {
        setHistoricalData(historyResponse.data);
      }

      // Load latest alert
      const latestAlert = await apiService.getLatestAlert();
      if (latestAlert && latestAlert._id) {
        setLastAlert(latestAlert);
      }

      // Load settings/thresholds
      const settings = await apiService.getSettings();
      if (settings && settings.thresholds) {
        setConfig(settings.thresholds);
      }

      // Load action logs
      const logsResponse = await apiService.getActuatorLogs({ limit: 50 });
      if (logsResponse && logsResponse.data) {
        setActionLogs(logsResponse.data);
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const addToHistoricalData = (data) => {
    const newDataPoint = {
      timestamp: new Date().toISOString(),
      ...data
    };

    setHistoricalData(prev => {
      const updated = [...prev, newDataPoint].slice(-1000);

      // Store in localStorage
      try {
        localStorage.setItem('historicalData', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save historical data:', error);
      }

      return updated;
    });
  };

  // Load historical data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('historicalData');
      if (stored) {
        setHistoricalData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load historical data:', error);
    }

    const storedLogs = localStorage.getItem('actionLogs');
    if (storedLogs) {
      try {
        setActionLogs(JSON.parse(storedLogs));
      } catch (error) {
        console.error('Failed to load action logs:', error);
      }
    }
  }, []);

  // Control actuators via backend API
  const controlPump = async (status, mode = 'manual') => {
    try {
      const response = await apiService.controlPump(status, mode);
      console.log('🚰 Pump control response:', response);

      // Update local state optimistically
      setActuatorStatus(prev => ({
        ...prev,
        waterPump: { status, mode }
      }));

      return response;
    } catch (error) {
      console.error('Error controlling pump:', error);
      throw error;
    }
  };

  const controlFan = async (status, mode = 'manual') => {
    try {
      const response = await apiService.controlFan(status, mode);
      console.log('💨 Fan control response:', response);

      // Update local state optimistically
      setActuatorStatus(prev => ({
        ...prev,
        coolingFan: { status, mode }
      }));

      return response;
    } catch (error) {
      console.error('Error controlling fan:', error);
      throw error;
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      const response = await apiService.updateThresholds(newConfig);
      console.log('⚙️  Config update response:', response);

      setConfig(newConfig);

      // Save to localStorage
      localStorage.setItem('config', JSON.stringify(newConfig));

      return response;
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  };

  // Login function
  const login = async (username, password) => {
    try {
      const response = await apiService.login(username, password);

      if (response.success && response.user) {
        setIsAuthenticated(true);
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    socketService.disconnect();
  };

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    const storedConfig = localStorage.getItem('config');
    if (storedConfig) {
      try {
        setConfig(JSON.parse(storedConfig));
      } catch (error) {
        console.error('Failed to parse stored config:', error);
      }
    }
  }, []);

  const value = {
    // Auth
    isAuthenticated,
    user,
    login,
    logout,

    // Backend connection
    backendConnected,

    // Device
    deviceOnline,
    lastSeen,

    // Sensor data
    sensorData,

    // Actuators
    actuatorStatus,
    controlPump,
    controlFan,

    // Alerts
    alerts,
    lastAlert,

    // Config
    config,
    updateConfig,

    // Historical data
    historicalData,

    // Action logs
    actionLogs
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
