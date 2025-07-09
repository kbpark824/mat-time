const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/revenuecat/webhook
// @desc    Handle RevenueCat webhooks
// @access  Public
router.post('/webhook', async (req, res) => {
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