/*
 * IoT Smart Agriculture System - ESP8266 Firmware
 *
 * Hardware:
 * - LOLIN(WEMOS) D1 R2 & Mini (ESP8266)
 * - DHT11 Temperature & Humidity Sensor
 * - Soil Moisture Sensor (Analog)
 * - Water Level Sensor (Analog)
 * - 2-Channel Relay Module (for Pump & Fan)
 *
 * Features:
 * - Publishes sensor data to MQTT broker
 * - Subscribes to control commands
 * - Auto/Manual mode for actuators
 * - WiFi reconnection handling
 * - MQTT reconnection handling
 */

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Configuration
const char* mqtt_server = "YOUR_MQTT_BROKER_IP";
const int mqtt_port = 1883;
const char* mqtt_user = "YOUR_MQTT_USERNAME";  // Leave empty if no auth
const char* mqtt_password = "YOUR_MQTT_PASSWORD";  // Leave empty if no auth
const char* mqtt_client_id = "ESP8266-Agriculture-01";

// MQTT Topics
const char* topic_sensors = "agriculture/sensors";
const char* topic_actuators = "agriculture/actuators";
const char* topic_status = "agriculture/status";
const char* topic_alerts = "agriculture/alerts";
const char* topic_cmd_pump = "agriculture/commands/pump";
const char* topic_cmd_fan = "agriculture/commands/fan";
const char* topic_cmd_config = "agriculture/commands/config";

// Pin Definitions
#define DHT_PIN D4              // DHT11 data pin
#define SOIL_MOISTURE_PIN A0    // Soil moisture sensor (analog)
#define WATER_LEVEL_PIN D0      // Water level sensor (digital, or use analog if available)
#define PUMP_RELAY_PIN D1       // Water pump relay
#define FAN_RELAY_PIN D2        // Cooling fan relay

#define DHT_TYPE DHT11

// Sensor & Timing
DHT dht(DHT_PIN, DHT_TYPE);
WiFiClient espClient;
PubSubClient client(espClient);

// Timing intervals (milliseconds)
unsigned long lastSensorRead = 0;
unsigned long lastStatusPublish = 0;
const long sensorInterval = 5000;    // Read sensors every 5 seconds
const long statusInterval = 30000;   // Publish status every 30 seconds

// Sensor data
float temperature = 0.0;
float humidity = 0.0;
int soilMoisture = 0;
int waterLevel = 0;

// Actuator states
bool pumpStatus = false;
bool fanStatus = false;
String pumpMode = "auto";
String fanMode = "auto";

// Thresholds (can be updated via MQTT)
int soilMoistureMin = 30;
int soilMoistureMax = 70;
float temperatureMax = 35.0;
int waterLevelMin = 20;

void setup() {
  Serial.begin(115200);
  Serial.println("\n\nIoT Smart Agriculture System - ESP8266");
  Serial.println("========================================");

  // Initialize pins
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  pinMode(FAN_RELAY_PIN, OUTPUT);
  pinMode(WATER_LEVEL_PIN, INPUT);

  digitalWrite(PUMP_RELAY_PIN, LOW);  // Relays OFF initially
  digitalWrite(FAN_RELAY_PIN, LOW);

  // Initialize DHT sensor
  dht.begin();

  // Connect to WiFi
  setupWiFi();

  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);
}

void loop() {
  // Maintain connections
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  unsigned long currentMillis = millis();

  // Read sensors periodically
  if (currentMillis - lastSensorRead >= sensorInterval) {
    lastSensorRead = currentMillis;
    readSensors();
    publishSensorData();
    checkThresholds();  // Auto mode logic
  }

  // Publish status periodically
  if (currentMillis - lastStatusPublish >= statusInterval) {
    lastStatusPublish = currentMillis;
    publishStatus();
  }
}

// WiFi Setup
void setupWiFi() {
  delay(10);
  Serial.println("\nConnecting to WiFi...");
  Serial.print("SSID: ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Signal strength (RSSI): ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");
}

// MQTT Reconnect
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT broker...");

    // Attempt to connect
    if (client.connect(mqtt_client_id, mqtt_user, mqtt_password)) {
      Serial.println(" connected!");

      // Subscribe to command topics
      client.subscribe(topic_cmd_pump);
      client.subscribe(topic_cmd_fan);
      client.subscribe(topic_cmd_config);

      // Publish online status
      publishStatus();
    } else {
      Serial.print(" failed, rc=");
      Serial.print(client.state());
      Serial.println(". Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

// MQTT Callback
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("]: ");

  // Convert payload to string
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);

  // Parse JSON
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error) {
    Serial.print("JSON parse failed: ");
    Serial.println(error.c_str());
    return;
  }

  // Handle pump commands
  if (String(topic) == topic_cmd_pump) {
    bool status = doc["status"];
    String mode = doc["mode"] | "manual";

    pumpMode = mode;
    if (mode == "manual") {
      pumpStatus = status;
      digitalWrite(PUMP_RELAY_PIN, status ? HIGH : LOW);
      Serial.print("Pump manually set to: ");
      Serial.println(status ? "ON" : "OFF");
    }
    publishActuatorStatus();
  }

  // Handle fan commands
  if (String(topic) == topic_cmd_fan) {
    bool status = doc["status"];
    String mode = doc["mode"] | "manual";

    fanMode = mode;
    if (mode == "manual") {
      fanStatus = status;
      digitalWrite(FAN_RELAY_PIN, status ? HIGH : LOW);
      Serial.print("Fan manually set to: ");
      Serial.println(status ? "ON" : "OFF");
    }
    publishActuatorStatus();
  }

  // Handle config updates
  if (String(topic) == topic_cmd_config) {
    if (doc.containsKey("soilMoisture")) {
      soilMoistureMin = doc["soilMoisture"]["min"];
      soilMoistureMax = doc["soilMoisture"]["max"];
    }
    if (doc.containsKey("temperature")) {
      temperatureMax = doc["temperature"]["max"];
    }
    if (doc.containsKey("waterLevel")) {
      waterLevelMin = doc["waterLevel"]["min"];
    }
    Serial.println("Configuration updated!");
  }
}

