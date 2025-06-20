/**
 * @file helpers.js
 * @description General helper functions for the application
 */

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the string to generate
 * @returns {string} - Random string
 */
exports.generateRandomString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = chars.length;
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
};

/**
 * Format date to a specific format
 * @param {Date} date - Date to format
 * @param {string} format - Format string
 * @returns {string} - Formatted date string
 */
exports.formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Remove sensitive fields from an object
 * @param {Object} obj - Object to sanitize
 * @param {Array} fields - Fields to remove
 * @returns {Object} - Sanitized object
 */
exports.sanitizeObject = (obj, fields = ['password', '__v']) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  
  // Handle objects returned from Mongoose (convert to plain object)
  if (sanitized.toObject && typeof sanitized.toObject === 'function') {
    return this.sanitizeObject(sanitized.toObject(), fields);
  }
  
  fields.forEach(field => {
    if (field in sanitized) {
      delete sanitized[field];
    }
  });
  
  return sanitized;
};

/**
 * Paginate an array of items
 * @param {Array} items - Array of items to paginate
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of items per page
 * @returns {Object} - Pagination result
 */
exports.paginateArray = (items, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  
  const results = {
    data: items.slice(startIndex, endIndex),
    pagination: {
      total,
      totalPages,
      currentPage: page,
      perPage: limit,
      hasNext: endIndex < total,
      hasPrev: startIndex > 0
    }
  };
  
  return results;
};
