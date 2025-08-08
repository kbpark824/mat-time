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
const Joi = require('joi');
const auth = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const validateObjectId = require('../middleware/validateObjectId');
const Seminar = require('../models/Seminar');
const Tag = require('../models/Tag');
const logger = require('../config/logger');
const { createOrFindTags } = require('../utils/tagUtils');
const constants = require('../config/constants');

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
  techniqueNotes: Joi.string().max(constants.VALIDATION.MAX_NOTE_LENGTH).allow('').optional().messages({
    'string.max': constants.ERROR_MESSAGES.TECHNIQUE_NOTES_TOO_LONG
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

  let seminarsQuery = Seminar.find(query)
    .populate('tags', 'name')
    .sort({ date: -1 });

  // Apply pagination if provided
  if (limit) {
    seminarsQuery = seminarsQuery.limit(parseInt(limit));
  }
  if (offset) {
    seminarsQuery = seminarsQuery.skip(parseInt(offset));
  }

  const seminars = await seminarsQuery;
  res.json(seminars);
}));

// @route   GET api/seminars/:id
// @desc    Get a single seminar by ID
// @access  Private
router.get('/:id', auth, validateObjectId, asyncHandler(async (req, res) => {
    const seminar = await Seminar.findById(req.params.id).populate('tags');
    
    if (!seminar) {
        return res.status(404).json({ success: false, error: 'Seminar not found' });
    }
    
    // Verify the seminar belongs to the user
    if (seminar.user.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    
    res.json(seminar);
}));

// @route   PUT api/seminars/:id
// @desc    Update a seminar
// @access  Private
router.put('/:id', auth, validateObjectId, asyncHandler(async (req, res) => {
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
    if (!seminar) return res.status(404).json({ success: false, error: 'Seminar not found' });

    if (seminar.user.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
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
router.delete('/:id', auth, validateObjectId, asyncHandler(async (req, res) => {
    let seminar = await Seminar.findById(req.params.id);
    if (!seminar) return res.status(404).json({ success: false, error: 'Seminar not found' });

    if (seminar.user.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    await Seminar.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Seminar removed' });
}));

module.exports = router;