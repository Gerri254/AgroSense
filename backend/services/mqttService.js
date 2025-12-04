import mqtt from 'mqtt';
import SensorReading from '../models/SensorReading.js';
import ActuatorLog from '../models/ActuatorLog.js';
import Alert from '../models/Alert.js';

class MQTTService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.socketIO = null;
    this.thresholds = {
      minSoilMoisture: 30,
      maxSoilMoisture: 70,
      minTemperature: 15,
      maxTemperature: 35,
      minWaterLevel: 20,
      maxHumidity: 80
    };
    this.actuatorModes = {
      pump: 'auto',  // 'auto' or 'manual'
      fan: 'auto'    // 'auto' or 'manual'
    };
    this.actuatorStates = {
      pump: false,
      fan: false
    };
  }

  // Initialize Socket.IO reference for real-time updates
  setSocketIO(io) {
    this.socketIO = io;
  }

  // Update thresholds from settings
  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('📊 Thresholds updated:', this.thresholds);
  }

  // Set actuator mode (auto/manual)
  setActuatorMode(actuator, mode) {
    if (this.actuatorModes.hasOwnProperty(actuator)) {
      this.actuatorModes[actuator] = mode;
      console.log(`🔧 ${actuator} mode set to: ${mode}`);

      // Emit mode change to WebSocket clients
      if (this.socketIO) {
        this.socketIO.emit('actuator-mode-change', { actuator, mode });
      }
    }
  }

  // Get actuator mode
  getActuatorMode(actuator) {
    return this.actuatorModes[actuator] || 'manual';
  }

  // Connect to MQTT broker
  connect(brokerUrl, username, password, clientId) {
    const options = {
      username,
      password,
      clientId: clientId || `backend_${Math.random().toString(16).substring(2, 8)}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      will: {
        topic: 'backend/status',
        payload: JSON.stringify({ status: 'offline', timestamp: new Date().toISOString() }),
        qos: 1,
        retain: false
      }
    };

    console.log('🔌 Connecting to MQTT broker:', brokerUrl);

    this.client = mqtt.connect(brokerUrl, options);

    this.client.on('connect', () => {
      console.log('✅ Connected to MQTT broker');
      this.connected = true;

      // Subscribe to all necessary topics
      this.subscribeToTopics();

      // Publish backend online status
      this.client.publish('backend/status', JSON.stringify({
        status: 'online',
        timestamp: new Date().toISOString()
      }), { qos: 1 });
    });

    this.client.on('error', (error) => {
      console.error('❌ MQTT connection error:', error.message);
    });

    this.client.on('reconnect', () => {
      console.log('🔄 Reconnecting to MQTT broker...');
    });

    this.client.on('close', () => {
      console.log('⚠️  MQTT connection closed');
      this.connected = false;
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });
  }

  // Subscribe to topics
  subscribeToTopics() {
    const topics = [
      process.env.MQTT_TOPIC_SENSORS || 'sensors/data',
      process.env.MQTT_TOPIC_ACTUATORS || 'actuators/status',
      process.env.MQTT_TOPIC_DEVICE_STATUS || 'device/status',
      process.env.MQTT_TOPIC_CONFIG || 'settings/config'
    ];

    topics.forEach(topic => {
      this.client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`❌ Failed to subscribe to ${topic}:`, err.message);
        } else {
          console.log(`📡 Subscribed to topic: ${topic}`);
        }
      });
    });
  }

  // Handle incoming MQTT messages
  async handleMessage(topic, message) {
    try {
      const payload = JSON.parse(message.toString());
      console.log(`📨 Received message on ${topic}:`, payload);

      // Route to appropriate handler
      if (topic.includes('sensors')) {
        await this.handleSensorData(payload);
      } else if (topic.includes('actuators')) {
        await this.handleActuatorStatus(payload);
      } else if (topic.includes('device/status')) {
        this.handleDeviceStatus(payload);
      } else if (topic.includes('settings/config')) {
        this.handleConfigUpdate(payload);
      }
    } catch (error) {
      console.error('❌ Error handling MQTT message:', error.message);
    }
  }

  // Handle sensor data from ESP8266
  async handleSensorData(data) {
    try {
      // Create sensor reading document
      const sensorReading = new SensorReading({
        deviceId: data.deviceId || 'esp8266_001',
        temperature: data.temperature,
        humidity: data.humidity,
        soilMoisture: data.soilMoisture,
        waterLevel: data.waterLevel,
        timestamp: new Date()
      });

      // Save to database
      await sensorReading.save();
      console.log('💾 Sensor data saved to database');

      // Check thresholds and generate alerts
      await this.checkThresholds(data);

      // Emit to WebSocket clients for real-time updates
      if (this.socketIO) {
        this.socketIO.emit('sensor-data', {
          ...data,
          timestamp: sensorReading.timestamp
        });
      }
    } catch (error) {
      console.error('❌ Error saving sensor data:', error.message);
    }
  }

  // Check sensor values against thresholds
  async checkThresholds(data) {
    const alerts = [];

    // Soil moisture check - AUTO CONTROL PUMP
    if (data.soilMoisture !== undefined) {
      if (data.soilMoisture < this.thresholds.minSoilMoisture) {
        alerts.push({
          type: 'critical',
          message: `Soil moisture low: ${data.soilMoisture}%`,
          sensorType: 'soil_moisture',
          value: data.soilMoisture,
          threshold: this.thresholds.minSoilMoisture
        });

        // Auto control: Turn ON pump if in auto mode
        if (this.actuatorModes.pump === 'auto' && !this.actuatorStates.pump) {
          await this.controlActuator('pump', true, 'automatic', 'Soil moisture below threshold');
        }
      } else if (data.soilMoisture >= (this.thresholds.maxSoilMoisture || 70)) {
        // Auto control: Turn OFF pump if in auto mode and moisture is sufficient
        if (this.actuatorModes.pump === 'auto' && this.actuatorStates.pump) {
          await this.controlActuator('pump', false, 'automatic', 'Soil moisture reached target');
        }
      }
    }

    // Temperature check - AUTO CONTROL FAN
    if (data.temperature !== undefined) {
      if (data.temperature > this.thresholds.maxTemperature) {
        alerts.push({
          type: 'warning',
          message: `Temperature high: ${data.temperature}°C`,
          sensorType: 'temperature',
          value: data.temperature,
          threshold: this.thresholds.maxTemperature
        });

        // Auto control: Turn ON fan if in auto mode
        if (this.actuatorModes.fan === 'auto' && !this.actuatorStates.fan) {
          await this.controlActuator('fan', true, 'automatic', 'Temperature above threshold');
        }
      } else if (data.temperature <= (this.thresholds.minTemperature || 15)) {
        // Auto control: Turn OFF fan if in auto mode and temperature cooled down
        // Uses minTemperature as the "turn off" threshold (hysteresis)
        if (this.actuatorModes.fan === 'auto' && this.actuatorStates.fan) {
          await this.controlActuator('fan', false, 'automatic', 'Temperature cooled to safe level');
        }
      }
    }

    // Water level check
    if (data.waterLevel !== undefined && data.waterLevel < this.thresholds.minWaterLevel) {
      alerts.push({
        type: 'critical',
        message: `Water level low: ${data.waterLevel}%`,
        sensorType: 'water_level',
        value: data.waterLevel,
        threshold: this.thresholds.minWaterLevel
      });
    }

    // Humidity check
    if (data.humidity !== undefined && data.humidity > this.thresholds.maxHumidity) {
      alerts.push({
        type: 'warning',
        message: `Humidity high: ${data.humidity}%`,
        sensorType: 'humidity',
        value: data.humidity,
        threshold: this.thresholds.maxHumidity
      });
    }

    // Save alerts and emit to clients
    for (const alertData of alerts) {
      try {
        const alert = new Alert({
          deviceId: data.deviceId || 'esp8266_001',
          ...alertData,
          timestamp: new Date()
        });

        await alert.save();
        console.log('⚠️  Alert generated:', alert.message);

        // Emit to WebSocket clients
        if (this.socketIO) {
          this.socketIO.emit('alert', alert);
        }

        // Publish to MQTT alerts topic
        this.publish(process.env.MQTT_TOPIC_ALERTS || 'alerts/critical', alert);
      } catch (error) {
        console.error('❌ Error saving alert:', error.message);
      }
    }
  }

  // Control actuator (unified method)
  async controlActuator(actuator, status, trigger = 'manual', reason = null) {
    try {
      // Update internal state
      this.actuatorStates[actuator] = status;

      // Publish MQTT command
      const command = {
        device: actuator,
        status,
        mode: this.actuatorModes[actuator],
        timestamp: new Date().toISOString()
      };

      const topic = actuator === 'pump'
        ? (process.env.MQTT_TOPIC_PUMP_CMD || 'actuators/pump/command')
        : (process.env.MQTT_TOPIC_FAN_CMD || 'actuators/fan/command');

      this.publish(topic, command);

      // Log the action
      await this.logActuatorAction(
        actuator === 'pump' ? 'water_pump' : 'cooling_fan',
        status ? 'ON' : 'OFF',
        trigger,
        null,
        reason || `${trigger} control`
      );

      console.log(`🤖 AUTO: ${actuator} turned ${status ? 'ON' : 'OFF'} - ${reason}`);

      return { success: true, actuator, status, trigger };
    } catch (error) {
      console.error(`❌ Error controlling ${actuator}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Handle actuator status updates
  async handleActuatorStatus(data) {
    try {
      console.log('🔧 Actuator status updated:', data);

      // Transform ESP8266 format to frontend format
      let statusUpdate = {};

      if (data.device) {
        // ESP8266 sends: { device: "pump", status: true }
        // Transform to: { waterPump: { status: true, mode: <current mode> } }
        const actuatorName = data.device === 'pump' ? 'waterPump' : 'coolingFan';
        const currentMode = this.actuatorModes[data.device] || 'auto';

        statusUpdate[actuatorName] = {
          status: data.status,
          mode: currentMode
        };

        // Update internal state
        this.actuatorStates[data.device] = data.status;
      } else {
        // Already in correct format (from backend itself)
        statusUpdate = data;
      }

      // Emit to WebSocket clients
      if (this.socketIO) {
        this.socketIO.emit('actuator-status', statusUpdate);
      }
    } catch (error) {
      console.error('❌ Error handling actuator status:', error.message);
    }
  }

  // Handle device status
  handleDeviceStatus(data) {
    console.log('📱 Device status:', data);

    // Emit to WebSocket clients
    if (this.socketIO) {
      this.socketIO.emit('device-status', data);
    }
  }

  // Handle configuration updates
  handleConfigUpdate(config) {
    console.log('⚙️  Configuration update received:', config);
    if (config.thresholds) {
      this.updateThresholds(config.thresholds);
    }
  }

  // Publish message to MQTT topic
  publish(topic, payload, options = { qos: 1 }) {
    if (!this.connected) {
      console.warn('⚠️  MQTT not connected. Cannot publish.');
      return;
    }

    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
    this.client.publish(topic, message, options, (err) => {
      if (err) {
        console.error(`❌ Failed to publish to ${topic}:`, err.message);
      } else {
        console.log(`📤 Published to ${topic}:`, payload);
      }
    });
  }

  // Log actuator action
  async logActuatorAction(actuatorType, action, trigger, userId = null, reason = null) {
    try {
      const log = new ActuatorLog({
        actuatorType,
        action,
        trigger,
        userId,
        reason,
        timestamp: new Date()
      });

      await log.save();
      console.log('📝 Actuator action logged:', log);

      // Emit to WebSocket clients
      if (this.socketIO) {
        // Convert Mongoose document to plain object with _id
        const logData = {
          _id: log._id.toString(),
          action: `${actuatorType === 'water_pump' ? 'Water Pump' : 'Cooling Fan'} ${action}`,
          trigger,
          timestamp: log.timestamp,
          ...log.toObject()
        };
        this.socketIO.emit('action-log', logData);
      }

      return log;
    } catch (error) {
      console.error('❌ Error logging actuator action:', error.message);
    }
  }

  // Disconnect from MQTT broker
  disconnect() {
    if (this.client) {
      this.client.end();
      console.log('🔌 Disconnected from MQTT broker');
    }
  }
}

// Export singleton instance
const mqttService = new MQTTService();
export default mqttService;
