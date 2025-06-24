/**
 * @file userRoutes.js
 * @description Routes for user profile operations
 */

const express = require("express");
const router = express.Router();

const {
  updateProfile,
  updateAvatar,
  updateTheme,
  deleteAccount,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require('../middlewares/uploadMiddleware');
const { validate, validations } = require("../middlewares/validationMiddleware");

/**
 * Toate rutele necesită autentificare
 */
router.use(protect);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error or email already in use
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.put("/profile", validate(validations.validateProfileUpdate), updateProfile);

/**
 * @swagger
 * /api/users/avatar:
 *   patch:
 *     summary: Update user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file (jpg, jpeg, png, webp)
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     profileImage:
 *                       type: string
 *                       example: "https://res.cloudinary.com/xxxx/image/upload/v1623451234/taskpro/avatars/abc123.jpg"
 *       400:
 *         description: No image provided or invalid image format
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.patch('/avatar', upload.single('avatar'), updateAvatar);

/**
 * @swagger
 * /api/users/theme:
 *   patch:
 *     summary: Update user theme preference
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - theme
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark, violet]
 *                 example: "dark"
 *     responses:
 *       200:
 *         description: Theme updated successfully
 *       400:
 *         description: Invalid theme value
 *       401:
 *         description: Not authenticated
 */
router.patch("/theme", updateTheme);

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Account deleted successfully
 *       401:
 *         description: Not authenticated
 */
router.delete("/account", deleteAccount);

module.exports = router;
