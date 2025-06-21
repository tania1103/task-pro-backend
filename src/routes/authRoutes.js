/**
 * @file authRoutes.js
 * @description Authentication routes for user registration, login, logout, etc.
 */

const express = require("express");
const {
  register,
  login,
  logout,
  refreshUser,
  // refreshToken,
  // requestPasswordReset,
  // resetPassword,
  getCurrentUser,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists or invalid input
 */
router.post("/register", validateRegistration, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validateLogin, login);
/**
 * @route POST /api/auth/logout
 * @desc Logout user and invalidate token
 * @access Private
 */
// router.post("/logout", authMiddleware, logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh user data using token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/refresh", refreshUser);

/**
 * @route POST /api/auth/request-password-reset
 * @desc Send password reset email to user
 * @access Public
 */
// router.post("/request-password-reset", requestPasswordReset);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset user password with token
 * @access Public
 */
// router.post("/reset-password", validatePasswordReset, resetPassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns current user info
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protect, getCurrentUser);

module.exports = router;
