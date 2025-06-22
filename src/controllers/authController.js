const asyncHandler = require("express-async-handler"); 
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Session = require("../models/Session");

/**
 * Generate JSON Web Token (access token)
 * @param {string} id - User ID to encode in token
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "20d",
  });
};

/**
 * Generate a random refresh token
 * @returns {string} random refresh token
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Create and save a session record
 * @param {string} userId - User ID
 * @param {Object} req - Express request object
 * @returns {Promise<{refreshToken: string}>}
 */
const createSession = async (userId, req) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  const expiryDays = expiresIn.endsWith("d") ? parseInt(expiresIn) : 7;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  const refreshToken = generateRefreshToken();

  await Session.create({
    userId,
    refreshToken,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
    expiresAt,
  });

  return { refreshToken };
};

/**
 * Format user response data (removes sensitive fields)
 * @param {Object} user - User document
 * @returns {Object} Formatted user object
 */
const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  theme: user.theme,
});

/**
 * Handle authentication response (used by both register and login)
 * @param {Object} user - User document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code to return
 */
const sendAuthResponse = async (user, req, res, statusCode = 200) => {
  // Generate tokens
  const token = generateToken(user._id);
  const { refreshToken } = await createSession(user._id, req);

  // Send response (include refreshToken pentru viitorul flow)
  res.status(statusCode).json({
    user: formatUserResponse(user),
    token,         // access token
    refreshToken,  // refresh token
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
    throw new Error("User already exists");
  }

  // Create user
  const user = await User.create({ name, email, password });
  if (!user) {
    res.status(400);
    throw new Error("Invalid user data");
  }

  // Send authentication response
  await sendAuthResponse(user, req, res, 201);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select("+password");

  // Check if user exists and password matches
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Send authentication response
  await sendAuthResponse(user, req, res);
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // Șterge sesiunea curentă (bazată pe refreshToken primit în body sau header)
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400);
    throw new Error("No refresh token provided");
  }
  await Session.findOneAndDelete({ userId: req.user._id, refreshToken });
  res.json({ message: "Logged out successfully" });
});

/**
 * @desc    Refresh user's token
 * @route   POST /api/auth/refresh
 * @access  Private
 */
const refreshUser = asyncHandler(async (req, res) => {
  // Utilizatorul este deja atașat la req de către middleware-ul protect
  // Generăm un nou token de acces
  const token = generateToken(req.user._id);
  
  // Obținem refresh token-ul existent sau generăm unul nou
  let refreshToken;
  
  if (req.body.refreshToken) {
    // Verificăm dacă refresh token-ul există în baza de date
    const session = await Session.findOne({ 
      userId: req.user._id, 
      refreshToken: req.body.refreshToken 
    });
    
    if (session) {
      refreshToken = req.body.refreshToken;
      
      // Actualizăm data de expirare a sesiunii
      const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
      const expiryDays = expiresIn.endsWith("d") ? parseInt(expiresIn) : 30;
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);
      
      session.expiresAt = expiresAt;
      await session.save();
    } else {
      // Dacă sesiunea nu există, creăm una nouă
      const newSession = await createSession(req.user._id, req);
      refreshToken = newSession.refreshToken;
    }
  } else {
    // Dacă nu este furnizat un refresh token, creăm o sesiune nouă
    const newSession = await createSession(req.user._id, req);
    refreshToken = newSession.refreshToken;
  }
  
  // Trimitem răspunsul
  res.json({
    user: formatUserResponse(req.user),
    token,
    refreshToken
  });
});

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ user: formatUserResponse(req.user) });
});

/**
 * @desc    Google OAuth login/register
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleAuth = asyncHandler(async (req, res) => {
  // Placeholder – pentru viitor, va fi implementat cu Passport.js
  res.status(501).json({ message: "Google authentication not implemented yet" });
});

module.exports = {
  register,
  login,
  logout,
  refreshUser,
  getCurrentUser,
  googleAuth,
};