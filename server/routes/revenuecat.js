const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');

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
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ msg: 'Unauthorized - Invalid signature' });
  }
  
  next();
};

// @route   POST /api/revenuecat/webhook
// @desc    Handle RevenueCat webhooks
// @access  Public (but signature verified)
router.post('/webhook', verifySignature, async (req, res) => {
  const { event } = req.body;
  const { app_user_id, entitlements } = event;

  if (!app_user_id) {
    return res.status(400).json({ msg: 'User ID is required' });
  }

  try {
    const user = await User.findOne({ revenueCatId: app_user_id });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isPro = entitlements.pro && entitlements.pro.expires_date === null;

    if (user.isPro !== isPro) {
      user.isPro = isPro;
      await user.save();
    }

    res.status(200).send('Webhook received');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;