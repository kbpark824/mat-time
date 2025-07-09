const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Session = require('../models/Session');
const Tag = require('../models/Tag');

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

// @route   POST api/sessions
// @desc    Create a new session log
// @access  Private
router.post('/', auth, async (req, res) => {
  const { date, duration, type, techniqueNotes, rollingNotes, tags } = req.body;

  try {
    const tagIds = await getTagIds(tags, req.user.id);

    const newSession = new Session({
      user: req.user.id,
      date,
      duration,
      type,
      techniqueNotes,
      rollingNotes,
      tags: tagIds,
    });

    const session = await newSession.save();
    await session.populate('tags');
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/sessions
// @desc    Get all sessions for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
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

    const sessions = await Session.find(query)
      .populate('tags')
      .sort({ date: -1 });

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   PUT api/sessions/:id
// @desc    Update a session
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { date, duration, type, techniqueNotes, rollingNotes, tags } = req.body;

    try {
        let session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ msg: 'Session not found' });

        if (session.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const tagIds = await getTagIds(tags, req.user.id);
        
        const updatedSessionData = {
            date,
            duration,
            type,
            techniqueNotes,
            rollingNotes,
            tags: tagIds
        };

        session = await Session.findByIdAndUpdate(
            req.params.id,
            { $set: updatedSessionData },
            { new: true }
        ).populate('tags');

        res.json(session);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/sessions/:id
// @desc    Delete a session
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ msg: 'Session not found' });

        if (session.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Session.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Session removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;