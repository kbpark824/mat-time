/*
 * Mat Time - Martial Arts Training Session Tracking Application
 * Copyright (C) 2025 Kibum Park
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const Session = require('../models/Session');
const Seminar = require('../models/Seminar');
const Competition = require('../models/Competition');
const Tag = require('../models/Tag');
const logger = require('../config/logger');

// @route   GET api/activities
// @desc    Get all activities (sessions, seminars, competitions) for a user
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
  const { keyword, tags } = req.query;
  let query = { user: req.user.id };

  // Build search query
  if (keyword) {
    // Comprehensive sanitization to prevent MongoDB operator injection
    const sanitizedKeyword = keyword
      .replace(/[\$\{\}\[\]]/g, '') // Remove MongoDB operators
      .replace(/['"]/g, '') // Remove quotes that could break queries
      .replace(/[\\]/g, '') // Remove backslashes
      .trim();
    
    if (sanitizedKeyword.length > 0) {
      query.$text = { $search: sanitizedKeyword };
    }
  }
  
  // Handle tag filtering
  let tagIds = [];
  if (tags) {
    const tagNames = tags.split(',').map(t => t.trim().toLowerCase());
    const foundTags = await Tag.find({ user: req.user.id, name: { $in: tagNames } });
    if (foundTags.length !== tagNames.length) {
      // A tag was requested that doesn't exist for the user
      return res.json([]);
    }
    tagIds = foundTags.map(t => t._id);
    query.tags = { $all: tagIds };
  }

  // Fetch all activities in parallel
  const [sessions, seminars, competitions] = await Promise.all([
    Session.find(query).populate('tags').sort({ date: -1 }),
    Seminar.find(query).populate('tags').sort({ date: -1 }),
    Competition.find(query).populate('tags').sort({ date: -1 })
  ]);

  // Add activity type to each item and combine
  const activities = [
    ...sessions.map(item => ({ ...item.toObject(), activityType: 'session' })),
    ...seminars.map(item => ({ ...item.toObject(), activityType: 'seminar' })),
    ...competitions.map(item => ({ ...item.toObject(), activityType: 'competition' }))
  ];

  // Sort by date (newest first)
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json(activities);
}));

module.exports = router;