// Read all sensors
void readSensors() {
  // Read DHT11
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    humidity = 0;
    temperature = 0;
  }

  // Read Soil Moisture (0-1023, convert to 0-100%)
  int rawSoil = analogRead(SOIL_MOISTURE_PIN);
  soilMoisture = map(rawSoil, 1023, 0, 0, 100);  // Reverse: dry=high, wet=low
  soilMoisture = constrain(soilMoisture, 0, 100);

  // Read Water Level (digital or analog depending on sensor)
  int rawWater = digitalRead(WATER_LEVEL_PIN);
  waterLevel = rawWater ? 100 : 20;  // Simplified: full or low

  Serial.println("--- Sensor Readings ---");
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" °C");
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");
  Serial.print("Soil Moisture: ");
  Serial.print(soilMoisture);
  Serial.println(" %");
  Serial.print("Water Level: ");
  Serial.print(waterLevel);
  Serial.println(" %");
  Serial.println("---------------------");
}

// Publish sensor data to MQTT
void publishSensorData() {
  StaticJsonDocument<256> doc;

  doc["deviceId"] = mqtt_client_id;
  doc["soilMoisture"] = soilMoisture;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["waterLevel"] = waterLevel;
  doc["timestamp"] = millis();

  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);

  client.publish(topic_sensors, jsonBuffer);
  Serial.println("Published sensor data");
}

// Publish actuator status
void publishActuatorStatus() {
  StaticJsonDocument<256> doc;

  doc["deviceId"] = mqtt_client_id;

  JsonObject waterPump = doc.createNestedObject("waterPump");
  waterPump["status"] = pumpStatus;
  waterPump["mode"] = pumpMode;

  JsonObject coolingFan = doc.createNestedObject("coolingFan");
  coolingFan["status"] = fanStatus;
  coolingFan["mode"] = fanMode;

  doc["timestamp"] = millis();

  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);

  client.publish(topic_actuators, jsonBuffer);
  Serial.println("Published actuator status");
}

// Publish device status
void publishStatus() {
  StaticJsonDocument<256> doc;

  doc["deviceId"] = mqtt_client_id;
  doc["online"] = true;
  doc["lastSeen"] = millis();
  doc["ipAddress"] = WiFi.localIP().toString();
  doc["rssi"] = WiFi.RSSI();
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["uptime"] = millis() / 1000;

  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);

  client.publish(topic_status, jsonBuffer, true);  // Retained message
  Serial.println("Published device status");
}

// Check thresholds and control actuators in auto mode
void checkThresholds() {
  bool alertTriggered = false;
  String alertMessage = "";
  String alertType = "";

  // Auto pump control based on soil moisture
  if (pumpMode == "auto") {
    if (soilMoisture < soilMoistureMin && !pumpStatus) {
      pumpStatus = true;
      digitalWrite(PUMP_RELAY_PIN, HIGH);
      Serial.println("AUTO: Pump turned ON (low soil moisture)");
      publishAlert("low_soil_moisture", "critical", "Soil moisture low - irrigation started");
      publishActuatorStatus();
    } else if (soilMoisture > soilMoistureMax && pumpStatus) {
      pumpStatus = false;
      digitalWrite(PUMP_RELAY_PIN, LOW);
      Serial.println("AUTO: Pump turned OFF (soil moisture sufficient)");
      publishActuatorStatus();
    }
  }

  // Auto fan control based on temperature
  if (fanMode == "auto") {
    if (temperature > temperatureMax && !fanStatus) {
      fanStatus = true;
      digitalWrite(FAN_RELAY_PIN, HIGH);
      Serial.println("AUTO: Fan turned ON (high temperature)");
      publishAlert("high_temperature", "warning", "Temperature exceeded threshold - cooling activated");
      publishActuatorStatus();
    } else if (temperature <= (temperatureMax - 2) && fanStatus) {
      fanStatus = false;
      digitalWrite(FAN_RELAY_PIN, LOW);
      Serial.println("AUTO: Fan turned OFF (temperature normal)");
      publishActuatorStatus();
    }
  }

  // Water level alert
  if (waterLevel < waterLevelMin) {
    publishAlert("low_water_level", "critical", "Water reservoir level critically low!");
  }
}

// Publish alert
void publishAlert(String type, String severity, String message) {
  StaticJsonDocument<256> doc;

  doc["deviceId"] = mqtt_client_id;
  doc["type"] = type;
  doc["severity"] = severity;
  doc["message"] = message;
  doc["timestamp"] = millis();

  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);

  client.publish(topic_alerts, jsonBuffer);
  Serial.print("ALERT: ");
  Serial.println(message);
}
