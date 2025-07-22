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

// @route   GET api/stats/advanced
// @desc    Get advanced analytics for pro users
// @access  Private
router.get('/advanced', auth, asyncHandler(async (req, res) => {
    const userId = mongoose.Types.ObjectId.createFromHexString(req.user.id);
    const { timeframe = '6months' } = req.query; // 1month, 3months, 6months, 1year, all

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
        case '1month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
        case '3months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            break;
        case '6months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            break;
        case '1year':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
        default:
            startDate = new Date(2020, 0, 1); // Far enough back to include all data
    }

    // Get training frequency data (sessions by week)
    const weeklyTrainingData = await Session.aggregate([
        { $match: { user: userId, date: { $gte: startDate } } },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    week: { $week: '$date' }
                },
                sessionsCount: { $sum: 1 },
                totalHours: { $sum: '$duration' },
                avgDuration: { $avg: '$duration' }
            }
        },
        { $sort: { '_id.year': 1, '_id.week': 1 } },
        { $limit: 50 } // Limit to prevent huge responses
    ]);

    // Get training consistency (training days per month)
    const monthlyConsistency = await Session.aggregate([
        { $match: { user: userId, date: { $gte: startDate } } },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' },
                    day: { $dayOfMonth: '$date' }
                }
            }
        },
        {
            $group: {
                _id: {
                    year: '$_id.year',
                    month: '$_id.month'
                },
                trainingDays: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get technique focus areas (from tags)
    const techniqueFocus = await Session.aggregate([
        { $match: { user: userId, date: { $gte: startDate } } },
        { $unwind: '$tags' },
        {
            $lookup: {
                from: 'tags',
                localField: 'tags',
                foreignField: '_id',
                as: 'tagDetails'
            }
        },
        { $unwind: '$tagDetails' },
        {
            $group: {
                _id: '$tagDetails.name',
                frequency: { $sum: 1 },
                lastPracticed: { $max: '$date' }
            }
        },
        { $sort: { frequency: -1 } },
        { $limit: 20 }
    ]);

    // Get training time distribution
    const timeDistribution = await Session.aggregate([
        { $match: { user: userId, date: { $gte: startDate } } },
        {
            $group: {
                _id: {
                    hour: { $hour: '$date' }
                },
                sessionsCount: { $sum: 1 }
            }
        },
        { $sort: { '_id.hour': 1 } }
    ]);

    // Get performance metrics
    const performanceMetrics = await Session.aggregate([
        { $match: { user: userId, date: { $gte: startDate } } },
        {
            $group: {
                _id: null,
                totalSessions: { $sum: 1 },
                avgDuration: { $avg: '$duration' },
                totalHours: { $sum: '$duration' },
                longestSession: { $max: '$duration' },
                shortestSession: { $min: '$duration' }
            }
        }
    ]);

    // Get monthly progression
    const monthlyProgression = await Session.aggregate([
        { $match: { user: userId, date: { $gte: startDate } } },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                sessions: { $sum: 1 },
                hours: { $sum: '$duration' },
                avgDuration: { $avg: '$duration' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Calculate training streaks for advanced view
    const streakData = await calculateTrainingStreak(userId);

    const result = {
        timeframe,
        dateRange: {
            start: startDate,
            end: now
        },
        weeklyTraining: weeklyTrainingData,
        monthlyConsistency,
        techniqueFocus,
        timeDistribution,
        performanceMetrics: performanceMetrics[0] || {
            totalSessions: 0,
            avgDuration: 0,
            totalHours: 0,
            longestSession: 0,
            shortestSession: 0
        },
        monthlyProgression,
        streaks: streakData,
        insights: generateInsights(performanceMetrics[0], monthlyConsistency, techniqueFocus)
    };

    res.json(result);
}));

// Helper function to generate insights
function generateInsights(performance, consistency, techniques) {
    const insights = [];

    if (performance?.avgDuration > 1.5) {
        insights.push({
            type: 'positive',
            title: 'Great Session Length',
            message: `Your average session is ${performance.avgDuration.toFixed(1)} hours - excellent commitment!`
        });
    }

    if (consistency?.length > 0) {
        const avgDaysPerMonth = consistency.reduce((sum, month) => sum + month.trainingDays, 0) / consistency.length;
        if (avgDaysPerMonth >= 12) {
            insights.push({
                type: 'positive', 
                title: 'Consistent Training',
                message: `You train ${avgDaysPerMonth.toFixed(0)} days per month on average - amazing consistency!`
            });
        } else if (avgDaysPerMonth < 6) {
            insights.push({
                type: 'suggestion',
                title: 'Consistency Opportunity',
                message: 'Try to increase training frequency for faster progress.'
            });
        }
    }

    if (techniques?.length > 0) {
        const topTechnique = techniques[0];
        insights.push({
            type: 'info',
            title: 'Most Practiced',
            message: `You've focused heavily on "${topTechnique._id}" - consider diversifying your practice.`
        });
    }

    return insights;
}

module.exports = router;