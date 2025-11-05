# 🚀 START HERE - Backend Ready to Launch!

Your backend is **fully configured** and connected to your HiveMQ Cloud! Here's how to start it.

## ✅ Current Status

```
✅ HiveMQ Cloud configured
   • Broker: a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud:8883
   • Username: Luzzi
   • Connection: Secure TLS (mqtts://)
   • Topic: sensors/data

✅ Backend code ready
   • All dependencies installed
   • All files in place
   • Port 5000 available

⏳ MongoDB needed
   • Local MongoDB OR MongoDB Atlas required
```

## 🎯 Two Options to Start

### Option 1: Quick Test (Without MongoDB - Limited)

If you just want to test MQTT connection without database:

**Note**: This won't store data, but will show MQTT messages in console.

1. **Temporarily comment out MongoDB in `server.js`** (lines 82-111)
2. **Start server**:
   ```bash
   npm run dev
   ```
3. **You'll see** ESP8266 data in console but won't save to database

### Option 2: Full Setup (With MongoDB - Recommended)

#### A. Using Local MongoDB (Easiest for Testing)

1. **Install MongoDB**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install -y mongodb

   # OR download from: https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB**:
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod

   # OR run directly
   mongod --dbpath ~/mongodb-data
   ```

3. **Verify MongoDB is running**:
   ```bash
   mongosh
   # If you see MongoDB shell, it's working! Type 'exit' to quit
   ```

4. **Start backend**:
   ```bash
   cd backend
   npm run dev
   ```

#### B. Using MongoDB Atlas (Cloud - Free Tier)

1. **Create free account**: https://www.mongodb.com/cloud/atlas/register

2. **Create free cluster**:
   - Choose free tier (M0)
   - Select region closest to you (Europe for EU HiveMQ)
   - Click "Create Cluster"

3. **Set up access**:
   - Go to "Database Access" → Add user (username/password)
   - Go to "Network Access" → Add IP (0.0.0.0/0 for testing)

4. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

5. **Update `.env`**:
   ```bash
   nano .env
   ```
   Replace the MongoDB line with:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/iot_agriculture
   ```

6. **Start backend**:
   ```bash
   npm run dev
   ```

## 📝 Expected Console Output (Success)

When everything works, you'll see:

```
✅ Connected to MongoDB
🔌 Connecting to MQTT broker: mqtts://a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud:8883
✅ Connected to MQTT broker
📡 Subscribed to topic: sensors/data
📡 Subscribed to topic: actuators/status
📡 Subscribed to topic: device/status
📡 Subscribed to topic: settings/config
🔌 Socket.IO initialized

🚀 Server running on port 5000
📡 API: http://localhost:5000
🔌 WebSocket: ws://localhost:5000
🌍 CORS enabled for: http://localhost:5173

📊 Environment: development
```

## 🔄 When Your ESP8266 Publishes Data

Every 5 seconds, you should see:

```
📨 Received message on sensors/data: { temperature: 25, humidity: 65 }
💾 Sensor data saved to database
```

If you see this, **IT'S WORKING!** 🎉

## 🧪 Testing the Backend

### 1. Test Health Endpoint
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "mongodb": "connected",
  "mqtt": "connected",
  "connectedClients": 0
}
```

### 2. Test Sensor Data (after ESP8266 publishes)
```bash
curl http://localhost:5000/api/sensors/current
```

### 3. Run Full Test Suite
```bash
cd backend
./test-api.sh
```

## 🔧 Troubleshooting

### "MongoDB connection error"

**Solution 1**: Start local MongoDB
```bash
sudo systemctl start mongod
# OR
mongod
```

**Solution 2**: Use MongoDB Atlas (see Option 2B above)

### "MQTT connection error: Not authorized"

This means HiveMQ credentials are wrong. Double-check `.env`:
```env
MQTT_USERNAME=Luzzi
MQTT_PASSWORD=Geraldo@123
```

### "Port 5000 already in use"

Change port in `.env`:
```env
PORT=5001
```

### "No sensor data appearing"

1. Check ESP8266 serial monitor - is it publishing?
2. Verify topic in Arduino code matches `.env`:
   ```cpp
   const char* mqtt_topic_pub = "sensors/data";  // Must match!
   ```
3. Check HiveMQ Web Client to see messages

## 📱 Your ESP8266 Arduino Code

Make sure your ESP8266 uses these settings:

```cpp
// MQTT Broker (HiveMQ Cloud)
const char* mqtt_server = "a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;  // TLS port
const char* mqtt_user = "Luzzi";
const char* mqtt_password = "Geraldo@123";

// Topic (must match backend)
const char* mqtt_topic_pub = "sensors/data";

// Publish format
String payload = "{\"temperature\": " + String(temperature) +
                 ", \"humidity\": " + String(humidity) + "}";
client.publish(mqtt_topic_pub, payload.c_str());
```

## 🎯 Next Steps After Backend Starts

1. ✅ Backend receiving ESP8266 data
2. ✅ Data stored in MongoDB
3. ✅ API endpoints working
4. 🔄 **Connect frontend dashboard**
5. 🔄 Test actuator controls
6. 🔄 Set up alerts and thresholds

## 🆘 Need Help?

Check these files:
- [QUICKSTART.md](QUICKSTART.md) - Detailed setup guide
- [README.md](README.md) - Full API documentation
- [INTEGRATION_DIAGRAM.md](INTEGRATION_DIAGRAM.md) - System flow diagrams
- [../BACKEND_SETUP_COMPLETE.md](../BACKEND_SETUP_COMPLETE.md) - Complete overview

## 🚀 Quick Command Reference

```bash
# Verify setup
node verify-setup.js

# Start backend (development)
npm run dev

# Start backend (production)
npm start

# Test API
./test-api.sh

# Check MongoDB
mongosh

# View logs
tail -f logs/backend.log  # if using PM2
```

---

## ⚡ FASTEST WAY TO START (If MongoDB Installed)

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd backend
npm run dev

# Terminal 3: Test
curl http://localhost:5000/health
```

**That's it!** Your backend will now receive data from your ESP8266 and store it in MongoDB! 🌾

---

**Your HiveMQ Cloud is already configured and waiting!** Just start MongoDB and run the backend! 🎉
