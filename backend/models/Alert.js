import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true,
    default: 'esp8266_001'
  },
  type: {
    type: String,
    required: true,
    enum: ['critical', 'warning', 'info'],
    index: true
  },
  message: {
    type: String,
    required: true
  },
  sensorType: {
    type: String,
    enum: ['soil_moisture', 'temperature', 'humidity', 'water_level'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  acknowledged: {
    type: Boolean,
    default: false,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
alertSchema.index({ timestamp: -1 });
alertSchema.index({ acknowledged: 1, timestamp: -1 });

// TTL index to auto-delete old acknowledged alerts (30 days)
alertSchema.index(
  { timestamp: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { acknowledged: true }
  }
);

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
