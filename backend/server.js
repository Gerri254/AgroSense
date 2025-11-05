import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import services
import mqttService from './services/mqttService.js';
import socketService from './services/socketService.js';

// Import routes
import sensorRoutes from './routes/sensorRoutes.js';
import actuatorRoutes from './routes/actuatorRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import authRoutes from './routes/authRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = createServer(app);

// Configuration
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iot_agriculture';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Allow multiple frontend origins (development ports)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  CORS_ORIGIN
];

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mqtt: mqttService.connected ? 'connected' : 'disconnected',
    connectedClients: socketService.getConnectedClientsCount()
  });
});

// API Routes
app.use('/api/sensors', sensorRoutes);
app.use('/api/actuators', actuatorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'IoT Smart Agriculture Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      sensors: '/api/sensors/*',
      actuators: '/api/actuators/*',
      alerts: '/api/alerts/*',
      auth: '/api/auth/*',
      settings: '/api/settings/*'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    // Initialize Socket.IO with allowed origins
    const io = socketService.initialize(server, allowedOrigins);
    mqttService.setSocketIO(io);

    // Connect to MQTT broker
    mqttService.connect(
      process.env.MQTT_BROKER_URL,
      process.env.MQTT_USERNAME,
      process.env.MQTT_PASSWORD,
      process.env.MQTT_CLIENT_ID
    );

    // Start server
    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
      console.log(`🌍 CORS enabled for: ${CORS_ORIGIN}`);
      console.log(`\n📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏳ Shutting down gracefully...');

  mqttService.disconnect();

  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n⏳ SIGTERM received, shutting down...');

  mqttService.disconnect();

  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

export default app;
