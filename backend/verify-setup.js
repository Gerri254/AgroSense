#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks all backend requirements before starting the server
 */

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

console.log('\n🔍 IoT Agriculture Backend - Setup Verification\n');
console.log('='.repeat(60));

let errors = 0;
let warnings = 0;

// Check 1: Environment variables
console.log('\n1️⃣  Checking environment variables...');
const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'MQTT_BROKER_URL',
  'MQTT_USERNAME',
  'MQTT_PASSWORD',
  'JWT_SECRET'
];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName}: ${varName.includes('PASSWORD') || varName.includes('SECRET') ? '***' : process.env[varName]}`);
  } else {
    console.log(`   ❌ ${varName}: MISSING`);
    errors++;
  }
});

// Check 2: HiveMQ Configuration
console.log('\n2️⃣  Checking HiveMQ configuration...');
if (process.env.MQTT_BROKER_URL) {
  if (process.env.MQTT_BROKER_URL.startsWith('mqtts://')) {
    console.log('   ✅ Using secure TLS connection (mqtts://)');
  } else if (process.env.MQTT_BROKER_URL.startsWith('mqtt://')) {
    console.log('   ⚠️  Using unencrypted connection (mqtt://). Consider using mqtts:// for production.');
    warnings++;
  }

  if (process.env.MQTT_BROKER_URL.includes('hivemq.cloud')) {
    console.log('   ✅ HiveMQ Cloud detected');
    console.log(`   ℹ️  Broker: ${process.env.MQTT_BROKER_URL}`);
    console.log(`   ℹ️  Username: ${process.env.MQTT_USERNAME}`);
  }
}

// Check 3: MongoDB
console.log('\n3️⃣  Checking MongoDB...');
if (process.env.MONGODB_URI.includes('localhost') || process.env.MONGODB_URI.includes('127.0.0.1')) {
  console.log('   ℹ️  Using local MongoDB');

  // Try to check if MongoDB is running
  try {
    execSync('pgrep -x mongod', { stdio: 'ignore' });
    console.log('   ✅ MongoDB process detected (running)');
  } catch (error) {
    console.log('   ⚠️  MongoDB process not detected. Make sure MongoDB is running:');
    console.log('      Run: mongod');
    warnings++;
  }
} else if (process.env.MONGODB_URI.includes('mongodb+srv')) {
  console.log('   ✅ Using MongoDB Atlas (cloud)');
} else if (process.env.MONGODB_URI.includes('mongodb://')) {
  console.log('   ✅ Using remote MongoDB');
}

// Check 4: Node modules
console.log('\n4️⃣  Checking dependencies...');
const packageJsonPath = join(__dirname, 'package.json');
const nodeModulesPath = join(__dirname, 'node_modules');

if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules directory exists');

  // Check critical packages
  const criticalPackages = ['express', 'mongoose', 'mqtt', 'socket.io', 'dotenv'];
  criticalPackages.forEach(pkg => {
    const pkgPath = join(nodeModulesPath, pkg);
    if (fs.existsSync(pkgPath)) {
      console.log(`   ✅ ${pkg} installed`);
    } else {
      console.log(`   ❌ ${pkg} NOT installed`);
      errors++;
    }
  });
} else {
  console.log('   ❌ node_modules not found. Run: npm install');
  errors++;
}

// Check 5: Required files
console.log('\n5️⃣  Checking required files...');
const requiredFiles = [
  'server.js',
  'services/mqttService.js',
  'services/socketService.js',
  'models/SensorReading.js',
  'models/ActuatorLog.js',
  'models/Alert.js',
  'routes/sensorRoutes.js',
  'routes/actuatorRoutes.js'
];

requiredFiles.forEach(file => {
  const filePath = join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} missing`);
    errors++;
  }
});

// Check 6: MQTT Topics
console.log('\n6️⃣  Checking MQTT topic configuration...');
console.log(`   ℹ️  Sensor topic: ${process.env.MQTT_TOPIC_SENSORS || 'sensors/data'}`);
console.log('   ⚠️  Make sure your ESP8266 publishes to this exact topic!');

// Check 7: Port availability
console.log('\n7️⃣  Checking port availability...');
const port = process.env.PORT || 5000;
try {
  execSync(`lsof -i:${port}`, { stdio: 'ignore' });
  console.log(`   ⚠️  Port ${port} is already in use. Stop the other process or change PORT in .env`);
  warnings++;
} catch (error) {
  console.log(`   ✅ Port ${port} is available`);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Verification Summary:\n');

if (errors === 0 && warnings === 0) {
  console.log('   🎉 All checks passed! Your backend is ready to start.\n');
  console.log('   Next steps:');
  console.log('   1. Start MongoDB (if using local): mongod');
  console.log('   2. Start backend server: npm run dev');
  console.log('   3. Check console for "Connected to MQTT broker"');
  console.log('   4. Verify your ESP8266 is publishing data\n');
} else {
  if (errors > 0) {
    console.log(`   ❌ ${errors} error(s) found - fix these before starting`);
  }
  if (warnings > 0) {
    console.log(`   ⚠️  ${warnings} warning(s) found - review these`);
  }
  console.log('');
}

console.log('='.repeat(60) + '\n');

process.exit(errors > 0 ? 1 : 0);
