const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Session = require('../models/Session');

/**
 * Protect routes - Authentication middleware
 * Verifies JWT token and adds user to request
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token is in active sessions
      const session = await Session.findOne({ 
        userId: decoded.id, 
        token,
        expires: { $gt: new Date() }
      });
      
      if (!session) {
        res.status(401);
        throw new Error('Not authorized, session expired');
      }

      // Get user from database and add to request
      req.user = await User.findById(decoded.id).select('-password');
      req.token = token;
      
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect };
