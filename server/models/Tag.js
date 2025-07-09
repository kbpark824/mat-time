const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Ensure a user cannot have duplicate tag names
TagSchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Tag', TagSchema);