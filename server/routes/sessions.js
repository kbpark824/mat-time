const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const validateObjectId = require('../middleware/validateObjectId');
const Session = require('../models/Session');
const Tag = require('../models/Tag');
const logger = require('../config/logger');
const { createOrFindTags } = require('../utils/tagUtils');

// Validation schemas
const sessionSchema = Joi.object({
  date: Joi.date().iso().required().messages({
    'date.base': 'Date must be a valid date',
    'date.format': 'Date must be in ISO format',
    'any.required': 'Date is required'
  }),
  duration: Joi.number().positive().required().messages({
    'number.base': 'Duration must be a number',
    'number.positive': 'Duration must be positive',
    'any.required': 'Duration is required'
  }),
  type: Joi.string().valid('Gi', 'No-Gi', 'Open Mat').required().messages({
    'any.only': 'Type must be one of: Gi, No-Gi, Open Mat',
    'any.required': 'Type is required'
  }),
  techniqueNotes: Joi.string().max(5000).allow('').optional().messages({
    'string.max': 'Technique notes cannot exceed 5000 characters'
  }),
  rollingNotes: Joi.string().max(5000).allow('').optional().messages({
    'string.max': 'Rolling notes cannot exceed 5000 characters'
  }),
  tags: Joi.array().items(Joi.string().max(50).trim()).max(20).optional().messages({
    'string.max': 'Each tag cannot exceed 50 characters',
    'array.max': 'Cannot have more than 20 tags'
  })
});

// A helper function to find or create tags and return their IDs
const getTagIds = async (tagNames, userId) => {
  const tags = await createOrFindTags(tagNames, userId);
  return tags.map(tag => tag._id);
};

// @route   POST api/sessions
// @desc    Create a new session log
// @access  Private
router.post('/', auth, asyncHandler(async (req, res) => {
  // Validate input
  const { error } = sessionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }

  const { date, duration, type, techniqueNotes, rollingNotes, tags } = req.body;

  const tagIds = await getTagIds(tags, req.user.id);

  const newSession = new Session({
    user: req.user.id,
    date,
    duration,
    type,
    techniqueNotes,
    rollingNotes,
    tags: tagIds,
  });

  const session = await newSession.save();
  await session.populate('tags');
  res.json(session);
}));

// @route   GET api/sessions
// @desc    Get all sessions for a user
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
  // Check for search query and pagination
  const { keyword, tags, limit, offset } = req.query;

  let query = { user: req.user.id };

  if (keyword) {
    // Sanitize keyword to prevent MongoDB operator injection
    const sanitizedKeyword = keyword.replace(/[\$\{\}]/g, '').trim();
    if (sanitizedKeyword.length > 0) {
      query.$text = { $search: sanitizedKeyword };
    }
  }
  
  if (tags) {
      const tagNames = tags.split(',').map(t => t.trim().toLowerCase());
      const foundTags = await Tag.find({ user: req.user.id, name: { $in: tagNames } });
      if (foundTags.length !== tagNames.length) {
          // A tag was requested that doesn't exist for the user
          return res.json([]);
      }
      const tagIds = foundTags.map(t => t._id);
      query.tags = { $all: tagIds }; // $all ensures all specified tags are present
  }

  let sessionsQuery = Session.find(query)
    .populate('tags')
    .sort({ date: -1 });

  // Apply pagination if provided
  if (limit) {
    sessionsQuery = sessionsQuery.limit(parseInt(limit));
  }
  if (offset) {
    sessionsQuery = sessionsQuery.skip(parseInt(offset));
  }

  const sessions = await sessionsQuery;
  res.json(sessions);
}));


// @route   GET api/sessions/:id
// @desc    Get a single session by ID
// @access  Private
router.get('/:id', auth, validateObjectId, asyncHandler(async (req, res) => {
    const session = await Session.findById(req.params.id).populate('tags');
    
    if (!session) {
        return res.status(404).json({ msg: 'Session not found' });
    }
    
    // Verify the session belongs to the user
    if (session.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(session);
}));

// @route   PUT api/sessions/:id
// @desc    Update a session
// @access  Private
router.put('/:id', auth, validateObjectId, asyncHandler(async (req, res) => {
    // Validate input
    const { error } = sessionSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            success: false, 
            error: error.details[0].message 
        });
    }

    const { date, duration, type, techniqueNotes, rollingNotes, tags } = req.body;

    let session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ msg: 'Session not found' });

    if (session.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
    }

    const tagIds = await getTagIds(tags, req.user.id);
    
    const updatedSessionData = {
        date,
        duration,
        type,
        techniqueNotes,
        rollingNotes,
        tags: tagIds
    };

    session = await Session.findByIdAndUpdate(
        req.params.id,
        { $set: updatedSessionData },
        { new: true }
    ).populate('tags');

    res.json(session);
}));

// @route   DELETE api/sessions/:id
// @desc    Delete a session
// @access  Private
router.delete('/:id', auth, validateObjectId, asyncHandler(async (req, res) => {
    let session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ msg: 'Session not found' });

    if (session.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
    }

    await Session.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Session removed' });
}));

module.exports = router;