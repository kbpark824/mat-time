const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // In hours, e.g., 1.5 for 90 minutes
    required: true,
  },
  type: {
    type: String,
    enum: ['Gi', 'No-Gi', 'Open Mat'],
    required: true,
  },
  techniqueNotes: {
    type: String,
    default: '',
  },
  rollingNotes: {
    type: String,
    default: '',
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
  }],
}, { timestamps: true });

SessionSchema.index({ techniqueNotes: 'text', rollingNotes: 'text' });

module.exports = mongoose.model('Session', SessionSchema);