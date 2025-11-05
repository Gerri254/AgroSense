import mongoose from 'mongoose';

const actuatorLogSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true,
    default: 'esp8266_001'
  },
  actuatorType: {
    type: String,
    required: true,
    enum: ['water_pump', 'cooling_fan'],
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: ['ON', 'OFF']
  },
  trigger: {
    type: String,
    required: true,
    enum: ['automatic', 'manual'],
    default: 'manual'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reason: {
    type: String,
    default: null
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
actuatorLogSchema.index({ timestamp: -1 });
actuatorLogSchema.index({ actuatorType: 1, timestamp: -1 });

// TTL index to auto-delete old logs (90 days)
actuatorLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const ActuatorLog = mongoose.model('ActuatorLog', actuatorLogSchema);

export default ActuatorLog;
