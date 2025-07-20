const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const Session = require('../models/Session');
const Seminar = require('../models/Seminar');
const Competition = require('../models/Competition');
const mongoose = require('mongoose');
const logger = require('../config/logger');

// Helper function to calculate training streaks
async function calculateTrainingStreak(userId) {
    try {
        // Get all training sessions (sessions, seminars, competitions) ordered by date
        const [sessions, seminars, competitions] = await Promise.all([
            Session.find({ user: userId }).select('date').sort({ date: -1 }),
            Seminar.find({ user: userId }).select('date').sort({ date: -1 }),
            Competition.find({ user: userId }).select('date').sort({ date: -1 })
        ]);

        // Combine all activities and sort by date (most recent first)
        const allActivities = [
            ...sessions.map(s => s.date),
            ...seminars.map(s => s.date),
            ...competitions.map(c => c.date)
        ].sort((a, b) => b - a);

        if (allActivities.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastTrainingDate: null
            };
        }

        // Convert dates to day strings for easier comparison (YYYY-MM-DD)
        const uniqueDays = [...new Set(allActivities.map(date => 
            date.toISOString().split('T')[0]
        ))].sort((a, b) => new Date(b) - new Date(a));

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        // Calculate current streak
        for (let i = 0; i < uniqueDays.length; i++) {
            const dayDate = uniqueDays[i];
            
            if (i === 0) {
                // First day (most recent)
                if (dayDate === today || dayDate === yesterday) {
                    currentStreak = 1;
                    tempStreak = 1;
                } else {
                    // No recent activity, current streak is 0
                    currentStreak = 0;
                    break;
                }
            } else {
                // Check if this day is consecutive to the previous day
                const prevDate = new Date(uniqueDays[i - 1]);
                const currDate = new Date(dayDate);
                const dayDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
                
                if (dayDiff === 1) {
                    // Consecutive day
                    currentStreak++;
                    tempStreak++;
                } else {
                    // Gap in training, stop current streak calculation
                    break;
                }
            }
        }

        // Calculate longest streak by checking all consecutive sequences
        tempStreak = 0;
        for (let i = 0; i < uniqueDays.length; i++) {
            if (i === 0) {
                tempStreak = 1;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                const prevDate = new Date(uniqueDays[i - 1]);
                const currDate = new Date(uniqueDays[i]);
                const dayDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
                
                if (dayDiff === 1) {
                    tempStreak++;
                    longestStreak = Math.max(longestStreak, tempStreak);
                } else {
                    tempStreak = 1;
                }
            }
        }

        return {
            currentStreak,
            longestStreak,
            lastTrainingDate: uniqueDays[0] || null
        };
    } catch (error) {
        logger.error('Error calculating training streak:', error);
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastTrainingDate: null
        };
    }
}

// @route   GET api/stats/summary
// @desc    Get training statistics for the user
// @access  Private
router.get('/summary', auth, asyncHandler(async (req, res) => {
    const userId = mongoose.Types.ObjectId.createFromHexString(req.user.id);

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

    // Calculate training streaks (sessions only for simplicity)
    const streakData = await calculateTrainingStreak(userId);
    logger.info('Streak data calculated:', streakData);

    // Combine all activity types
    const result = {
        totalHours: sessionData.totalHours,
        hoursThisMonth: sessionData.hoursThisMonth,
        streaks: streakData,
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