// MQTT Configuration
export const MQTT_CONFIG = {
  // Update this with your MQTT broker URL
  // For local development, use: 'ws://localhost:8080' (Mosquitto with WebSocket)
  // For production, use: 'wss://your-broker.com:8883'
  BROKER_URL: import.meta.env.VITE_MQTT_BROKER_URL || 'ws://localhost:8080',

  // MQTT Topics
  TOPICS: {
    // Sensor data topics
    SENSORS: 'agriculture/sensors',
    SOIL_MOISTURE: 'agriculture/sensors/soil',
    TEMPERATURE: 'agriculture/sensors/temperature',
    WATER_LEVEL: 'agriculture/sensors/water',

    // Actuator status topics
    ACTUATORS: 'agriculture/actuators',
    PUMP_STATUS: 'agriculture/actuators/pump/status',
    FAN_STATUS: 'agriculture/actuators/fan/status',

    // Command topics (for controlling devices)
    COMMANDS: 'agriculture/commands',
    PUMP_COMMAND: 'agriculture/commands/pump',
    FAN_COMMAND: 'agriculture/commands/fan',
    CONFIG_UPDATE: 'agriculture/commands/config',

    // System status
    DEVICE_STATUS: 'agriculture/status',
    ALERTS: 'agriculture/alerts',
  },

  // Connection options
  OPTIONS: {
    username: import.meta.env.VITE_MQTT_USERNAME || '',
    password: import.meta.env.VITE_MQTT_PASSWORD || '',
    keepalive: 60,
    clean: true,
    reconnectPeriod: 1000,
  },

  // Thresholds (can be updated from UI)
  DEFAULT_THRESHOLDS: {
    soilMoisture: {
      min: 30,
      max: 70
    },
    temperature: {
      min: 15,
      max: 35
    },
    waterLevel: {
      min: 20
    }
  }
};
