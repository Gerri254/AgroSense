# 🔌 MQTT Configuration Reference

## Your HiveMQ Cloud Cluster

```
Broker URL:    a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud
TLS Port:      8883
WebSocket:     8884
Username:      Luzzi
Password:      Geraldo@123
```

## Backend Configuration (Already Set in .env)

```env
MQTT_BROKER_URL=mqtts://a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud:8883
MQTT_USERNAME=Luzzi
MQTT_PASSWORD=Geraldo@123
MQTT_CLIENT_ID=iot_agriculture_backend_001
```

## MQTT Topics

### Backend Subscribes To (Receives Data):
```
sensors/data          ← ESP8266 publishes sensor readings here
actuators/status      ← ESP8266 publishes actuator status updates
device/status         ← ESP8266 publishes online/offline status
settings/config       ← Configuration updates
```

### Backend Publishes To (Sends Commands):
```
actuators/pump/command  → Commands to control water pump
actuators/fan/command   → Commands to control cooling fan
settings/config         → Threshold updates to ESP8266
alerts/critical         → Critical alert notifications
backend/status          → Backend online/offline status
```

## ESP8266 Arduino Configuration

Your ESP8266 should use these settings:

```cpp
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>  // For TLS

// WiFi credentials
const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";

// MQTT Broker (HiveMQ Cloud)
const char* mqtt_server = "a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;  // TLS port
const char* mqtt_user = "Luzzi";
const char* mqtt_password = "Geraldo@123";

// Topics
const char* mqtt_topic_sensors = "sensors/data";
const char* mqtt_topic_pump_cmd = "actuators/pump/command";
const char* mqtt_topic_fan_cmd = "actuators/fan/command";
const char* mqtt_topic_config = "settings/config";

// Create secure client for TLS
WiFiClientSecure espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // Set up MQTT
  espClient.setInsecure();  // For HiveMQ Cloud
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  // Connect to MQTT
  reconnect();
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");

    if (client.connect("ESP8266Client", mqtt_user, mqtt_password)) {
      Serial.println("connected");

      // Subscribe to command topics
      client.subscribe(mqtt_topic_pump_cmd);
      client.subscribe(mqtt_topic_fan_cmd);
      client.subscribe(mqtt_topic_config);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Handle incoming commands from backend
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");

  // Parse payload
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);

  // Handle pump commands
  if (String(topic) == mqtt_topic_pump_cmd) {
    // Parse JSON: {"device":"pump","status":true,"mode":"manual"}
    if (message.indexOf("\"status\":true") > 0) {
      digitalWrite(PUMP_PIN, HIGH);
      Serial.println("Pump ON");
    } else {
      digitalWrite(PUMP_PIN, LOW);
      Serial.println("Pump OFF");
    }
  }

  // Handle fan commands
  if (String(topic) == mqtt_topic_fan_cmd) {
    if (message.indexOf("\"status\":true") > 0) {
      digitalWrite(FAN_PIN, HIGH);
      Serial.println("Fan ON");
    } else {
      digitalWrite(FAN_PIN, LOW);
      Serial.println("Fan OFF");
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Publish sensor data every 5 seconds
  static unsigned long lastPublish = 0;
  if (millis() - lastPublish > 5000) {
    lastPublish = millis();

    // Read sensors
    float temperature = random(20, 30);  // Replace with DHT11.readTemperature()
    float humidity = random(40, 70);     // Replace with DHT11.readHumidity()

    // Create JSON payload
    String payload = "{\"temperature\": " + String(temperature) +
                     ", \"humidity\": " + String(humidity) + "}";

    // Publish to backend
    client.publish(mqtt_topic_sensors, payload.c_str());
    Serial.println("Published: " + payload);
  }
}
```

## Message Formats

### Sensor Data (ESP8266 → Backend)
```json
{
  "temperature": 28.5,
  "humidity": 65.2,
  "soilMoisture": 45.0,
  "waterLevel": 80.0
}
```

### Pump Command (Backend → ESP8266)
```json
{
  "device": "pump",
  "status": true,
  "mode": "manual",
  "timestamp": "2025-11-02T15:30:00Z"
}
```

### Fan Command (Backend → ESP8266)
```json
{
  "device": "fan",
  "status": false,
  "mode": "automatic",
  "timestamp": "2025-11-02T15:30:00Z"
}
```

### Threshold Config (Backend → ESP8266)
```json
{
  "thresholds": {
    "minSoilMoisture": 30,
    "maxTemperature": 35,
    "minWaterLevel": 20,
    "maxHumidity": 80
  }
}
```

## Testing MQTT Connection

### Using HiveMQ Web Client
1. Go to: https://www.hivemq.com/demos/websocket-client/
2. Connect to your broker:
   - Host: `a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud`
   - Port: `8884` (WebSocket port)
   - Username: `Luzzi`
   - Password: `Geraldo@123`
3. Subscribe to `sensors/data` to see ESP8266 messages
4. Publish test message to `sensors/data`

### Using mosquitto_pub (Command Line)
```bash
# Install mosquitto clients
sudo apt-get install mosquitto-clients

# Publish test data
mosquitto_pub \
  -h a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud \
  -p 8883 \
  -u Luzzi \
  -P Geraldo@123 \
  --capath /etc/ssl/certs/ \
  -t sensors/data \
  -m '{"temperature":25,"humidity":60}'

# Subscribe to topic
mosquitto_sub \
  -h a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud \
  -p 8883 \
  -u Luzzi \
  -P Geraldo@123 \
  --capath /etc/ssl/certs/ \
  -t sensors/data
```

### Using MQTT Explorer (GUI Tool)
1. Download: http://mqtt-explorer.com/
2. Add connection:
   - Name: `IoT Agriculture`
   - Host: `a53c717bc3b2476f8799d16df13f2b04.s1.eu.hivemq.cloud`
   - Port: `8883`
   - Username: `Luzzi`
   - Password: `Geraldo@123`
   - Enable SSL/TLS
3. Connect and monitor all topics

## Troubleshooting

### "Connection refused"
- Check username/password
- Verify port (8883 for TLS, 1883 for non-TLS)
- Ensure firewall allows outbound connections

### "Not authorized"
- Double-check credentials in `.env`
- Username: `Luzzi` (case-sensitive)
- Password: `Geraldo@123`

### "TLS handshake failed"
- Ensure using `mqtts://` (not `mqtt://`)
- Port 8883 (not 1883)
- ESP8266: Use `WiFiClientSecure` and `setInsecure()`

### "No messages received"
- Verify topic names match exactly (case-sensitive)
- Check ESP8266 serial monitor for publish confirmations
- Use HiveMQ Web Client to monitor broker activity

## Security Notes

**⚠️ IMPORTANT**: Your credentials are stored in `.env` which is gitignored.

- ✅ `.env` is in `.gitignore` - won't be committed to git
- ✅ Using TLS/SSL for encryption (`mqtts://`)
- ⚠️  Don't share credentials publicly
- ⚠️  Change password in HiveMQ Cloud for production

## HiveMQ Cloud Dashboard

Access your HiveMQ Cloud dashboard:
- URL: https://console.hivemq.cloud/
- Login with your HiveMQ account
- Monitor:
  - Connected clients
  - Message throughput
  - Topic activity
  - Error logs

---

**Your MQTT broker is ready and configured!** 🔌
