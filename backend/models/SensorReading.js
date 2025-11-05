import mongoose from 'mongoose';

const sensorReadingSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true,
    default: 'esp8266_001'
  },
  temperature: {
    type: Number,
    required: true,
    min: -50,
    max: 100
  },
  humidity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  soilMoisture: {
    type: Number,
    min: 0,
    max: 100
  },
  waterLevel: {
    type: Number,
    min: 0,
    max: 100
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient time-range queries
sensorReadingSchema.index({ timestamp: -1 });
sensorReadingSchema.index({ deviceId: 1, timestamp: -1 });

// TTL index to auto-delete old data (90 days)
sensorReadingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const SensorReading = mongoose.model('SensorReading', sensorReadingSchema);

export default SensorReading;
