/**
 * @file userRoutes.js
 * @description Routes for user profile operations
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  updateProfile,
  updateAvatar,
  updateTheme,
  deleteAccount,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const {
  validate,
  validations,
} = require("../middlewares/validationMiddleware");

// Configurare Multer pentru upload temporar
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limită
  },
  fileFilter: (req, file, cb) => {
    // Acceptă doar imagini
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

const router = express.Router();

// All user routes require authentication
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
 *     description: |
 *       ## Frontend Implementation Guide:
 *       1. Create a form with `enctype="multipart/form-data"`
 *       2. Add file input: `<input type="file" name="avatar" accept="image/*">`
 *       3. Example JavaScript code:
 *       ```js
 *       const form = new FormData();
 *       form.append('avatar', fileInput.files[0]);
 *       
 *       fetch('/api/users/avatar', {
 *         method: 'PATCH',
 *         headers: {
 *           'Authorization': `Bearer ${token}`
 *         },
 *         body: form
 *       })
 *       .then(response => response.json())
 *       .then(data => {
 *         // Update UI with new avatar URL
 *         userAvatar.src = data.data.profileImage;
 *       });
 *       ```
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
 *                       example: "https://res.cloudinary.com/dxxxx/image/upload/v1623451234/taskpro/avatars/abc123.jpg"
 *       400:
 *         description: No image provided or invalid image format
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.patch("/avatar", upload.single("avatar"), updateAvatar);

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