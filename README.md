# IoT Smart Agriculture System

A comprehensive IoT solution for smart agriculture monitoring and control, featuring real-time sensor data visualization, remote actuator control, and historical data analytics.

## 🌾 Project Overview

This system provides farmers with an intuitive mobile-friendly web dashboard to monitor and control their agricultural operations remotely. Built on ESP8266 microcontrollers with MQTT protocol for reliable real-time communication.

### Key Features

- **Real-Time Monitoring**: Live sensor data from soil moisture, temperature, and water level sensors
- **Remote Control**: Manual override capabilities for water pumps and cooling fans
- **Historical Analytics**: Trend visualization and action logs for data-driven decisions
- **Mobile-First Design**: Optimized for smartphone access with responsive UI
- **Alert System**: Critical notifications for threshold breaches

## 🏗️ System Architecture

```
ESP8266 Sensors → MQTT Broker → Backend API → Web Dashboard
                                      ↓
                                  Database
```

### Hardware Components
- **Microcontroller**: LOLIN(WEMOS) D1 R2 & Mini (ESP8266)
- **Sensors**:
  - Soil Moisture Sensor
  - DHT11 Temperature/Humidity Sensor
  - Water Level Sensor
- **Actuators**:
  - Water Pump (relay controlled)
  - Cooling Fan (relay controlled)

### Software Stack
- **Backend**: Node.js, Express, MQTT.js, Socket.io
- **Frontend**: React, Tailwind CSS, Recharts
- **Database**: MongoDB (with time-series optimization)
- **MQTT Broker**: HiveMQ Cloud
- **Protocol**: MQTT over TCP, WebSocket for real-time updates

## 📋 Development Progress

Track development progress in [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md)

### Using the Task Logger

```bash
# Log a completed task
node task-logger.js log "Task description" completed

# Mark task as completed in checklist
node task-logger.js complete "Task description"

# View progress summary
node task-logger.js summary
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)
- HiveMQ Cloud account (or other MQTT broker)
- ESP8266 with Arduino IDE

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your HiveMQ and MongoDB credentials

# Start backend server
npm run dev
```

See [backend/QUICKSTART.md](backend/QUICKSTART.md) for detailed setup instructions.

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### ESP8266 Setup

Your ESP8266 is already configured to publish to HiveMQ Cloud. Make sure the topic in your Arduino code matches the backend configuration.

See [BACKEND_SETUP_COMPLETE.md](BACKEND_SETUP_COMPLETE.md) for complete integration guide.

## 📱 Functional Requirements

### FR 1: Real-Time Status Monitoring
- **FR 1.1**: Real-time sensor data display (soil moisture, temperature, water level)
- **FR 1.2**: System connection status indicator
- **FR 1.3**: Actuator operational status (pump, fan)
- **FR 1.4**: Critical alert display

### FR 2: Control and Configuration
- **FR 2.1**: Threshold setting interface (soil moisture, temperature limits)
- **FR 2.2**: Manual override controls for actuators
- **FR 2.3**: GSM alert configuration (optional)

### FR 3: Historical Data Analytics
- **FR 3.1**: Trend charts for sensor data (24h, 7d, 30d views)
- **FR 3.2**: Action log table (automated and manual actions)

## 🎨 UI/UX Design

### Mobile-First Layout
1. **Header**: System status and project branding
2. **Alerts Section**: Critical notifications
3. **Monitoring Widgets**: Real-time sensor cards
4. **Control Panel**: Manual override switches
5. **Analytics Tab**: Historical charts and logs

### Color Palette
- Primary: Earth tones (greens, browns)
- Alert: Red (#DC2626)
- Success: Green (#10B981)
- Info: Blue (#3B82F6)

## 🔒 Security

- HTTPS encryption for all communications
- User authentication with JWT tokens
- MQTT credentials and TLS support
- Rate limiting on API endpoints

## 📊 Performance Targets

- **Dashboard Load Time**: < 3 seconds
- **Real-Time Latency**: < 2 seconds (sensor to display)
- **Mobile Compatibility**: Chrome, Safari, Firefox (latest versions)

## 📝 License

[Add your license here]

## 🤝 Contributing

Development tracked through task logger system. See [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) for current status.

## 📞 Support

[Add contact information or support channels]

---

## 📚 Documentation

- [Backend Setup Guide](BACKEND_SETUP_COMPLETE.md) - Complete backend implementation
- [Backend Quick Start](backend/QUICKSTART.md) - Step-by-step backend setup
- [Backend API Documentation](backend/README.md) - Full API reference
- [Frontend Documentation](frontend/README.md) - Frontend implementation details

## 🎯 Project Structure

```
Lwiki Project/
├── backend/              # Node.js backend server
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── services/        # MQTT and WebSocket services
│   ├── server.js        # Main server file
│   └── README.md        # Backend documentation
├── frontend/            # React dashboard
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # State management
│   │   └── services/    # API services
│   └── package.json
└── BACKEND_SETUP_COMPLETE.md  # Integration guide
```

---

**Project Status**: 🟢 Backend Complete, Frontend Ready
**Last Updated**: 2025-11-02
