const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const Session = require('../models/Session');
const Tag = require('../models/Tag');
const auth = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#+\\-_=<>.,;:()\\[\\]{}|~^])[A-Za-z\\d@$!%*?&#+\\-_=<>.,;:()\\[\\]{}|~^]+$')).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'any.required': 'Password is required'
  }),
  revenueCatId: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', asyncHandler(async (req, res, next) => {
  // Validate input
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }

  const { email, password, revenueCatId } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ 
      success: false, 
      error: 'User already exists' 
    });
  }

  user = new User({ email, password, revenueCatId });
  await user.save();

  const payload = { user: { id: user.id, email: user.email, createdAt: user.createdAt, isPro: user.isPro } };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
  
  res.status(201).json({ 
    success: true, 
    token,
    data: {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        isPro: user.isPro
      }
    }
  });
}));

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', asyncHandler(async (req, res, next) => {
  // Validate input
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }

  const { email, password } = req.body;

  let user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid credentials' 
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid credentials' 
    });
  }

  const payload = { user: { id: user.id, email: user.email, createdAt: user.createdAt, isPro: user.isPro } };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
  
  res.json({ 
    success: true, 
    token,
    data: {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        isPro: user.isPro
      }
    }
  });
}));

// @route   DELETE api/auth/account
// @desc    Delete user account and all associated data
// @access  Private
router.delete('/account', auth, asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Delete all user's sessions
  await Session.deleteMany({ user: userId });

  // Delete all user's tags
  await Tag.deleteMany({ user: userId });

  // Delete the user account
  await User.findByIdAndDelete(userId);

  res.json({ 
    success: true,
    message: 'Account and all associated data have been permanently deleted' 
  });
}));

module.exports = router;