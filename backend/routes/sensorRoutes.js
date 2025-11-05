import express from 'express';
import SensorReading from '../models/SensorReading.js';

const router = express.Router();

// Get current/latest sensor readings
router.get('/current', async (req, res) => {
  try {
    const latestReading = await SensorReading
      .findOne()
      .sort({ timestamp: -1 })
      .limit(1);

    if (!latestReading) {
      return res.status(404).json({ message: 'No sensor data available' });
    }

    res.json(latestReading);
  } catch (error) {
    console.error('Error fetching current sensor data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get historical sensor data with time range
router.get('/history', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      limit = 100,
      sensorType
    } = req.query;

    // Build query
    const query = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Execute query
    const readings = await SensorReading
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      count: readings.length,
      data: readings
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get aggregated data (hourly/daily averages)
router.get('/aggregated', async (req, res) => {
  try {
    const {
      interval = 'hourly',
      startDate,
      endDate
    } = req.query;

    // Default to last 24 hours if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 24 * 60 * 60 * 1000);

    // Determine grouping based on interval
    let groupByDate;
    switch (interval) {
      case 'daily':
        groupByDate = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        };
        break;
      case 'hourly':
      default:
        groupByDate = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' }
        };
        break;
    }

    const aggregatedData = await SensorReading.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: groupByDate,
          avgTemperature: { $avg: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          avgSoilMoisture: { $avg: '$soilMoisture' },
          avgWaterLevel: { $avg: '$waterLevel' },
          minTemperature: { $min: '$temperature' },
          maxTemperature: { $max: '$temperature' },
          count: { $sum: 1 },
          timestamp: { $first: '$timestamp' }
        }
      },
      {
        $sort: { timestamp: 1 }
      }
    ]);

    res.json({
      interval,
      startDate: start,
      endDate: end,
      count: aggregatedData.length,
      data: aggregatedData
    });
  } catch (error) {
    console.error('Error fetching aggregated data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get sensor statistics
router.get('/stats', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await SensorReading.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgTemperature: { $avg: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          avgSoilMoisture: { $avg: '$soilMoisture' },
          avgWaterLevel: { $avg: '$waterLevel' },
          minTemperature: { $min: '$temperature' },
          maxTemperature: { $max: '$temperature' },
          minSoilMoisture: { $min: '$soilMoisture' },
          maxSoilMoisture: { $max: '$soilMoisture' },
          totalReadings: { $sum: 1 }
        }
      }
    ]);

    res.json(stats[0] || {});
  } catch (error) {
    console.error('Error fetching sensor statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
