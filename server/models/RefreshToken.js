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
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index for automatic cleanup
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    platform: String
  },
  isRevoked: {
    type: Boolean,
    default: false
  }
});

// Static method to generate a secure refresh token
refreshTokenSchema.statics.generateToken = function() {
  return crypto.randomBytes(64).toString('hex');
};

// Instance method to check if token is expired
refreshTokenSchema.methods.isExpired = function() {
  return Date.now() >= this.expiresAt.getTime();
};

// Instance method to check if token is valid
refreshTokenSchema.methods.isValid = function() {
  return !this.isRevoked && !this.isExpired();
};

// Instance method to extend token expiration (sliding tokens)
refreshTokenSchema.methods.extendExpiration = function(extensionDays = 30) {
  this.expiresAt = new Date(Date.now() + extensionDays * 24 * 60 * 60 * 1000);
  this.lastUsed = new Date();
  return this.save();
};

// Static method to create a new refresh token
refreshTokenSchema.statics.createToken = async function(userId, deviceInfo = {}) {
  const token = this.generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  const refreshToken = new this({
    token,
    userId,
    expiresAt,
    deviceInfo
  });
  
  return await refreshToken.save();
};

// Static method to cleanup expired tokens for a user
refreshTokenSchema.statics.cleanupExpiredTokens = async function(userId) {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  return await this.deleteMany({
    userId,
    $or: [
      { expiresAt: { $lt: new Date() } }, // Expired tokens
      { isRevoked: true }, // Revoked tokens
      { createdAt: { $lt: ninetyDaysAgo } } // Very old tokens (even if still valid)
    ]
  });
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);