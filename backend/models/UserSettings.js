import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  thresholds: {
    minSoilMoisture: {
      type: Number,
      default: 30,
      min: 0,
      max: 100
    },
    maxTemperature: {
      type: Number,
      default: 35,
      min: 0,
      max: 60
    },
    minWaterLevel: {
      type: Number,
      default: 20,
      min: 0,
      max: 100
    },
    maxHumidity: {
      type: Number,
      default: 80,
      min: 0,
      max: 100
    }
  },
  gsmNumber: {
    type: String,
    default: null
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

export default UserSettings;
