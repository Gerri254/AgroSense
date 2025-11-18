import { io } from 'socket.io-client';
import { API_CONFIG } from '../config/apiConfig';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  // Connect to WebSocket server
  connect() {
    if (this.socket) {
      console.log('⚠️  Socket already connected');
      return this.socket;
    }

    console.log('🔌 Connecting to WebSocket:', API_CONFIG.WS_URL);

    this.socket = io(API_CONFIG.WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id);
      this.connected = true;
      this.notifyListeners('connection', { connected: true });
    });

    this.socket.on('connected', (data) => {
      console.log('📡 Server acknowledgment:', data);
    });

    this.socket.on('disconnect', () => {
      console.log('⚠️  WebSocket disconnected');
      this.connected = false;
      this.notifyListeners('connection', { connected: false });
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    // Real-time data events
    this.socket.on('sensor-data', (data) => {
      console.log('📊 Sensor data received:', data);
      this.notifyListeners('sensor-data', data);
    });

    this.socket.on('actuator-status', (data) => {
      console.log('🔧 Actuator status:', data);
      this.notifyListeners('actuator-status', data);
    });

    this.socket.on('alert', (alert) => {
      console.log('⚠️  Alert received:', alert);
      this.notifyListeners('alert', alert);
    });

    this.socket.on('action-log', (log) => {
      console.log('📝 Action log:', log);
      this.notifyListeners('action-log', log);
    });

    this.socket.on('device-status', (status) => {
      console.log('📱 Device status:', status);
      this.notifyListeners('device-status', status);
    });

    this.socket.on('actuator-mode-change', (data) => {
      console.log('🔧 Actuator mode change:', data);
      this.notifyListeners('actuator-mode-change', data);
    });

    return this.socket;
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Notify all listeners for an event
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Emit event to server (optional - can also use REST API)
  emit(event, data) {
    if (!this.socket || !this.connected) {
      console.warn('⚠️  Socket not connected, cannot emit:', event);
      return false;
    }

    this.socket.emit(event, data);
    return true;
  }

  // Control pump via WebSocket (optional - REST API preferred)
  controlPump(status, mode = 'manual') {
    return this.emit('control-pump', { status, mode });
  }

  // Control fan via WebSocket (optional - REST API preferred)
  controlFan(status, mode = 'manual') {
    return this.emit('control-fan', { status, mode });
  }

  // Update thresholds via WebSocket (optional - REST API preferred)
  updateThresholds(thresholds) {
    return this.emit('update-thresholds', thresholds);
  }

  // Request current status
  requestStatus() {
    return this.emit('request-status');
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('🔌 WebSocket disconnected');
    }
  }

  // Check connection status
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;
