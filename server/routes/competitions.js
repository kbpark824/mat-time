const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const Competition = require('../models/Competition');
const Tag = require('../models/Tag');
const logger = require('../config/logger');

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
  weightDivision: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Weight division cannot be empty',
    'string.min': 'Weight division is required',
    'string.max': 'Weight division cannot exceed 50 characters',
    'any.required': 'Weight division is required'
  }),
  resultsInDivision: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Results in division cannot be empty',
    'string.min': 'Results in division is required',
    'string.max': 'Results in division cannot exceed 100 characters',
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
  resultsInOpenClass: Joi.string().trim().max(100).allow('').optional().messages({
    'string.max': 'Results in open class cannot exceed 100 characters'
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
  generalNotes: Joi.string().max(5000).allow('').optional().messages({
    'string.max': 'General notes cannot exceed 5000 characters'
  }),
  tags: Joi.array().items(Joi.string().max(50).trim()).max(20).optional().messages({
    'string.max': 'Each tag cannot exceed 50 characters',
    'array.max': 'Cannot have more than 20 tags'
  })
});

// A helper function to find or create tags and return their IDs
const getTagIds = async (tagNames, userId) => {
  if (!tagNames || tagNames.length === 0) {
    return [];
  }
  
  const tagPromises = tagNames.map(name => {
    return Tag.findOneAndUpdate(
      { name: name.trim().toLowerCase(), user: userId },
      { $setOnInsert: { name: name.trim().toLowerCase(), user: userId } },
      { upsert: true, new: true }
    );
  });
  
  const tags = await Promise.all(tagPromises);
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
    query.$text = { $search: keyword };
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

  let competitionsQuery = Competition.find(query)
    .populate('tags')
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

// @route   PUT api/competitions/:id
// @desc    Update a competition
// @access  Private
router.put('/:id', auth, asyncHandler(async (req, res) => {
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
    if (!competition) return res.status(404).json({ msg: 'Competition not found' });

    if (competition.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
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
router.delete('/:id', auth, asyncHandler(async (req, res) => {
    let competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ msg: 'Competition not found' });

    if (competition.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
    }

    await Competition.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Competition removed' });
}));

module.exports = router;