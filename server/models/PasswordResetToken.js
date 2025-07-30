const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetTokenSchema = new mongoose.Schema({
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
  email: {
    type: String,
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
  isUsed: {
    type: Boolean,
    default: false
  },
  ipAddress: {
    type: String,
    required: false
  }
});

// Static method to generate a secure reset token
passwordResetTokenSchema.statics.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Instance method to check if token is expired
passwordResetTokenSchema.methods.isExpired = function() {
  return Date.now() >= this.expiresAt.getTime();
};

// Instance method to check if token is valid
passwordResetTokenSchema.methods.isValid = function() {
  return !this.isUsed && !this.isExpired();
};

// Static method to create a new password reset token
passwordResetTokenSchema.statics.createToken = async function(userId, email, ipAddress = null) {
  // First, invalidate any existing reset tokens for this user
  await this.updateMany(
    { userId, isUsed: false },
    { isUsed: true }
  );
  
  const token = this.generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  const resetToken = new this({
    token,
    userId,
    email,
    expiresAt,
    ipAddress
  });
  
  return await resetToken.save();
};

// Static method to find and validate token
passwordResetTokenSchema.statics.findValidToken = async function(token) {
  const resetToken = await this.findOne({ token }).populate('userId');
  
  if (!resetToken || !resetToken.isValid()) {
    return null;
  }
  
  return resetToken;
};

// Static method to cleanup expired tokens
passwordResetTokenSchema.statics.cleanupExpiredTokens = async function() {
  return await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true }
    ]
  });
};

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);