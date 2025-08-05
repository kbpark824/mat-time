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
  instructor: {
    type: String,
    default: '',
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
SessionSchema.index({ user: 1, date: -1 });
SessionSchema.index({ user: 1, tags: 1 });
SessionSchema.index({ user: 1, date: -1, tags: 1 });

module.exports = mongoose.model('Session', SessionSchema);