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
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const User = require('../models/User');
const logger = require('../config/logger');
const constants = require('../config/constants');

// Rate limiting for webhook endpoint - more restrictive than general API
const webhookLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes (more restrictive than general API)
  max: constants.RATE_LIMITING.WEBHOOK_MAX_REQUESTS,
  message: {
    error: 'Too many webhook requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development
  skip: (req) => process.env.NODE_ENV !== 'production' && req.ip === '127.0.0.1'
});

// Middleware to verify RevenueCat webhook signature
const verifySignature = (req, res, next) => {
  const signature = req.headers['x-revenuecat-signature'];
  const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
  
  if (!signature || !webhookSecret) {
    return res.status(401).json({ msg: 'Unauthorized - Missing signature or webhook secret' });
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  // Use timing-safe comparison to prevent timing attacks
  // First validate signature length (SHA256 hex = 64 characters)
  if (signature.length !== 64) {
    return res.status(401).json({ msg: 'Unauthorized - Invalid signature format' });
  }
  
  try {
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    // Both buffers should be 32 bytes (SHA256 output length)
    if (signatureBuffer.length !== expectedBuffer.length || signatureBuffer.length !== 32) {
      return res.status(401).json({ msg: 'Unauthorized - Invalid signature format' });
    }
    
    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return res.status(401).json({ msg: 'Unauthorized - Invalid signature' });
    }
  } catch (error) {
    return res.status(401).json({ msg: 'Unauthorized - Invalid signature format' });
  }
  
  next();
};

// @route   POST /api/revenuecat/webhook
// @desc    Handle RevenueCat webhooks
// @access  Public (but signature verified and rate limited)
router.post('/webhook', webhookLimiter, verifySignature, async (req, res) => {
  const { event } = req.body;
  const { app_user_id, entitlements } = event;

  if (!app_user_id) {
    return res.status(400).json({ msg: 'User ID is required' });
  }

  if (!entitlements || typeof entitlements !== 'object') {
    return res.status(400).json({ msg: 'Invalid entitlements data' });
  }

  try {
    const user = await User.findOne({ revenueCatId: app_user_id });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    let isPro = false;
    try {
      isPro = entitlements.pro && entitlements.pro.expires_date === null;
    } catch (err) {
      logger.error(`Error parsing entitlements: ${err.message}`);
      return res.status(400).json({ msg: 'Invalid entitlements format' });
    }

    if (user.isPro !== isPro) {
      user.isPro = isPro;
      await user.save();
    }

    res.status(200).send('Webhook received');
  } catch (err) {
    logger.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;