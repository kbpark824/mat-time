const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  isPro: {
    type: Boolean,
    default: false,
  },
  revenueCatId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple documents to have a null value
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
  },
  emailVerificationExpires: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  beltRank: {
    rank: {
      type: String,
      enum: ['white', 'blue', 'purple', 'brown', 'black'],
      default: 'white'
    },
    stripes: {
      type: Number,
      min: 0,
      max: 4,
      default: 0
    },
    achievedDate: {
      type: Date,
      default: Date.now
    }
  },
});

// Hash password before saving the user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);