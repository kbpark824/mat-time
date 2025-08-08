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