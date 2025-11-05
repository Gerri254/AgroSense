// Backend API Configuration
export const API_CONFIG = {
  // Backend API URL
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',

  // WebSocket URL
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:5000',

  // API Endpoints
  ENDPOINTS: {
    // Health
    HEALTH: '/health',

    // Authentication
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',

    // Sensors
    SENSORS_CURRENT: '/api/sensors/current',
    SENSORS_HISTORY: '/api/sensors/history',
    SENSORS_AGGREGATED: '/api/sensors/aggregated',
    SENSORS_STATS: '/api/sensors/stats',

    // Actuators
    PUMP_CONTROL: '/api/actuators/pump/control',
    FAN_CONTROL: '/api/actuators/fan/control',
    ACTUATOR_LOGS: '/api/actuators/logs',
    ACTUATOR_STATS: '/api/actuators/stats',

    // Alerts
    ALERTS: '/api/alerts',
    ALERTS_LATEST: '/api/alerts/latest',
    ALERT_ACKNOWLEDGE: '/api/alerts/:id/acknowledge',
    ALERTS_ACKNOWLEDGE_ALL: '/api/alerts/acknowledge-all',
    ALERTS_STATS: '/api/alerts/stats',

    // Settings
    SETTINGS: '/api/settings',
    SETTINGS_THRESHOLDS: '/api/settings/thresholds',
    SETTINGS_GSM: '/api/settings/gsm',
    SETTINGS_NOTIFICATIONS: '/api/settings/notifications',
  },

  // Request timeout (ms)
  TIMEOUT: 10000,
};
