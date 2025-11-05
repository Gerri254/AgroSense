#!/bin/bash

# IoT Agriculture Backend API Test Script
# This script tests all major API endpoints

BASE_URL="http://localhost:5000"
TOKEN=""

echo "========================================"
echo "IoT Agriculture Backend API Test"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
curl -s "$BASE_URL/health" | jq '.'
echo ""

# Test 2: Register User
echo -e "${YELLOW}Test 2: Register Admin User${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "role": "admin"
  }')
echo "$REGISTER_RESPONSE" | jq '.'
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
echo ""

# Test 3: Login (if register fails, try login)
if [ "$TOKEN" == "null" ]; then
  echo -e "${YELLOW}Test 3: Login (user already exists)${NC}"
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "admin",
      "password": "admin123"
    }')
  echo "$LOGIN_RESPONSE" | jq '.'
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
  echo ""
fi

echo -e "${GREEN}Auth Token: $TOKEN${NC}"
echo ""

# Test 4: Get Current Sensor Data
echo -e "${YELLOW}Test 4: Get Current Sensor Data${NC}"
curl -s "$BASE_URL/api/sensors/current" | jq '.'
echo ""

# Test 5: Get Sensor History
echo -e "${YELLOW}Test 5: Get Sensor History (last 10 readings)${NC}"
curl -s "$BASE_URL/api/sensors/history?limit=10" | jq '.'
echo ""

# Test 6: Get Sensor Statistics
echo -e "${YELLOW}Test 6: Get Sensor Statistics (last 7 days)${NC}"
curl -s "$BASE_URL/api/sensors/stats?days=7" | jq '.'
echo ""

# Test 7: Get Settings
echo -e "${YELLOW}Test 7: Get Current Settings${NC}"
curl -s "$BASE_URL/api/settings" | jq '.'
echo ""

# Test 8: Update Thresholds
echo -e "${YELLOW}Test 8: Update Thresholds${NC}"
curl -s -X PUT "$BASE_URL/api/settings/thresholds" \
  -H "Content-Type: application/json" \
  -d '{
    "minSoilMoisture": 30,
    "maxTemperature": 35,
    "minWaterLevel": 20,
    "maxHumidity": 80
  }' | jq '.'
echo ""

# Test 9: Get Latest Alert
echo -e "${YELLOW}Test 9: Get Latest Alert${NC}"
curl -s "$BASE_URL/api/alerts/latest" | jq '.'
echo ""

# Test 10: Get Alerts
echo -e "${YELLOW}Test 10: Get All Alerts (last 10)${NC}"
curl -s "$BASE_URL/api/alerts?limit=10" | jq '.'
echo ""

# Test 11: Control Pump (Turn ON)
echo -e "${YELLOW}Test 11: Turn Pump ON${NC}"
curl -s -X POST "$BASE_URL/api/actuators/pump/control" \
  -H "Content-Type: application/json" \
  -d '{
    "status": true,
    "mode": "manual"
  }' | jq '.'
echo ""

# Wait a bit
sleep 2

# Test 12: Control Pump (Turn OFF)
echo -e "${YELLOW}Test 12: Turn Pump OFF${NC}"
curl -s -X POST "$BASE_URL/api/actuators/pump/control" \
  -H "Content-Type: application/json" \
  -d '{
    "status": false,
    "mode": "manual"
  }' | jq '.'
echo ""

# Test 13: Get Actuator Logs
echo -e "${YELLOW}Test 13: Get Actuator Logs${NC}"
curl -s "$BASE_URL/api/actuators/logs?limit=10" | jq '.'
echo ""

# Test 14: Get Actuator Stats
echo -e "${YELLOW}Test 14: Get Actuator Statistics${NC}"
curl -s "$BASE_URL/api/actuators/stats?days=7" | jq '.'
echo ""

echo -e "${GREEN}========================================"
echo "All Tests Complete!"
echo "========================================${NC}"
echo ""
echo "If you see data in the responses above, your backend is working correctly!"
echo ""
echo "Next steps:"
echo "1. Make sure your ESP8266 is publishing data"
echo "2. Watch the backend console for incoming MQTT messages"
echo "3. Connect your frontend dashboard"
