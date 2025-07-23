const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const validateObjectId = require('../middleware/validateObjectId');
const Tag = require('../models/Tag');
const Session = require('../models/Session');
const Seminar = require('../models/Seminar');
const Competition = require('../models/Competition');
const logger = require('../config/logger');

// @route   GET api/tags
// @desc    Get all unique tags for a user
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
    const tags = await Tag.find({ user: req.user.id }).sort({ name: 1 });
    res.json(tags);
}));

// @route   DELETE api/tags/:id
// @desc    Delete a tag and remove it from all associated activities
// @access  Private
router.delete('/:id', auth, validateObjectId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Verify the tag exists and belongs to the user
    const tag = await Tag.findOne({ _id: id, user: req.user.id });
    if (!tag) {
        return res.status(404).json({ message: 'Tag not found' });
    }
    
    // Remove the tag from all activities that reference it
    await Promise.all([
        Session.updateMany(
            { user: req.user.id, tags: id },
            { $pull: { tags: id } }
        ),
        Seminar.updateMany(
            { user: req.user.id, tags: id },
            { $pull: { tags: id } }
        ),
        Competition.updateMany(
            { user: req.user.id, tags: id },
            { $pull: { tags: id } }
        )
    ]);
    
    // Delete the tag itself
    await Tag.findByIdAndDelete(id);
    
    logger.info(`Tag '${tag.name}' deleted for user ${req.user.id}`);
    res.json({ message: 'Tag deleted successfully' });
}));

module.exports = router;