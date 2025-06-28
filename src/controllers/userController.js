/**
 * @file userController.js
 * @description Controller for user profile operations
 */

const User = require('../models/User');
const Session = require('../models/Session');
const cloudinaryService = require('../services/cloudinaryService');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Update user profile information
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;
    
    // Check if email is already in use by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        throw new BadRequestError('Email is already in use');
      }
    }
    
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }
    
    res.status(200).json({
      status: 'success',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/profileImage
exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image provided" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Upload imagine la Cloudinary
    const result = await cloudinaryService.uploadImage(req.file.path, {
      folder: "task_pro/avatars",
      transformation: [{ width: 256, height: 256, crop: "fill" }],
    });

    req.user.profileImage = result.secure_url;
    await req.user.save();

   // Răspuns cu URL-ul imaginii
    res.json({ 
      profileImage: result.secure_url,
      message: "Avatar updated successfully" 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update user theme preference
 */
exports.updateTheme = async (req, res, next) => {
  try {
    const { theme } = req.body;
    const userId = req.user.id;
    
    // Validate theme value
    const validThemes = ['light', 'dark', 'violet'];
    if (!validThemes.includes(theme)) {
      throw new BadRequestError('Invalid theme value. Must be one of: light, dark, violet');
    }
    
    // Update user theme
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { theme },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        theme: updatedUser.theme
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user theme preference
 */
exports.getTheme = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('theme');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ theme: user.theme });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Delete all user sessions
    await Session.deleteMany({ userId });
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
