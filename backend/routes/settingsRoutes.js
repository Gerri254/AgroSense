import express from 'express';
import UserSettings from '../models/UserSettings.js';
import mqttService from '../services/mqttService.js';

const router = express.Router();

// Get user settings
router.get('/', async (req, res) => {
  try {
    // For single-user system, get the first settings or use defaults
    let settings = await UserSettings.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = new UserSettings({
        userId: null, // Will be set when user is created
        thresholds: {
          minSoilMoisture: 30,
          maxTemperature: 35,
          minWaterLevel: 20,
          maxHumidity: 80
        }
      });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update thresholds
router.put('/thresholds', async (req, res) => {
  try {
    const { minSoilMoisture, maxTemperature, minWaterLevel, maxHumidity } = req.body;

    // Validation
    const thresholds = {};
    if (minSoilMoisture !== undefined) thresholds.minSoilMoisture = minSoilMoisture;
    if (maxTemperature !== undefined) thresholds.maxTemperature = maxTemperature;
    if (minWaterLevel !== undefined) thresholds.minWaterLevel = minWaterLevel;
    if (maxHumidity !== undefined) thresholds.maxHumidity = maxHumidity;

    // Get or create settings
    let settings = await UserSettings.findOne();

    if (!settings) {
      settings = new UserSettings({ thresholds });
    } else {
      settings.thresholds = { ...settings.thresholds, ...thresholds };
      settings.updatedAt = new Date();
    }

    await settings.save();

    // Update MQTT service thresholds
    mqttService.updateThresholds(settings.thresholds);

    // Publish updated thresholds to MQTT for ESP8266
    mqttService.publish(
      process.env.MQTT_TOPIC_CONFIG || 'settings/config',
      { thresholds: settings.thresholds }
    );

    res.json({
      success: true,
      message: 'Thresholds updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating thresholds:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update GSM number
router.put('/gsm', async (req, res) => {
  try {
    const { gsmNumber } = req.body;

    let settings = await UserSettings.findOne();

    if (!settings) {
      settings = new UserSettings({ gsmNumber });
    } else {
      settings.gsmNumber = gsmNumber;
      settings.updatedAt = new Date();
    }

    await settings.save();

    res.json({
      success: true,
      message: 'GSM number updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating GSM number:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle notifications
router.put('/notifications', async (req, res) => {
  try {
    const { enabled } = req.body;

    let settings = await UserSettings.findOne();

    if (!settings) {
      settings = new UserSettings({ notificationsEnabled: enabled });
    } else {
      settings.notificationsEnabled = enabled;
      settings.updatedAt = new Date();
    }

    await settings.save();

    res.json({
      success: true,
      message: `Notifications ${enabled ? 'enabled' : 'disabled'}`,
      settings
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
