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
const emailService = require('../utils/emailService');

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

const beltRankSchema = Joi.object({
  rank: Joi.string().valid('white', 'blue', 'purple', 'brown', 'black').required().messages({
    'any.only': 'Belt rank must be one of: white, blue, purple, brown, black',
    'any.required': 'Belt rank is required'
  }),
  stripes: Joi.number().integer().min(0).max(4).required().messages({
    'number.base': 'Stripes must be a number',
    'number.integer': 'Stripes must be an integer',
    'number.min': 'Stripes cannot be negative',
    'number.max': 'Stripes cannot exceed 4',
    'any.required': 'Stripes count is required'
  }),
  achievedDate: Joi.date().iso().max('now').required().messages({
    'date.base': 'Achieved date must be a valid date',
    'date.format': 'Achieved date must be in ISO format',
    'date.max': 'Achieved date cannot be in the future',
    'any.required': 'Achieved date is required'
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

  // Generate verification token
  const verificationToken = emailService.generateVerificationToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  user = new User({ 
    email, 
    password, 
    revenueCatId,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires
  });
  await user.save();

  // Send verification email
  try {
    await emailService.sendVerificationEmail(email, email.split('@')[0], verificationToken);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't fail registration if email fails - user can resend
  }

  res.status(201).json({ 
    success: true, 
    message: 'Registration successful! Please check your email to verify your account.',
    data: {
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
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

  // Check if email is verified
  if (!user.isEmailVerified) {
    return res.status(403).json({ 
      success: false, 
      error: 'Please verify your email address before logging in',
      requiresEmailVerification: true,
      userId: user.id
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
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        isPro: user.isPro
      }
    }
  });
}));

// @route   GET api/auth/belt-rank
// @desc    Get user's current belt rank
// @access  Private
router.get('/belt-rank', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
  }

  res.json({
    success: true,
    data: {
      beltRank: user.beltRank
    }
  });
}));

// @route   PUT api/auth/belt-rank
// @desc    Update user's belt rank
// @access  Private
router.put('/belt-rank', auth, asyncHandler(async (req, res) => {
  // Validate input
  const { error } = beltRankSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }

  const { rank, stripes, achievedDate } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      beltRank: {
        rank,
        stripes,
        achievedDate: new Date(achievedDate)
      }
    },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
  }

  res.json({
    success: true,
    data: {
      beltRank: user.beltRank
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

// @route   POST api/auth/resend-verification
// @desc    Resend email verification
// @access  Public
router.post('/resend-verification', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email is required' 
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email is already verified' 
    });
  }

  // Generate new verification token
  const verificationToken = emailService.generateVerificationToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = verificationExpires;
  await user.save();

  // Send verification email
  try {
    await emailService.sendVerificationEmail(email, email.split('@')[0], verificationToken);
    res.json({ 
      success: true, 
      message: 'Verification email sent successfully' 
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send verification email. Please try again.' 
    });
  }
}));

// @route   GET api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid or expired verification token' 
    });
  }

  // Mark email as verified and clear verification fields
  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  // Send welcome email
  try {
    await emailService.sendWelcomeEmail(user.email, user.email.split('@')[0]);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't fail verification if welcome email fails
  }

  // Generate JWT token for automatic login
  const payload = { user: { id: user.id, email: user.email, createdAt: user.createdAt, isPro: user.isPro } };
  const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

  res.json({ 
    success: true, 
    message: 'Email verified successfully!',
    token: jwtToken,
    data: {
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        isPro: user.isPro
      }
    }
  });
}));

module.exports = router;