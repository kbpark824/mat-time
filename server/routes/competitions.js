const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const validateObjectId = require('../middleware/validateObjectId');
const Competition = require('../models/Competition');
const Tag = require('../models/Tag');
const logger = require('../config/logger');
const { createOrFindTags } = require('../utils/tagUtils');
const constants = require('../config/constants');

// Validation schemas
const competitionSchema = Joi.object({
  date: Joi.date().iso().required().messages({
    'date.base': 'Date must be a valid date',
    'date.format': 'Date must be in ISO format',
    'any.required': 'Date is required'
  }),
  name: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Competition name cannot be empty',
    'string.min': 'Competition name is required',
    'string.max': 'Competition name cannot exceed 100 characters',
    'any.required': 'Competition name is required'
  }),
  organization: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Organization cannot be empty',
    'string.min': 'Organization is required',
    'string.max': 'Organization cannot exceed 100 characters',
    'any.required': 'Organization is required'
  }),
  type: Joi.string().valid('Gi', 'No-Gi').required().messages({
    'any.only': 'Type must be one of: Gi, No-Gi',
    'any.required': 'Type is required'
  }),
  weightDivision: Joi.string().trim().min(1).max(constants.VALIDATION.MAX_WEIGHT_DIVISION_LENGTH).required().messages({
    'string.empty': 'Weight division cannot be empty',
    'string.min': 'Weight division is required',
    'string.max': constants.ERROR_MESSAGES.WEIGHT_DIVISION_TOO_LONG,
    'any.required': 'Weight division is required'
  }),
  resultsInDivision: Joi.string().valid('gold', 'silver', 'bronze', 'none').required().messages({
    'any.only': 'Results in division must be one of: gold, silver, bronze, none',
    'any.required': 'Results in division is required'
  }),
  matchesInDivision: Joi.number().integer().min(0).max(20).required().messages({
    'number.base': 'Matches in division must be a number',
    'number.integer': 'Matches in division must be an integer',
    'number.min': 'Matches in division cannot be negative',
    'number.max': 'Matches in division cannot exceed 20',
    'any.required': 'Matches in division is required'
  }),
  matchNotesInDivision: Joi.array().items(
    Joi.object({
      matchNumber: Joi.number().integer().min(1).required(),
      notes: Joi.string().max(1000).allow('').optional()
    })
  ).max(20).optional().messages({
    'array.max': 'Cannot have more than 20 match notes'
  }),
  competedInOpenClass: Joi.boolean().optional(),
  resultsInOpenClass: Joi.string().valid('gold', 'silver', 'bronze', 'none').allow('').optional().messages({
    'any.only': 'Results in open class must be one of: gold, silver, bronze, none'
  }),
  matchesInOpenClass: Joi.number().integer().min(0).max(20).optional().messages({
    'number.base': 'Matches in open class must be a number',
    'number.integer': 'Matches in open class must be an integer',
    'number.min': 'Matches in open class cannot be negative',
    'number.max': 'Matches in open class cannot exceed 20'
  }),
  matchNotesInOpenClass: Joi.array().items(
    Joi.object({
      matchNumber: Joi.number().integer().min(1).required(),
      notes: Joi.string().max(1000).allow('').optional()
    })
  ).max(20).optional().messages({
    'array.max': 'Cannot have more than 20 open class match notes'
  }),
  generalNotes: Joi.string().max(constants.VALIDATION.MAX_NOTE_LENGTH).allow('').optional().messages({
    'string.max': constants.ERROR_MESSAGES.GENERAL_NOTES_TOO_LONG
  }),
  tags: Joi.array().items(Joi.string().max(constants.VALIDATION.MAX_TAG_LENGTH).trim()).max(constants.VALIDATION.MAX_TAGS_PER_ITEM).optional().messages({
    'string.max': constants.ERROR_MESSAGES.TAG_TOO_LONG,
    'array.max': constants.ERROR_MESSAGES.TOO_MANY_TAGS
  })
});

// A helper function to find or create tags and return their IDs
const getTagIds = async (tagNames, userId) => {
  const tags = await createOrFindTags(tagNames, userId);
  return tags.map(tag => tag._id);
};

