# IoT Smart Agriculture Backend

Backend server for the IoT Smart Agriculture System. Receives sensor data from ESP8266 devices via MQTT, stores it in MongoDB, and provides REST API and WebSocket connections for the dashboard.

## Architecture

```
ESP8266 → MQTT Broker (HiveMQ) → Backend Server → MongoDB
                                        ↓
                                  WebSocket → Dashboard
```

## Features

- **MQTT Integration**: Receives real-time sensor data from ESP8266 devices
- **MongoDB Storage**: Time-series data storage with automatic cleanup
- **REST API**: Historical data, analytics, and control endpoints
- **WebSocket**: Real-time updates to dashboard clients
- **Threshold Monitoring**: Automatic alert generation when thresholds are exceeded
- **Actuator Control**: Remote control of water pump and cooling fan
- **Authentication**: JWT-based user authentication

## Prerequisites

- Node.js v16 or higher
- MongoDB (local or MongoDB Atlas)
- MQTT Broker (HiveMQ Cloud recommended)

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file** with your configurations:
   - MongoDB connection string
   - HiveMQ Cloud credentials
   - MQTT topics
   - JWT secret

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/iot_agriculture` |
| `MQTT_BROKER_URL` | MQTT broker URL | `mqtt://broker.hivemq.com:1883` |
| `MQTT_USERNAME` | MQTT username | `your_username` |
| `MQTT_PASSWORD` | MQTT password | `your_password` |
| `MQTT_CLIENT_ID` | MQTT client ID | `backend_server` |
| `JWT_SECRET` | JWT signing secret | `your_secret_key` |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:5173` |

### MQTT Topics

The backend subscribes to these topics:

- `sensors/data` - Receives sensor readings from ESP8266
- `actuators/status` - Receives actuator status updates
- `device/status` - Receives device online/offline status
- `settings/config` - Receives configuration updates

The backend publishes to these topics:

- `actuators/pump/command` - Send pump control commands
- `actuators/fan/command` - Send fan control commands
- `settings/config` - Send threshold updates to ESP8266
- `alerts/critical` - Send critical alerts

## ESP8266 Data Format

Your ESP8266 should publish sensor data in this JSON format:

```json
{
  "deviceId": "esp8266_001",
  "temperature": 25.5,
  "humidity": 65.2,
  "soilMoisture": 45.0,
  "waterLevel": 80.0
}
```

**Note**: Your current Arduino code publishes `{"temperature": 25, "humidity": 65}`. You'll need to add `soilMoisture` and `waterLevel` fields when you connect real sensors.

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will:
1. Connect to MongoDB
2. Connect to MQTT broker
3. Subscribe to sensor topics
4. Start Express server on configured port
5. Initialize WebSocket server

## API Endpoints

### Health Check
```
GET /health
```

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login    - Login user
GET  /api/auth/me       - Get current user
```

### Sensors
```
GET /api/sensors/current     - Get latest sensor readings
GET /api/sensors/history     - Get historical data (query: startDate, endDate, limit)
GET /api/sensors/aggregated  - Get aggregated data (query: interval, startDate, endDate)
GET /api/sensors/stats       - Get sensor statistics (query: days)
```

### Actuators
```
POST /api/actuators/pump/control - Control water pump (body: {status: boolean, mode: string})
POST /api/actuators/fan/control  - Control cooling fan (body: {status: boolean, mode: string})
GET  /api/actuators/logs         - Get actuator action logs
GET  /api/actuators/stats        - Get actuator statistics
```

### Alerts
```
GET   /api/alerts              - Get all alerts
GET   /api/alerts/latest       - Get latest unacknowledged alert
PATCH /api/alerts/:id/acknowledge - Acknowledge specific alert
POST  /api/alerts/acknowledge-all - Acknowledge all alerts
GET   /api/alerts/stats        - Get alert statistics
```

### Settings
```
GET /api/settings              - Get user settings
PUT /api/settings/thresholds   - Update thresholds
PUT /api/settings/gsm          - Update GSM number
PUT /api/settings/notifications - Toggle notifications
```

## WebSocket Events

### Client → Server
- `control-pump` - Send pump control command
- `control-fan` - Send fan control command
- `update-thresholds` - Update threshold values
- `request-status` - Request current status

### Server → Client
- `connected` - Connection established
- `sensor-data` - Real-time sensor readings
- `actuator-status` - Actuator status update
- `alert` - New alert generated
- `device-status` - Device online/offline status
- `action-log` - New action logged

## Database Schema

### SensorReading
```javascript
{
  deviceId: String,
  temperature: Number,
  humidity: Number,
  soilMoisture: Number,
  waterLevel: Number,
  timestamp: Date
}
```

### ActuatorLog
```javascript
{
  deviceId: String,
  actuatorType: String, // 'water_pump' | 'cooling_fan'
  action: String,       // 'ON' | 'OFF'
  trigger: String,      // 'automatic' | 'manual'
  userId: ObjectId,
  reason: String,
  timestamp: Date
}
```

### Alert
```javascript
{
  deviceId: String,
  type: String,         // 'critical' | 'warning' | 'info'
  message: String,
  sensorType: String,
  value: Number,
  threshold: Number,
  acknowledged: Boolean,
  timestamp: Date
}
```

## Testing with Your ESP8266

Your ESP8266 is currently publishing to HiveMQ Cloud. To connect the backend:

1. Update `.env` with your HiveMQ Cloud credentials
2. Ensure the topic in your Arduino code matches `MQTT_TOPIC_SENSORS` in `.env`
3. Start the backend server
4. Check the console for "Received message on sensors/data"

Example Arduino topic:
```cpp
const char* mqtt_topic_pub = "sensors/data";
```

## Troubleshooting

### MQTT Connection Failed
- Verify HiveMQ credentials in `.env`
- Check firewall settings
- Ensure MQTT_BROKER_URL uses correct protocol (mqtt:// or mqtts://)

### MongoDB Connection Failed
- Verify MongoDB is running (`mongod` or MongoDB Atlas)
- Check connection string in `.env`
- Ensure IP whitelist includes your IP (for Atlas)

### WebSocket Not Connecting
- Verify CORS_ORIGIN matches frontend URL
- Check firewall settings for WebSocket port

## Production Deployment

### Recommended Platforms
- **Backend**: Render.com, Railway.app, or DigitalOcean
- **MongoDB**: MongoDB Atlas (free tier available)
- **MQTT Broker**: HiveMQ Cloud (free tier available)

### Security Checklist
- [ ] Change JWT_SECRET to strong random string
- [ ] Use environment-specific .env files
- [ ] Enable HTTPS/TLS
- [ ] Configure MQTT over TLS (mqtts://)
- [ ] Set up MongoDB authentication
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts

## License

MIT
