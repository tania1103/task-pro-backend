const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

/**
 * Generate JSON Web Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Create and save a session record
 */
const createSession = async (userId, token, req) => {
  // Calculate expiry date
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const expiryDays = expiresIn.endsWith('d') ? parseInt(expiresIn) : 7;
  
  const expires = new Date();
  expires.setDate(expires.getDate() + expiryDays);
  
  // Create session
  await Session.create({
    userId,
    token,
    expires,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    // Generate token
    const token = generateToken(user._id);
    
    // Create session
    await createSession(user._id, token, req);
    
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
      },
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select('+password');

  // Check if user exists and password matches
  if (user && (await user.comparePassword(password))) {
    // Generate token
    const token = generateToken(user._id);
    
    // Create session
    await createSession(user._id, token, req);
    
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
      },
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // Remove session
  await Session.findOneAndDelete({ userId: req.user._id, token: req.token });
  
  res.json({ message: 'Logged out successfully' });
});

/**
 * @desc    Refresh user token
 * @route   GET /api/auth/refresh
 * @access  Private
 */
const refreshUser = asyncHandler(async (req, res) => {
  // User is already attached to req by auth middleware
  res.json({
    user: req.user,
  });
});

/**
 * @desc    Google OAuth login/register
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleAuth = asyncHandler(async (req, res) => {
  // This would typically be handled by Passport.js
  // For now, just include a placeholder
  res.status(501).json({ message: 'Google authentication not implemented yet' });
});

module.exports = {
  register,
  login,
  logout,
  refreshUser,
  googleAuth,
};
