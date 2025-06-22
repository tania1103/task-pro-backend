const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  ip: {
    type: String
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster token lookups
SessionSchema.index({ refreshToken: 1 });
// Index for cleaning up expired sessions
SessionSchema.index({ expiresAt: 1 });
// Index for finding user sessions
SessionSchema.index({ userId: 1 });

module.exports = mongoose.model('Session', SessionSchema);