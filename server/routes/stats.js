const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Session = require('../models/Session');
const mongoose = require('mongoose');
const logger = require('../config/logger');

// @route   GET api/stats/summary
// @desc    Get training statistics for the user
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get the start and end of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const stats = await Session.aggregate([
      // Stage 1: Match documents for the logged-in user
      {
        $match: { user: userId }
      },
      // Stage 2: Group and calculate all stats in one pass
      {
        $group: {
          _id: null, // Group all documents into one
          totalHours: { $sum: '$duration' },
          hoursThisMonth: {
            $sum: {
              // Only add to sum if the date is within the current month
              $cond: [
                { $and: [
                    { $gte: ['$date', startOfMonth] },
                    { $lt: ['$date', endOfMonth] }
                ]},
                '$duration',
                0
              ]
            }
          },
          // Count each class type
          giCount: { $sum: { $cond: [{ $eq: ['$type', 'Gi'] }, 1, 0] }},
          noGiCount: { $sum: { $cond: [{ $eq: ['$type', 'No-Gi'] }, 1, 0] }},
          openMatCount: { $sum: { $cond: [{ $eq: ['$type', 'Open Mat'] }, 1, 0] }},
        }
      }
    ]);

    let result = {
        totalHours: 0,
        hoursThisMonth: 0,
        typeDistribution: []
    };

    if (stats.length > 0) {
        const data = stats[0];
        result.totalHours = data.totalHours;
        result.hoursThisMonth = data.hoursThisMonth;
        result.typeDistribution = [
            { name: "Gi", count: data.giCount, color: "#007AFF", legendFontColor: "#7F7F7F", legendFontSize: 15 },
            { name: "No-Gi", count: data.noGiCount, color: "#E53935", legendFontColor: "#7F7F7F", legendFontSize: 15 },
            { name: "Open Mat", count: data.openMatCount, color: "#FFC107", legendFontColor: "#7F7F7F", legendFontSize: 15 }
        ].filter(item => item.count > 0); // Only include types that have been trained
    }
    
    res.json(result);

  } catch (err) {
    logger.error('Error getting stats summary:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;