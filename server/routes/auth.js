const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const Session = require('../models/Session');
const Tag = require('../models/Tag');
const RefreshToken = require('../models/RefreshToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const auth = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const emailService = require('../utils/emailService');

// Helper function to generate both access and refresh tokens
const generateTokens = async (user, req) => {
  // Generate short-lived access token (15 minutes)
  const payload = { user: { id: user.id, email: user.email, createdAt: user.createdAt, isPro: user.isPro } };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  
  // Clean up old refresh tokens for this user
  await RefreshToken.cleanupExpiredTokens(user.id);
  
  // Generate refresh token (30 days)
  const deviceInfo = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    platform: req.headers['x-platform'] || 'unknown'
  };
  
  const refreshTokenDoc = await RefreshToken.createToken(user.id, deviceInfo);
  
  return {
    accessToken,
    refreshToken: refreshTokenDoc.token
  };
};

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

  // Generate both access and refresh tokens
  const { accessToken, refreshToken } = await generateTokens(user, req);
  
  res.json({ 
    success: true, 
    accessToken,
    refreshToken,
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

// @route   POST api/auth/check-verification-status
// @desc    Check if user's email is verified
// @access  Public
router.post('/check-verification-status', asyncHandler(async (req, res) => {
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
    // Generate tokens using modern refresh token system
    const { accessToken, refreshToken } = await generateTokens(user, req);

    return res.json({ 
      success: true, 
      isVerified: true,
      accessToken,
      refreshToken,
      // Keep legacy 'token' field for backward compatibility
      token: accessToken,
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
  }

  res.json({ 
    success: true, 
    isVerified: false 
  });
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

  // For web browser verification, redirect to success page
  // For API calls, return JSON response
  const acceptHeader = req.headers.accept || '';
  if (acceptHeader.includes('text/html')) {
    // Browser request - redirect to success page
    res.redirect('/verify-success.html');
  } else {
    // API request - return JSON with tokens for mobile app
    const { accessToken, refreshToken } = await generateTokens(user, req);

    res.json({ 
      success: true, 
      message: 'Email verified successfully!',
      accessToken,
      refreshToken,
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
  }
}));

// @route   POST api/auth/refresh
// @desc    Refresh access token using refresh token
// @access  Public
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ 
      success: false, 
      error: 'Refresh token is required' 
    });
  }

  // Find the refresh token in database
  const tokenDoc = await RefreshToken.findOne({ 
    token: refreshToken,
    isRevoked: false 
  }).populate('userId');

  if (!tokenDoc || !tokenDoc.isValid()) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired refresh token' 
    });
  }

  // Extend token expiration for sliding behavior (30 more days)
  await tokenDoc.extendExpiration(30);

  const user = tokenDoc.userId;
  
  // Generate new access token (keep same refresh token)
  const payload = { user: { id: user.id, email: user.email, createdAt: user.createdAt, isPro: user.isPro } };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

  res.json({
    success: true,
    accessToken,
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

// @route   POST api/auth/logout
// @desc    Logout user and revoke refresh token
// @access  Private
router.post('/logout', auth, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    // Revoke the specific refresh token
    await RefreshToken.findOneAndUpdate(
      { token: refreshToken, userId: req.user.id },
      { isRevoked: true }
    );
  }
  
  // Optionally: revoke all refresh tokens for this user
  // await RefreshToken.updateMany(
  //   { userId: req.user.id },
  //   { isRevoked: true }
  // );

  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
}));

// @route   POST api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email is required' 
    });
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists for security
    return res.json({ 
      success: true, 
      message: 'If an account with that email exists, we\'ve sent a password reset link.' 
    });
  }

  try {
    // Create password reset token
    const resetToken = await PasswordResetToken.createToken(
      user._id, 
      user.email, 
      req.ip
    );

    // Send password reset email
    await emailService.sendPasswordResetEmail(
      user.email, 
      user.email.split('@')[0], 
      resetToken.token
    );

    res.json({ 
      success: true, 
      message: 'If an account with that email exists, we\'ve sent a password reset link.' 
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send password reset email. Please try again.' 
    });
  }
}));

// @route   POST api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Validate input
  if (!token || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Token and password are required' 
    });
  }

  // Validate password strength
  const passwordSchema = Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#+\\-_=<>.,;:()\\[\\]{}|~^])[A-Za-z\\d@$!%*?&#+\\-_=<>.,;:()\\[\\]{}|~^]+$')).required();
  const { error } = passwordSchema.validate(password);
  
  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    });
  }

  // Find and validate reset token
  const resetTokenDoc = await PasswordResetToken.findValidToken(token);
  if (!resetTokenDoc) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid or expired reset token' 
    });
  }

  try {
    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    const user = resetTokenDoc.userId;
    user.password = hashedPassword;
    await user.save();

    // Mark token as used
    resetTokenDoc.isUsed = true;
    await resetTokenDoc.save();

    // Revoke all existing refresh tokens for security
    await RefreshToken.updateMany(
      { userId: user._id },
      { isRevoked: true }
    );

    // Generate new tokens for immediate login
    const { accessToken, refreshToken } = await generateTokens(user, req);

    res.json({ 
      success: true, 
      message: 'Password reset successfully!',
      accessToken,
      refreshToken,
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
  } catch (error) {
    console.error('Failed to reset password:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reset password. Please try again.' 
    });
  }
}));

// @route   GET api/auth/validate-reset-token/:token
// @desc    Validate password reset token
// @access  Public
router.get('/validate-reset-token/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  const resetTokenDoc = await PasswordResetToken.findValidToken(token);
  
  if (!resetTokenDoc) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid or expired reset token' 
    });
  }

  res.json({ 
    success: true, 
    message: 'Valid reset token',
    email: resetTokenDoc.email
  });
}));

module.exports = router;