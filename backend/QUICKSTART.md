# Backend Quick Start Guide

## Step 1: Install MongoDB (if not already installed)

### Option A: Local MongoDB
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
mongod
```

### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string
4. Whitelist your IP address

## Step 2: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual credentials:

   ```env
   # Server
   PORT=5000

   # MongoDB (choose one)
   # Local:
   MONGODB_URI=mongodb://localhost:27017/iot_agriculture

   # Or Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/iot_agriculture

   # HiveMQ Cloud (use YOUR actual credentials)
   MQTT_BROKER_URL=mqtt://your-broker.hivemq.cloud:1883
   MQTT_USERNAME=your_mqtt_username
   MQTT_PASSWORD=your_mqtt_password
   MQTT_CLIENT_ID=iot_agriculture_backend

   # MQTT Topics (must match your ESP8266 code)
   MQTT_TOPIC_SENSORS=sensors/data
   MQTT_TOPIC_ACTUATORS=actuators/status
   MQTT_TOPIC_PUMP_CMD=actuators/pump/command
   MQTT_TOPIC_FAN_CMD=actuators/fan/command
   MQTT_TOPIC_CONFIG=settings/config
   MQTT_TOPIC_ALERTS=alerts/critical
   MQTT_TOPIC_DEVICE_STATUS=device/status

   # JWT Secret (generate a random string)
   JWT_SECRET=change_this_to_a_random_secure_string_12345

   # CORS (Frontend URL)
   CORS_ORIGIN=http://localhost:5173
   ```

## Step 3: Get HiveMQ Cloud Credentials

Since your ESP8266 is already connected to HiveMQ Cloud:

1. Log into your HiveMQ Cloud account
2. Go to your cluster settings
3. Copy the following:
   - Broker URL (e.g., `mqtt://abc123.s1.eu.hivemq.cloud:1883`)
   - Username
   - Password
4. Paste them into your `.env` file

## Step 4: Verify ESP8266 Topic

In your Arduino code, you have:
```cpp
String payload = "{\"temperature\": " + String(temperature) + ", \"humidity\": " + String(humidity) + "}";
client.publish(mqtt_topic_pub, payload.c_str());
```

Make sure `mqtt_topic_pub` in your Arduino code matches `MQTT_TOPIC_SENSORS` in your `.env` file.

If your Arduino uses `sensors/data`, then `.env` should have:
```env
MQTT_TOPIC_SENSORS=sensors/data
```

## Step 5: Start the Backend Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

You should see:
```
✅ Connected to MongoDB
✅ Connected to MQTT broker
📡 Subscribed to topic: sensors/data
🚀 Server running on port 5000
```

## Step 6: Test MQTT Data Reception

When your ESP8266 publishes data, you should see in the backend console:
```
📨 Received message on sensors/data: { temperature: 25, humidity: 65 }
💾 Sensor data saved to database
```

## Step 7: Test API Endpoints

### Check Health
```bash
curl http://localhost:5000/health
```

### Get Latest Sensor Data
```bash
curl http://localhost:5000/api/sensors/current
```

### Create Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "role": "admin"
  }'
```

## Step 8: Update Your ESP8266 Code (Optional)

To send all sensor data including soil moisture and water level, update your Arduino code:

```cpp
// Add these sensors when ready
float soilMoisture = analogRead(A0) * (100.0 / 1023.0);
float waterLevel = random(0, 100); // Replace with actual sensor

String payload = "{\"temperature\": " + String(temperature) +
                 ", \"humidity\": " + String(humidity) +
                 ", \"soilMoisture\": " + String(soilMoisture) +
                 ", \"waterLevel\": " + String(waterLevel) + "}";
```

## Troubleshooting

### "MQTT connection error"
- Verify HiveMQ credentials in `.env`
- Check if broker URL includes `mqtt://` prefix
- Test credentials with MQTT.fx or MQTT Explorer

### "MongoDB connection error"
- Check if MongoDB is running: `mongod`
- Verify connection string in `.env`
- For Atlas: whitelist your IP

### "No sensor data appearing"
- Check ESP8266 serial monitor for publish confirmations
- Verify topic names match between Arduino and `.env`
- Use MQTT Explorer to monitor broker messages

### Test MQTT with curl (alternative)
You can simulate ESP8266 data:
```bash
# Install mosquitto-clients
sudo apt-get install mosquitto-clients

# Publish test data
mosquitto_pub -h your-broker.hivemq.cloud \
  -p 1883 \
  -u your_username \
  -P your_password \
  -t sensors/data \
  -m '{"temperature":25,"humidity":60,"soilMoisture":45,"waterLevel":80}'
```

## Next Steps

1. ✅ Backend receiving ESP8266 data
2. ✅ Data stored in MongoDB
3. ✅ API endpoints working
4. 🔄 Connect frontend dashboard
5. 🔄 Test actuator controls
6. 🔄 Set up alerts and thresholds

## Support

Check the main README.md for full API documentation and advanced configuration.
