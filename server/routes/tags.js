const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Tag = require('../models/Tag');

// @route   GET api/tags
// @desc    Get all unique tags for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const tags = await Tag.find({ user: req.user.id }).sort({ name: 1 });
        res.json(tags);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;