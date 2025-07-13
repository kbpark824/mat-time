const mongoose = require('mongoose');

const SeminarSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  professorName: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Gi', 'No-Gi'],
    required: true,
  },
  techniqueNotes: {
    type: String,
    default: '',
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
  }],
}, { timestamps: true });

SeminarSchema.index({ techniqueNotes: 'text', professorName: 'text' });
SeminarSchema.index({ user: 1, date: -1 });
SeminarSchema.index({ user: 1, tags: 1 });
SeminarSchema.index({ user: 1, date: -1, tags: 1 });

module.exports = mongoose.model('Seminar', SeminarSchema);