import { Server } from 'socket.io';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Set();
  }

  // Initialize Socket.IO
  initialize(server, corsOrigin) {
    // Support both single origin (string) or multiple origins (array)
    const allowedOrigins = Array.isArray(corsOrigin)
      ? corsOrigin
      : [corsOrigin || 'http://localhost:5173'];

    this.io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    console.log('🔌 Socket.IO initialized');

    return this.io;
  }

  // Setup Socket.IO event handlers
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('👤 Client connected:', socket.id);
      this.connectedClients.add(socket.id);

      // Send connection confirmation
      socket.emit('connected', {
        message: 'Connected to IoT Agriculture Backend',
        clientId: socket.id,
        timestamp: new Date().toISOString()
      });

      // Handle client disconnect
      socket.on('disconnect', () => {
        console.log('👋 Client disconnected:', socket.id);
        this.connectedClients.delete(socket.id);
      });

      // Handle pump control commands from client
      socket.on('control-pump', (data) => {
        console.log('🚰 Pump control received:', data);
        // This will be handled by the route, but we can emit acknowledgment
        socket.emit('control-acknowledged', {
          device: 'pump',
          ...data,
          timestamp: new Date().toISOString()
        });
      });

      // Handle fan control commands from client
      socket.on('control-fan', (data) => {
        console.log('💨 Fan control received:', data);
        socket.emit('control-acknowledged', {
          device: 'fan',
          ...data,
          timestamp: new Date().toISOString()
        });
      });

      // Handle threshold update request
      socket.on('update-thresholds', (data) => {
        console.log('⚙️  Threshold update received:', data);
      });

      // Send current status on request
      socket.on('request-status', () => {
        console.log('📊 Status request from client:', socket.id);
        // Status will be sent via API, but we can acknowledge
        socket.emit('status-request-acknowledged');
      });
    });
  }

  // Emit sensor data to all connected clients
  emitSensorData(data) {
    if (this.io) {
      this.io.emit('sensor-data', data);
    }
  }

  // Emit actuator status to all connected clients
  emitActuatorStatus(data) {
    if (this.io) {
      this.io.emit('actuator-status', data);
    }
  }

  // Emit alert to all connected clients
  emitAlert(alert) {
    if (this.io) {
      this.io.emit('alert', alert);
    }
  }

  // Emit device status
  emitDeviceStatus(status) {
    if (this.io) {
      this.io.emit('device-status', status);
    }
  }

  // Emit action log
  emitActionLog(log) {
    if (this.io) {
      this.io.emit('action-log', log);
    }
  }

  // Get number of connected clients
  getConnectedClientsCount() {
    return this.connectedClients.size;
  }

  // Get Socket.IO instance
  getIO() {
    return this.io;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
