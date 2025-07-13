const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const Session = require('../models/Session');
const Seminar = require('../models/Seminar');
const Competition = require('../models/Competition');
const mongoose = require('mongoose');
const logger = require('../config/logger');

// @route   GET api/stats/summary
// @desc    Get training statistics for the user
// @access  Private
router.get('/summary', auth, asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get the start and end of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fetch stats from all three collections in parallel
    const [sessionStats, seminarStats, competitionStats] = await Promise.all([
      // Sessions aggregation (includes hours since they have duration)
      Session.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalHours: { $sum: '$duration' },
            hoursThisMonth: {
              $sum: {
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
            giCount: { $sum: { $cond: [{ $eq: ['$type', 'Gi'] }, 1, 0] }},
            noGiCount: { $sum: { $cond: [{ $eq: ['$type', 'No-Gi'] }, 1, 0] }},
            openMatCount: { $sum: { $cond: [{ $eq: ['$type', 'Open Mat'] }, 1, 0] }}
          }
        }
      ]),
      
      // Seminars aggregation (count only, no duration)
      Seminar.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            giSeminars: { $sum: { $cond: [{ $eq: ['$type', 'Gi'] }, 1, 0] }},
            noGiSeminars: { $sum: { $cond: [{ $eq: ['$type', 'No-Gi'] }, 1, 0] }}
          }
        }
      ]),
      
      // Competitions aggregation (count only, no duration)
      Competition.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            giCompetitions: { $sum: { $cond: [{ $eq: ['$type', 'Gi'] }, 1, 0] }},
            noGiCompetitions: { $sum: { $cond: [{ $eq: ['$type', 'No-Gi'] }, 1, 0] }}
          }
        }
      ])
    ]);

    // Extract data with defaults
    const sessionData = sessionStats[0] || { totalHours: 0, hoursThisMonth: 0, giCount: 0, noGiCount: 0, openMatCount: 0 };
    const seminarData = seminarStats[0] || { giSeminars: 0, noGiSeminars: 0 };
    const competitionData = competitionStats[0] || { giCompetitions: 0, noGiCompetitions: 0 };

    // Combine all activity types
    const result = {
        totalHours: sessionData.totalHours,
        hoursThisMonth: sessionData.hoursThisMonth,
        typeDistribution: [
            { 
              name: "Gi Training", 
              count: sessionData.giCount, 
              color: "#007AFF", 
              legendFontColor: "#7F7F7F", 
              legendFontSize: 15 
            },
            { 
              name: "No-Gi Training", 
              count: sessionData.noGiCount, 
              color: "#E53935", 
              legendFontColor: "#7F7F7F", 
              legendFontSize: 15 
            },
            { 
              name: "Open Mat", 
              count: sessionData.openMatCount, 
              color: "#FFC107", 
              legendFontColor: "#7F7F7F", 
              legendFontSize: 15 
            },
            { 
              name: "Gi Seminars", 
              count: seminarData.giSeminars, 
              color: "#4CAF50", 
              legendFontColor: "#7F7F7F", 
              legendFontSize: 15 
            },
            { 
              name: "No-Gi Seminars", 
              count: seminarData.noGiSeminars, 
              color: "#8BC34A", 
              legendFontColor: "#7F7F7F", 
              legendFontSize: 15 
            },
            { 
              name: "Gi Competitions", 
              count: competitionData.giCompetitions, 
              color: "#FF9800", 
              legendFontColor: "#7F7F7F", 
              legendFontSize: 15 
            },
            { 
              name: "No-Gi Competitions", 
              count: competitionData.noGiCompetitions, 
              color: "#FF5722", 
              legendFontColor: "#7F7F7F", 
              legendFontSize: 15 
            }
        ].filter(item => item.count > 0) // Only include types that have been used
    };
    
    res.json(result);
}));

module.exports = router;