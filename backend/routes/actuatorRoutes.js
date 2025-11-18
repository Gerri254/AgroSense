import express from 'express';
import ActuatorLog from '../models/ActuatorLog.js';
import mqttService from '../services/mqttService.js';

const router = express.Router();

// Control water pump
router.post('/pump/control', async (req, res) => {
  try {
    const { status, mode = 'manual' } = req.body;

    if (typeof status !== 'boolean') {
      return res.status(400).json({ message: 'Status must be a boolean value' });
    }

    // Update mode if switching to auto
    if (mode === 'auto') {
      mqttService.setActuatorMode('pump', 'auto');
    } else if (mode === 'manual') {
      mqttService.setActuatorMode('pump', 'manual');
    }

    // Use the unified control method
    const result = await mqttService.controlActuator(
      'pump',
      status,
      mode,
      mode === 'manual' ? 'Manual control via dashboard' : 'Automatic control activated'
    );

    if (result.success) {
      res.json({
        success: true,
        message: `Pump turned ${status ? 'ON' : 'OFF'} (${mode} mode)`,
        mode: mqttService.getActuatorMode('pump')
      });
    } else {
      res.status(500).json({ message: 'Failed to control pump', error: result.error });
    }
  } catch (error) {
    console.error('Error controlling pump:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Control cooling fan
router.post('/fan/control', async (req, res) => {
  try {
    const { status, mode = 'manual' } = req.body;

    if (typeof status !== 'boolean') {
      return res.status(400).json({ message: 'Status must be a boolean value' });
    }

    // Update mode if switching to auto
    if (mode === 'auto') {
      mqttService.setActuatorMode('fan', 'auto');
    } else if (mode === 'manual') {
      mqttService.setActuatorMode('fan', 'manual');
    }

    // Use the unified control method
    const result = await mqttService.controlActuator(
      'fan',
      status,
      mode,
      mode === 'manual' ? 'Manual control via dashboard' : 'Automatic control activated'
    );

    if (result.success) {
      res.json({
        success: true,
        message: `Fan turned ${status ? 'ON' : 'OFF'} (${mode} mode)`,
        mode: mqttService.getActuatorMode('fan')
      });
    } else {
      res.status(500).json({ message: 'Failed to control fan', error: result.error });
    }
  } catch (error) {
    console.error('Error controlling fan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get actuator logs/history
router.get('/logs', async (req, res) => {
  try {
    const {
      limit = 50,
      actuatorType,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (actuatorType) {
      query.actuatorType = actuatorType;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await ActuatorLog
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'username');

    res.json({
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching actuator logs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get actuator statistics
router.get('/stats', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await ActuatorLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            actuatorType: '$actuatorType',
            action: '$action'
          },
          count: { $sum: 1 },
          automaticCount: {
            $sum: { $cond: [{ $eq: ['$trigger', 'automatic'] }, 1, 0] }
          },
          manualCount: {
            $sum: { $cond: [{ $eq: ['$trigger', 'manual'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching actuator statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
