const mongoose = require('mongoose');

const CompetitionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  organization: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Gi', 'No-Gi'],
    required: true,
  },
  weightDivision: {
    type: String,
    required: true,
    trim: true,
  },
  resultsInDivision: {
    type: String,
    required: true,
    trim: true,
  },
  matchesInDivision: {
    type: Number,
    required: true,
    min: 0,
  },
  matchNotesInDivision: [{
    matchNumber: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    }
  }],
  competedInOpenClass: {
    type: Boolean,
    default: false,
  },
  resultsInOpenClass: {
    type: String,
    default: '',
    trim: true,
  },
  matchesInOpenClass: {
    type: Number,
    default: 0,
    min: 0,
  },
  matchNotesInOpenClass: [{
    matchNumber: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    }
  }],
  generalNotes: {
    type: String,
    default: '',
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
  }],
}, { timestamps: true });

// Text indexes for search functionality
CompetitionSchema.index({ 
  name: 'text', 
  organization: 'text', 
  weightDivision: 'text',
  resultsInDivision: 'text',
  resultsInOpenClass: 'text',
  generalNotes: 'text',
  'matchNotesInDivision.notes': 'text',
  'matchNotesInOpenClass.notes': 'text'
});

// Performance indexes
CompetitionSchema.index({ user: 1, date: -1 });
CompetitionSchema.index({ user: 1, tags: 1 });
CompetitionSchema.index({ user: 1, date: -1, tags: 1 });

module.exports = mongoose.model('Competition', CompetitionSchema);