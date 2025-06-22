/**
 * @file cloudinaryService.js
 * @description Service for Cloudinary image upload and management
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const { validateCloudinaryConfig } = require('../utils/validateConfig');

// Verifică configurația Cloudinary înainte de utilizare
validateCloudinaryConfig();

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload an image to Cloudinary
 * @param {string} filePath - Path to the local image file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
exports.uploadImage = async (filePath, options = {}) => {
  try {
    // Verifică dacă fișierul există
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }
    
    // Set default folder and transformation options
    const uploadOptions = {
      folder: 'task_pro/avatars',
      transformation: [
        { width: 250, height: 250, crop: 'fill', gravity: 'face' }
      ],
      ...options
    };
    
    // Upload the image
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    
    // Delete the local file after upload
    await unlinkAsync(filePath);
    
    return result;
  } catch (error) {
    // Delete the local file in case of error
    try {
      if (fs.existsSync(filePath)) {
        await unlinkAsync(filePath);
      }
    } catch (err) {
      console.error('Error deleting local file:', err);
    }
    
    // Adăugarea informațiilor contextuale la eroare
    const enhancedError = new Error(`Cloudinary upload failed: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.filePath = filePath;
    
    // Log detaliat pentru debugging
    console.error('Cloudinary upload error:', {
      message: error.message,
      filePath,
      options,
      stack: error.stack
    });
    
    throw enhancedError;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Public ID of the image
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
exports.deleteImage = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

/**
 * Get a signed URL for image upload directly from client
 * @param {Object} options - Options for the signature
 * @returns {Object} - Signature data for client upload
 */
exports.getSignature = (options = {}) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request({
    timestamp,
    folder: 'task_pro/avatars',
    ...options
  }, process.env.CLOUDINARY_API_SECRET);
  
  return {
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY
  };
};
