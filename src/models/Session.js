const mongoose = require('mongoose');

/**
 * Session Schema
 * Used for tracking user sessions and enabling logout functionality
 */
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    userAgent: String,
    ipAddress: String,
  },
  {
    timestamps: true,
  }
);

/**
 * Index for efficient queries
 */
sessionSchema.index({ userId: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ expires: 1 }, { expireAfterSeconds: 0 }); // Auto-remove expired sessions

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
