/**
 * @file authRoutes.js
 * @description Authentication routes for user registration, login, logout, etc.
 */

const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const {
  register,
  login,
  logout,
  refreshUser,
  getCurrentUser,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const {
  validations,
  validate,
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
router.post("/register", validate(validations.validateRegistration), register);

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
router.post("/login", validate(validations.validateLogin), login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and invalidate token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token primit la login
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized or session not found
 */
router.post("/logout", protect, logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh user data using token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/refresh", refreshUser);

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
router.get("/me", getCurrentUser);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Start Google OAuth login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google for authentication
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Google authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 token:
 *                   type: string
 *       401:
 *         description: Authentication failed
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  async (req, res) => {
    // Generează JWT și returnează-l
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "20d",
    });
    res.json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        theme: req.user.theme,
        profileImage: req.user.profileImage,
      },
      token,
    });
    //  Redirect spre frontend:
    // res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}`)
  }
);

module.exports = router;