// @route   POST api/competitions
// @desc    Create a new competition log
// @access  Private
router.post('/', auth, asyncHandler(async (req, res) => {
  // Validate input
  const { error } = competitionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }

  const { 
    date, 
    name, 
    organization, 
    type, 
    weightDivision, 
    resultsInDivision, 
    matchesInDivision,
    matchNotesInDivision,
    competedInOpenClass,
    resultsInOpenClass,
    matchesInOpenClass,
    matchNotesInOpenClass,
    generalNotes,
    tags 
  } = req.body;

  const tagIds = await getTagIds(tags, req.user.id);

  const newCompetition = new Competition({
    user: req.user.id,
    date,
    name,
    organization,
    type,
    weightDivision,
    resultsInDivision,
    matchesInDivision,
    matchNotesInDivision: matchNotesInDivision || [],
    competedInOpenClass: competedInOpenClass || false,
    resultsInOpenClass: resultsInOpenClass || '',
    matchesInOpenClass: matchesInOpenClass || 0,
    matchNotesInOpenClass: matchNotesInOpenClass || [],
    generalNotes: generalNotes || '',
    tags: tagIds,
  });

  const competition = await newCompetition.save();
  await competition.populate('tags');
  res.json(competition);
}));

// @route   GET api/competitions
// @desc    Get all competitions for a user
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
  // Check for search query and pagination
  const { keyword, tags, limit, offset } = req.query;

  let query = { user: req.user.id };

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

  let competitionsQuery = Competition.find(query, 'date name location placement weight medals notes tags user createdAt updatedAt')
    .populate('tags', 'name')
    .sort({ date: -1 });

  // Apply pagination if provided
  if (limit) {
    competitionsQuery = competitionsQuery.limit(parseInt(limit));
  }
  if (offset) {
    competitionsQuery = competitionsQuery.skip(parseInt(offset));
  }

  const competitions = await competitionsQuery;
  res.json(competitions);
}));

// @route   GET api/competitions/:id
// @desc    Get a single competition by ID
// @access  Private
router.get('/:id', auth, validateObjectId, asyncHandler(async (req, res) => {
    const competition = await Competition.findById(req.params.id).populate('tags');
    
    if (!competition) {
        return res.status(404).json({ success: false, error: 'Competition not found' });
    }
    
    // Verify the competition belongs to the user
    if (competition.user.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    
    res.json(competition);
}));

// @route   PUT api/competitions/:id
// @desc    Update a competition
// @access  Private
router.put('/:id', auth, validateObjectId, asyncHandler(async (req, res) => {
    // Validate input
    const { error } = competitionSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            success: false, 
            error: error.details[0].message 
        });
    }

    const { 
      date, 
      name, 
      organization, 
      type, 
      weightDivision, 
      resultsInDivision, 
      matchesInDivision,
      matchNotesInDivision,
      competedInOpenClass,
      resultsInOpenClass,
      matchesInOpenClass,
      matchNotesInOpenClass,
      generalNotes,
      tags 
    } = req.body;

    let competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ success: false, error: 'Competition not found' });

    if (competition.user.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const tagIds = await getTagIds(tags, req.user.id);
    
    const updatedCompetitionData = {
        date,
        name,
        organization,
        type,
        weightDivision,
        resultsInDivision,
        matchesInDivision,
        matchNotesInDivision: matchNotesInDivision || [],
        competedInOpenClass: competedInOpenClass || false,
        resultsInOpenClass: resultsInOpenClass || '',
        matchesInOpenClass: matchesInOpenClass || 0,
        matchNotesInOpenClass: matchNotesInOpenClass || [],
        generalNotes: generalNotes || '',
        tags: tagIds
    };

    competition = await Competition.findByIdAndUpdate(
        req.params.id,
        { $set: updatedCompetitionData },
        { new: true }
    ).populate('tags');

    res.json(competition);
}));

// @route   DELETE api/competitions/:id
// @desc    Delete a competition
// @access  Private
router.delete('/:id', auth, validateObjectId, asyncHandler(async (req, res) => {
    let competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ success: false, error: 'Competition not found' });

    if (competition.user.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    await Competition.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Competition removed' });
}));

module.exports = router;