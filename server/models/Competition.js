/*
 * Mat Time - Martial Arts Training Session Tracking Application
 * Copyright (C) 2025 Kibum Park
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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