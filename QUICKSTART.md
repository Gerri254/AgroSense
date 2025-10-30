# IoT Smart Agriculture System - Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

This guide will help you quickly set up and run the IoT Smart Agriculture System dashboard.

## Prerequisites

- ✅ Node.js 16+ installed ([Download](https://nodejs.org/))
- ✅ MQTT Broker (Mosquitto recommended)
- ✅ Modern web browser (Chrome, Firefox, Safari)

## Step 1: Clone/Download Project

Navigate to the project directory:
```bash
cd "/home/biggie/Documents/Lwiki Project"
```

## Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will install all required packages (~2-3 minutes).

## Step 3: Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

**For Quick Testing**: You can skip MQTT configuration and use the demo mode.

**For Real MQTT Connection**: Edit `.env` and update:
```env
VITE_MQTT_BROKER_URL=ws://localhost:8080
VITE_MQTT_USERNAME=
VITE_MQTT_PASSWORD=
```

## Step 4: Start the Application

```bash
npm run dev
```

The dashboard will open at: **http://localhost:5173**

## Step 5: Login

Use the default credentials:
- **Username**: `admin`
- **Password**: `admin123`

## 🎉 You're Done!

You should now see the Smart Agriculture Dashboard with:
- 📊 Dashboard Tab - Real-time sensor monitoring
- 🎮 Control Tab - Manual actuator controls
- 📈 Analytics Tab - Historical data charts
- ⚙️  Settings Tab - Configuration interface

---

## Testing Without ESP8266 Hardware

The dashboard works in "demo mode" without physical hardware. You can:

1. ✅ Explore the UI and all features
2. ✅ Test manual controls (pump/fan toggles)
3. ✅ Adjust threshold settings
4. ✅ View charts and analytics
5. ⚠️  Sensor data will show as 0 (no live data)

To simulate live data, you need an MQTT broker and can use MQTT test clients.

---

## Setting Up MQTT Broker (Optional but Recommended)

### Quick Install - Mosquitto

**Ubuntu/Debian**:
```bash
sudo apt-get install mosquitto mosquitto-clients
```

**macOS**:
```bash
brew install mosquitto
brew services start mosquitto
```

**Windows**:
Download from [mosquitto.org](https://mosquitto.org/download/)

### Configure WebSocket Support

Create or edit `/etc/mosquitto/mosquitto.conf`:

```conf
# MQTT Protocol (for ESP8266)
listener 1883
protocol mqtt

# WebSocket Protocol (for Browser)
listener 8080
protocol websockets
```

Restart Mosquitto:
```bash
sudo systemctl restart mosquitto
```

Or:
```bash
mosquitto -c /etc/mosquitto/mosquitto.conf
```

---

## Testing MQTT Connection

### Test Publishing Sensor Data

Open a terminal and publish test sensor data:

```bash
mosquitto_pub -t "agriculture/sensors" -m '{
  "deviceId": "ESP8266-01",
  "soilMoisture": 45.5,
  "temperature": 28.3,
  "humidity": 65.0,
  "waterLevel": 80.0,
  "timestamp": "'$(date -Iseconds)'"
}'
```

You should see the data appear in real-time on the dashboard!

### Test Multiple Sensor Readings

```bash
# Publish every 5 seconds
while true; do
  mosquitto_pub -t "agriculture/sensors" -m "{
    \"deviceId\": \"ESP8266-01\",
    \"soilMoisture\": $((RANDOM % 100)),
    \"temperature\": $((20 + RANDOM % 20)),
    \"humidity\": $((40 + RANDOM % 40)),
    \"waterLevel\": $((50 + RANDOM % 50))
  }"
  sleep 5
done
```

### Test Actuator Status

```bash
mosquitto_pub -t "agriculture/actuators" -m '{
  "deviceId": "ESP8266-01",
  "waterPump": {
    "status": true,
    "mode": "auto"
  },
  "coolingFan": {
    "status": false,
    "mode": "auto"
  }
}'
```

### Subscribe to Commands

See commands sent from the dashboard:

```bash
mosquitto_sub -t "agriculture/commands/#" -v
```

Now toggle the pump or fan in the Control tab and watch the commands appear!

---

## Testing with ESP8266 Firmware

1. **Upload Firmware**
   - Open `ESP8266_Firmware_Example.ino` in Arduino IDE
   - Update WiFi and MQTT credentials
   - Upload to ESP8266

2. **Connect Sensors** (Optional)
   - DHT11 → D4
   - Soil Moisture Sensor → A0
   - Water Level Sensor → D0
   - Pump Relay → D1
   - Fan Relay → D2

3. **Monitor Serial Output**
   - Open Serial Monitor (115200 baud)
   - Watch for "WiFi connected" and "MQTT connected"
   - See sensor readings every 5 seconds

4. **View Live Data**
   - Refresh dashboard
   - Watch real-time sensor updates
   - Test manual controls

---

## Dashboard Features

### Dashboard Tab
- **Real-time Cards**: Soil moisture, temperature, humidity, water level
- **Trend Indicators**: Up/down arrows showing changes
- **Threshold Warnings**: Red borders when values exceed limits
- **Actuator Status**: Pump and fan ON/OFF indicators
- **Alert Banner**: Critical system notifications

### Control Tab
- **Manual Override**: Direct pump/fan control
- **Safety Confirmations**: Prevent accidental activation
- **Auto/Manual Toggle**: Switch between modes
- **Current Conditions**: View current sensor values

### Analytics Tab
- **Time Ranges**: 1h, 6h, 24h, 7d, 30d
- **Interactive Charts**: Line charts for all sensors
- **Data Export**: Download CSV for analysis
- **Action Log**: View all manual and automated actions

### Settings Tab
- **Thresholds**: Configure min/max values
- **Visual Sliders**: See threshold ranges
- **Automation**: Enable/disable auto mode
- **GSM Alerts**: Configure SMS notifications

---

## Troubleshooting

### Dashboard Not Loading
- Check `npm run dev` is running
- Visit http://localhost:5173
- Check browser console for errors

### MQTT Not Connecting
- Verify Mosquitto is running: `ps aux | grep mosquitto`
- Check WebSocket port: `netstat -an | grep 8080`
- Ensure firewall allows port 8080
- Check `.env` has correct BROKER_URL

### No Sensor Data
- Check MQTT broker connection (green indicator in header)
- Verify ESP8266 is publishing (use `mosquitto_sub`)
- Check topic names match configuration
- Test with manual MQTT publish command

### Build Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Production Deployment

### Build for Production

```bash
cd frontend
npm run build
```

Files will be in `frontend/dist/` directory.

### Deploy Options

1. **Static Hosting** (Netlify, Vercel, GitHub Pages)
   - Upload `dist/` folder
   - Configure environment variables

2. **Web Server** (Nginx, Apache)
   - Copy `dist/` to web root
   - Configure HTTPS
   - Set up MQTT broker with TLS

3. **Docker** (Optional)
   - Create Dockerfile
   - Build image
   - Deploy container

---

## Next Steps

1. ✅ Explore all dashboard features
2. ✅ Test manual controls
3. ✅ Configure thresholds
4. ✅ Set up ESP8266 hardware
5. ✅ Monitor real-time data
6. ✅ Export and analyze historical data

## Support & Documentation

- 📖 Full README: `/frontend/README.md`
- 🔧 ESP8266 Firmware: `/ESP8266_Firmware_Example.ino`
- 📊 Development Log: `/DEVELOPMENT_LOG.md`

---

**Happy Farming! 🌱**
