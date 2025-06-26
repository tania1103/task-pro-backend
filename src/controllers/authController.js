const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Session = require("../models/Session");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "20d",
  });
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

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

const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  theme: user.theme,
});

const sendAuthResponse = async (user, req, res, statusCode = 200) => {
  const token = generateToken(user._id);
  const { refreshToken } = await createSession(user._id, req);

  res.status(statusCode).json({
    user: formatUserResponse(user),
    token,
    refreshToken,
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password });
  if (!user) {
    res.status(400);
    throw new Error("Invalid user data");
  }

  await sendAuthResponse(user, req, res, 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  await sendAuthResponse(user, req, res);
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400);
    throw new Error("No refresh token provided");
  }
  await Session.findOneAndDelete({ userId: req.user._id, refreshToken });
  res.json({ message: "Logged out successfully" });
});

const refreshUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400);
    throw new Error("Refresh token is required.");
  }

  const session = await Session.findOne({ refreshToken });

  if (!session || session.expiresAt < new Date()) {
    res.status(401);
    throw new Error("Invalid refresh token or session expired");
  }

  const user = await User.findById(session.userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const token = generateToken(user._id);

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
  const expiryDays = expiresIn.endsWith("d") ? parseInt(expiresIn) : 30;
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + expiryDays);

  session.expiresAt = newExpiresAt;
  await session.save();

  res.json({
    user: formatUserResponse(user),
    token,
    refreshToken,
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ user: formatUserResponse(req.user) });
});

const googleAuth = asyncHandler(async (req, res) => {
  res
    .status(501)
    .json({ message: "Google authentication not implemented yet" });
});

module.exports = {
  register,
  login,
  logout,
  refreshUser,
  getCurrentUser,
  googleAuth,
};
