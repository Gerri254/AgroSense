# 🚀 Running the Complete IoT Agriculture System

This guide shows you how to start both the backend and frontend together.

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [x] Node.js installed (v16+)
- [x] Backend dependencies installed (`npm install` in `backend/`)
- [x] Frontend dependencies installed (`npm install` in `frontend/`)
- [x] Socket.io-client installed in frontend
- [x] HiveMQ Cloud credentials configured in `backend/.env`
- [ ] MongoDB running (local or Atlas)

## 🎯 Quick Start (3 Terminals)

### Terminal 1: MongoDB
```bash
# If using local MongoDB
mongod

# OR if MongoDB is a service
sudo systemctl start mongod

# Skip this if using MongoDB Atlas (cloud)
```

### Terminal 2: Backend Server
```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ Connected to MongoDB
✅ Connected to MQTT broker
📡 Subscribed to topic: sensors/data
🚀 Server running on port 5000
```

### Terminal 3: Frontend Dashboard
```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v7.1.7  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🌐 Access the System

1. **Open browser**: http://localhost:5173
2. **Login**:
   - Username: `admin`
   - Password: `admin123`

   (First time? Register via backend: `POST /api/auth/register`)

3. **View dashboard**: Real-time sensor data will appear when ESP8266 publishes

## 📊 What You Should See

### Backend Console (Terminal 2):
```
📨 Received message on sensors/data: { temperature: 25, humidity: 65 }
💾 Sensor data saved to database
```

### Frontend Console (Browser Dev Tools):
```
✅ Backend health: { status: 'OK', mongodb: 'connected', mqtt: 'connected' }
🔌 Connecting to WebSocket: http://localhost:5000
✅ WebSocket connected: abc123
📊 Real-time sensor data: { temperature: 25, humidity: 65, timestamp: '...' }
```

### Dashboard UI:
- ✅ Backend connection indicator (green)
- ✅ Real-time sensor cards updating
- ✅ Temperature and humidity readings
- ✅ Actuator control buttons (pump/fan)

## 🔧 Troubleshooting

### Backend won't start

**"MongoDB connection error"**
```bash
# Start MongoDB
mongod
# OR
sudo systemctl start mongod

# Check if running
mongosh
```

**"Port 5000 already in use"**
```bash
# Find process using port 5000
lsof -i:5000

# Kill it
kill -9 <PID>

# OR change port in backend/.env
PORT=5001
```

**"MQTT connection error"**
- Check `backend/.env` has correct HiveMQ credentials
- Verify broker URL: `mqtts://a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud:8883`

### Frontend won't connect

**"Backend connection failed"**
```bash
# Check backend is running
curl http://localhost:5000/health

# Should return:
{
  "status": "OK",
  "mongodb": "connected",
  "mqtt": "connected"
}
```

**"WebSocket connection failed"**
- Verify backend is running on port 5000
- Check `frontend/.env` has correct URL:
  ```
  VITE_API_URL=http://localhost:5000
  VITE_WS_URL=http://localhost:5000
  ```
- Restart frontend after changing `.env`

### No sensor data appearing

1. **Check ESP8266 is running and connected to WiFi**
2. **Verify ESP8266 publishes to `sensors/data` topic**
3. **Monitor HiveMQ Web Client**: https://www.hivemq.com/demos/websocket-client/
   - Connect to your broker
   - Subscribe to `sensors/data`
   - See if messages appear

4. **Simulate data with mosquitto**:
```bash
mosquitto_pub \
  -h a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud \
  -p 8883 \
  -u Luzzi \
  -P Geraldo@123 \
  --capath /etc/ssl/certs/ \
  -t sensors/data \
  -m '{"temperature":25,"humidity":60,"soilMoisture":45,"waterLevel":80}'
```

## 🧪 Testing the Complete System

### 1. Test Backend Health
```bash
curl http://localhost:5000/health
```

### 2. Test Sensor Data Endpoint
```bash
curl http://localhost:5000/api/sensors/current
```

### 3. Test Pump Control
```bash
curl -X POST http://localhost:5000/api/actuators/pump/control \
  -H "Content-Type: application/json" \
  -d '{"status": true, "mode": "manual"}'
```

### 4. View Backend Logs
Watch Terminal 2 for real-time logs

### 5. Test Frontend WebSocket
Open browser console (F12) and watch for:
- `✅ WebSocket connected`
- `📊 Real-time sensor data`

## 📱 ESP8266 Connection

Your ESP8266 should publish to:
- **Broker**: `a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud:8883`
- **Topic**: `sensors/data`
- **Format**: `{"temperature": 25, "humidity": 65}`

When it publishes, you'll see updates in:
1. Backend console (Terminal 2)
2. Frontend dashboard (automatically)

## 🎯 Success Indicators

✅ **Backend Running**:
- MongoDB connected
- MQTT broker connected
- Server on port 5000
- Receiving ESP8266 messages

✅ **Frontend Running**:
- Vite dev server on port 5173
- WebSocket connected to backend
- Dashboard showing data
- Real-time updates working

✅ **System Working**:
- ESP8266 → HiveMQ → Backend → MongoDB ✅
- Backend → WebSocket → Frontend ✅
- Frontend → REST API → Backend ✅
- Dashboard controls → Backend → ESP8266 ✅

## 🔄 Data Flow Visualization

```
┌─────────────┐
│  ESP8266    │ Publishes sensor data every 5 seconds
└──────┬──────┘
       │ MQTT: sensors/data
       ↓
┌──────────────────┐
│  HiveMQ Cloud    │ Your MQTT broker
└──────┬───────────┘
       │ Subscribe
       ↓
┌──────────────────┐
│  Backend         │ Terminal 2: npm run dev
│  Port 5000       │ ✅ Receives data, saves to MongoDB
└──────┬───────────┘
       │ WebSocket broadcast
       ↓
┌──────────────────┐
│  Frontend        │ Terminal 3: npm run dev
│  Port 5173       │ ✅ Shows real-time updates
└──────────────────┘
       ↓
┌──────────────────┐
│  Browser         │ http://localhost:5173
│  Dashboard       │ ✅ Live sensor data
└──────────────────┘
```

## 📚 Additional Commands

```bash
# Check MongoDB data
mongosh
use iot_agriculture
db.sensorreadings.find().sort({timestamp: -1}).limit(5)

# View backend logs with colors
cd backend && npm run dev | cat

# Rebuild frontend
cd frontend && npm run build

# Run full API test suite
cd backend && ./test-api.sh
```

## 🛑 Stopping the System

Press `Ctrl+C` in each terminal:
1. Terminal 3 (Frontend)
2. Terminal 2 (Backend)
3. Terminal 1 (MongoDB - if local)

## 🚀 Next Steps

1. ✅ System running successfully
2. ⏳ Test actuator controls (pump/fan)
3. ⏳ Set custom thresholds
4. ⏳ View historical data charts
5. ⏳ Test alerts when thresholds exceed
6. ⏳ Deploy to production

---

## 🆘 Still Having Issues?

1. Check [backend/START_HERE.md](backend/START_HERE.md)
2. Review [BACKEND_SETUP_COMPLETE.md](BACKEND_SETUP_COMPLETE.md)
3. Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
4. Verify all environment variables in `.env` files

**Your system is ready to run!** 🎉🌾
