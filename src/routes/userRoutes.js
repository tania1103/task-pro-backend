/**
 * @file userRoutes.js
 * @description Routes for user profile operations
 */

const express = require('express');
const { 
  updateProfile,
  updateAvatar,
  updateTheme,
  deleteAccount
} = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateProfileUpdate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

/**
 * @route PUT /api/users/profile
 * @desc Update user profile information
 * @access Private
 */
router.put('/profile', validateProfileUpdate, updateProfile);

/**
 * @route PATCH /api/users/avatar
 * @desc Update user avatar
 * @access Private
 */
router.patch('/avatar', updateAvatar);

/**
 * @route PATCH /api/users/theme
 * @desc Update user theme preference
 * @access Private
 */
router.patch('/theme', updateTheme);

/**
 * @route DELETE /api/users/account
 * @desc Delete user account
 * @access Private
 */
router.delete('/account', deleteAccount);

module.exports = router;
