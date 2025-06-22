/**
 * @file validateConfig.js
 * @description Utility for validating environment configurations
 */

const { InternalServerError } = require('./errors');

/**
 * Validates that all required environment variables are present
 * @param {Object} config - Configuration object to validate 
 * @param {Array<string>} requiredVars - List of required variable names
 * @param {string} serviceName - Name of service being validated (for error messages)
 * @throws {InternalServerError} If any required variables are missing
 * @returns {boolean} True if all required variables are present
 */
const validateRequiredEnvVars = (config, requiredVars, serviceName) => {
  const missingVars = requiredVars.filter(varName => !config[varName]);
  
  if (missingVars.length > 0) {
    throw new InternalServerError(
      `${serviceName} configuration error: Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
  
  return true;
};

/**
 * Validates Cloudinary configuration
 * @throws {InternalServerError} If any required Cloudinary variables are missing
 */
const validateCloudinaryConfig = () => {
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  return validateRequiredEnvVars(process.env, requiredVars, 'Cloudinary');
};

/**
 * Validates MongoDB configuration
 * @throws {InternalServerError} If MongoDB URI is missing
 */
const validateMongoConfig = () => {
  const requiredVars = ['MONGO_URI'];
  return validateRequiredEnvVars(process.env, requiredVars, 'MongoDB');
};

/**
 * Validates all required application configurations
 * @throws {InternalServerError} If any required configuration is missing
 */
const validateAppConfig = () => {
  try {
    validateCloudinaryConfig();
    validateMongoConfig();
    // Add more service validations as needed
    
    console.log('✅ All configuration validations passed');
    return true;
  } catch (error) {
    console.error('❌ Configuration validation failed:', error.message);
    throw error;
  }
};

module.exports = {
  validateRequiredEnvVars,
  validateCloudinaryConfig,
  validateMongoConfig,
  validateAppConfig
};