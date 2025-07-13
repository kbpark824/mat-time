const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const Seminar = require('../models/Seminar');
const Tag = require('../models/Tag');
const logger = require('../config/logger');

// Validation schemas
const seminarSchema = Joi.object({
  date: Joi.date().iso().required().messages({
    'date.base': 'Date must be a valid date',
    'date.format': 'Date must be in ISO format',
    'any.required': 'Date is required'
  }),
  professorName: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Professor name cannot be empty',
    'string.min': 'Professor name is required',
    'string.max': 'Professor name cannot exceed 100 characters',
    'any.required': 'Professor name is required'
  }),
  type: Joi.string().valid('Gi', 'No-Gi').required().messages({
    'any.only': 'Type must be one of: Gi, No-Gi',
    'any.required': 'Type is required'
  }),
  techniqueNotes: Joi.string().max(5000).allow('').optional().messages({
    'string.max': 'Technique notes cannot exceed 5000 characters'
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

// @route   POST api/seminars
// @desc    Create a new seminar log
// @access  Private
router.post('/', auth, asyncHandler(async (req, res) => {
  // Validate input
  const { error } = seminarSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }

  const { date, professorName, type, techniqueNotes, tags } = req.body;

  const tagIds = await getTagIds(tags, req.user.id);

  const newSeminar = new Seminar({
    user: req.user.id,
    date,
    professorName,
    type,
    techniqueNotes,
    tags: tagIds,
  });

  const seminar = await newSeminar.save();
  await seminar.populate('tags');
  res.json(seminar);
}));

// @route   GET api/seminars
// @desc    Get all seminars for a user
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
  // Check for search query
  const { keyword, tags } = req.query;

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

  const seminars = await Seminar.find(query)
    .populate('tags')
    .sort({ date: -1 });

  res.json(seminars);
}));

// @route   PUT api/seminars/:id
// @desc    Update a seminar
// @access  Private
router.put('/:id', auth, asyncHandler(async (req, res) => {
    // Validate input
    const { error } = seminarSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            success: false, 
            error: error.details[0].message 
        });
    }

    const { date, professorName, type, techniqueNotes, tags } = req.body;

    let seminar = await Seminar.findById(req.params.id);
    if (!seminar) return res.status(404).json({ msg: 'Seminar not found' });

    if (seminar.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
    }

    const tagIds = await getTagIds(tags, req.user.id);
    
    const updatedSeminarData = {
        date,
        professorName,
        type,
        techniqueNotes,
        tags: tagIds
    };

    seminar = await Seminar.findByIdAndUpdate(
        req.params.id,
        { $set: updatedSeminarData },
        { new: true }
    ).populate('tags');

    res.json(seminar);
}));

// @route   DELETE api/seminars/:id
// @desc    Delete a seminar
// @access  Private
router.delete('/:id', auth, asyncHandler(async (req, res) => {
    let seminar = await Seminar.findById(req.params.id);
    if (!seminar) return res.status(404).json({ msg: 'Seminar not found' });

    if (seminar.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
    }

    await Seminar.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Seminar removed' });
}));

module.exports = router;