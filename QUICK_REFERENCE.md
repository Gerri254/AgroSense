# 🚀 IoT Agriculture System - Quick Reference Card

## 📋 Prerequisites Checklist

- [x] Node.js installed (v16+)
- [x] Backend dependencies installed (`npm install` in backend/)
- [x] HiveMQ Cloud configured (✅ **DONE**)
- [ ] MongoDB running (local or Atlas)
- [ ] ESP8266 configured and connected

## ⚡ Quick Start Commands

```bash
# 1. Start MongoDB (if using local)
mongod
# OR
sudo systemctl start mongod

# 2. Verify backend setup
cd backend
node verify-setup.js

# 3. Start backend server
npm run dev

# 4. Test backend (new terminal)
curl http://localhost:5000/health
```

## 🔌 Connection Details

### HiveMQ Cloud
```
Broker:   a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud:8883
Username: Luzzi
Password: Geraldo@123
Topic:    sensors/data
```

### Backend Server
```
API:       http://localhost:5000
WebSocket: ws://localhost:5000
MongoDB:   mongodb://localhost:27017/iot_agriculture
```

### Frontend Dashboard
```
Dev Server: http://localhost:5173
```

## 📡 MQTT Topics

| Topic | Direction | Purpose |
|-------|-----------|---------|
| `sensors/data` | ESP8266 → Backend | Sensor readings |
| `actuators/pump/command` | Backend → ESP8266 | Pump control |
| `actuators/fan/command` | Backend → ESP8266 | Fan control |
| `settings/config` | Backend → ESP8266 | Threshold updates |
| `alerts/critical` | Backend → All | Critical alerts |

## 🔧 Essential API Endpoints

```bash
# Health check
GET  http://localhost:5000/health

# Latest sensor data
GET  http://localhost:5000/api/sensors/current

# Historical data (last 24 hours)
GET  http://localhost:5000/api/sensors/history?limit=100

# Control pump
POST http://localhost:5000/api/actuators/pump/control
Body: {"status": true, "mode": "manual"}

# Get latest alert
GET  http://localhost:5000/api/alerts/latest

# Update thresholds
PUT  http://localhost:5000/api/settings/thresholds
Body: {"minSoilMoisture": 30, "maxTemperature": 35}
```

## 📊 Expected Console Output

### ✅ Success (Backend Running)
```
✅ Connected to MongoDB
✅ Connected to MQTT broker
📡 Subscribed to topic: sensors/data
🚀 Server running on port 5000
📨 Received message on sensors/data: {temperature: 25, humidity: 65}
💾 Sensor data saved to database
```

### ❌ Common Errors

| Error | Solution |
|-------|----------|
| `MongoDB connection error` | Start MongoDB: `mongod` |
| `Port 5000 already in use` | Change PORT in `.env` or kill process |
| `MQTT not authorized` | Check credentials in `.env` |
| `No sensor data` | Verify ESP8266 topic matches `sensors/data` |

## 🧪 Testing Workflow

```bash
# 1. Verify setup
cd backend && node verify-setup.js

# 2. Start backend
npm run dev

# 3. Test health
curl http://localhost:5000/health

# 4. Register admin user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","role":"admin"}'

# 5. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 6. Get sensor data (after ESP8266 publishes)
curl http://localhost:5000/api/sensors/current
```

## 🎯 ESP8266 Arduino Code Template

```cpp
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <DHT.h>

// WiFi
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT (HiveMQ Cloud)
const char* mqtt_server = "a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "Luzzi";
const char* mqtt_password = "Geraldo@123";
const char* mqtt_topic = "sensors/data";

// Sensors
#define DHTPIN D4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

WiFiClientSecure espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  dht.begin();

  // WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  // MQTT
  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);
  reconnect();
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP8266", mqtt_user, mqtt_password)) {
      Serial.println("MQTT connected");
    } else {
      delay(5000);
    }
  }
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  static unsigned long last = 0;
  if (millis() - last > 5000) {
    last = millis();

    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    String payload = "{\"temperature\":" + String(temp) +
                     ",\"humidity\":" + String(hum) + "}";

    client.publish(mqtt_topic, payload.c_str());
    Serial.println("Published: " + payload);
  }
}
```

## 📁 Project Structure

```
backend/
├── .env                    ← HiveMQ credentials (configured ✅)
├── server.js               ← Main server
├── models/                 ← Database schemas
├── routes/                 ← API endpoints
├── services/
│   ├── mqttService.js      ← MQTT handler
│   └── socketService.js    ← WebSocket handler
├── START_HERE.md           ← Begin here!
└── MQTT_CONFIG.md          ← MQTT reference
```

## 🔍 Useful Commands

```bash
# View backend logs
cd backend && npm run dev

# Test MQTT with mosquitto
mosquitto_pub -h a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud \
  -p 8883 -u Luzzi -P Geraldo@123 --capath /etc/ssl/certs/ \
  -t sensors/data -m '{"temperature":25,"humidity":60}'

# Check MongoDB data
mongosh
use iot_agriculture
db.sensorreadings.find().sort({timestamp:-1}).limit(5)

# Check running processes
lsof -i:5000         # Backend port
pgrep -x mongod      # MongoDB process
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `backend/START_HERE.md` | **Start here!** Complete startup guide |
| `backend/QUICKSTART.md` | Step-by-step setup |
| `backend/README.md` | Full API documentation |
| `backend/MQTT_CONFIG.md` | MQTT configuration reference |
| `BACKEND_SETUP_COMPLETE.md` | System overview |

## 🎯 Next Steps

1. ✅ Backend configured with HiveMQ
2. ✅ Dependencies installed
3. ⏳ Start MongoDB
4. ⏳ Start backend server
5. ⏳ Verify ESP8266 data reception
6. ⏳ Connect frontend dashboard
7. ⏳ Test actuator controls

## 🆘 Troubleshooting Quick Fixes

```bash
# MongoDB not starting
sudo systemctl status mongod
sudo systemctl restart mongod

# Port 5000 in use
sudo lsof -i:5000
# Kill process: kill -9 <PID>

# Reset everything
cd backend
rm -rf node_modules
npm install
node verify-setup.js
npm run dev

# Check MQTT with web client
# Visit: https://www.hivemq.com/demos/websocket-client/
# Host: a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud:8884
# User: Luzzi, Pass: Geraldo@123
```

## 🎉 Success Indicators

- ✅ `curl http://localhost:5000/health` returns JSON
- ✅ Backend console shows "Connected to MQTT broker"
- ✅ Backend console shows "Received message on sensors/data"
- ✅ `curl http://localhost:5000/api/sensors/current` returns data
- ✅ MongoDB has data: `db.sensorreadings.count()`

---

**Everything is ready! Just start MongoDB and run `npm run dev` in backend/** 🚀

**Read [backend/START_HERE.md](backend/START_HERE.md) for detailed instructions!**
