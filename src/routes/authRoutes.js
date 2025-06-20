/**
 * @file authRoutes.js
 * @description Authentication routes for user registration, login, logout, etc.
 */

const express = require('express');
const { 
  register, 
  login, 
  logout, 
  refreshToken, 
  requestPasswordReset, 
  resetPassword,
  getCurrentUser
} = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateRegistration, validateLogin, validatePasswordReset } = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', validateRegistration, register);

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
router.post('/login', validateLogin, login);

/**
 * @route POST /api/auth/logout
 * @desc Logout user and invalidate token
 * @access Private
 */
router.post('/logout', authMiddleware, logout);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh', refreshToken);

/**
 * @route POST /api/auth/request-password-reset
 * @desc Send password reset email to user
 * @access Public
 */
router.post('/request-password-reset', requestPasswordReset);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset user password with token
 * @access Public
 */
router.post('/reset-password', validatePasswordReset, resetPassword);

/**
 * @route GET /api/auth/me
 * @desc Get current user information
 * @access Private
 */
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
