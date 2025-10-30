import mqtt from 'mqtt';

class MQTTService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscribers = new Map();
  }

  connect(brokerUrl, options = {}) {
    const defaultOptions = {
      clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    };

    const mqttOptions = { ...defaultOptions, ...options };

    try {
      this.client = mqtt.connect(brokerUrl, mqttOptions);

      this.client.on('connect', () => {
        console.log('✓ MQTT Connected');
        this.connected = true;
        this.notifySubscribers('connection', { connected: true });
      });

      this.client.on('error', (error) => {
        console.error('✗ MQTT Error:', error);
        this.connected = false;
        this.notifySubscribers('connection', { connected: false, error });
      });

      this.client.on('close', () => {
        console.log('✗ MQTT Connection closed');
        this.connected = false;
        this.notifySubscribers('connection', { connected: false });
      });

      this.client.on('message', (topic, message) => {
        try {
          const payload = JSON.parse(message.toString());
          this.notifySubscribers(topic, payload);
        } catch (error) {
          console.error('Error parsing MQTT message:', error);
        }
      });

      return this.client;
    } catch (error) {
      console.error('Failed to connect to MQTT broker:', error);
      return null;
    }
  }

  subscribe(topic, callback) {
    if (!this.client) {
      console.error('MQTT client not connected');
      return;
    }

    // Subscribe to MQTT topic
    this.client.subscribe(topic, (err) => {
      if (err) {
        console.error(`Failed to subscribe to ${topic}:`, err);
      } else {
        console.log(`✓ Subscribed to ${topic}`);
      }
    });

    // Store callback for this topic
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    this.subscribers.get(topic).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(topic);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  publish(topic, message, options = {}) {
    if (!this.client || !this.connected) {
      console.error('MQTT client not connected');
      return false;
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);

    this.client.publish(topic, payload, options, (err) => {
      if (err) {
        console.error(`Failed to publish to ${topic}:`, err);
      } else {
        console.log(`✓ Published to ${topic}`);
      }
    });

    return true;
  }

  notifySubscribers(topic, data) {
    const callbacks = this.subscribers.get(topic);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.connected = false;
      console.log('✓ MQTT Disconnected');
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Singleton instance
const mqttService = new MQTTService();
export default mqttService;
