import express from 'express';
import Alert from '../models/Alert.js';

const router = express.Router();

// Get all alerts
router.get('/', async (req, res) => {
  try {
    const {
      limit = 50,
      type,
      acknowledged,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (type) {
      query.type = type;
    }

    if (acknowledged !== undefined) {
      query.acknowledged = acknowledged === 'true';
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const alerts = await Alert
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get latest critical alert
router.get('/latest', async (req, res) => {
  try {
    const latestAlert = await Alert
      .findOne({ acknowledged: false })
      .sort({ timestamp: -1 })
      .limit(1);

    if (!latestAlert) {
      return res.json({ message: 'No unacknowledged alerts' });
    }

    res.json(latestAlert);
  } catch (error) {
    console.error('Error fetching latest alert:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Acknowledge an alert
router.patch('/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByIdAndUpdate(
      id,
      { acknowledged: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({
      success: true,
      message: 'Alert acknowledged',
      alert
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Acknowledge all alerts
router.post('/acknowledge-all', async (req, res) => {
  try {
    const result = await Alert.updateMany(
      { acknowledged: false },
      { acknowledged: true }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} alerts acknowledged`
    });
  } catch (error) {
    console.error('Error acknowledging all alerts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get alert statistics
router.get('/stats', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await Alert.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            sensorType: '$sensorType'
          },
          count: { $sum: 1 },
          acknowledgedCount: {
            $sum: { $cond: ['$acknowledged', 1, 0] }
          }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching alert statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
