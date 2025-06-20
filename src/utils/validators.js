/**
 * @file validators.js
 * @description Validation schemas using Joi
 */

const Joi = require('joi');

/**
 * User registration validation schema
 */
exports.registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot be longer than 50 characters',
    'string.empty': 'Name is required',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  })
});

/**
 * User login validation schema
 */
exports.loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  })
});

/**
 * Password reset request validation schema
 */
exports.passwordResetRequestSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  })
});

/**
 * Password reset validation schema
 */
exports.passwordResetSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token is required',
    'any.required': 'Token is required'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  })
});

/**
 * Board creation validation schema
 */
exports.boardCreateSchema = Joi.object({
  title: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Board title must be at least 2 characters long',
    'string.max': 'Board title cannot be longer than 50 characters',
    'string.empty': 'Board title is required',
    'any.required': 'Board title is required'
  }),
  icon: Joi.string().allow('').optional(),
  background: Joi.string().allow('').optional()
});

/**
 * Board update validation schema
 */
exports.boardUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(50).messages({
    'string.min': 'Board title must be at least 2 characters long',
    'string.max': 'Board title cannot be longer than 50 characters',
    'string.empty': 'Board title is required'
  }),
  icon: Joi.string().allow('').optional(),
  background: Joi.string().allow('').optional()
});

/**
 * Column creation validation schema
 */
exports.columnCreateSchema = Joi.object({
  title: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Column title must be at least 2 characters long',
    'string.max': 'Column title cannot be longer than 50 characters',
    'string.empty': 'Column title is required',
    'any.required': 'Column title is required'
  }),
  boardId: Joi.string().required().messages({
    'string.empty': 'Board ID is required',
    'any.required': 'Board ID is required'
  })
});

/**
 * Column update validation schema
 */
exports.columnUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Column title must be at least 2 characters long',
    'string.max': 'Column title cannot be longer than 50 characters',
    'string.empty': 'Column title is required',
    'any.required': 'Column title is required'
  })
});

/**
 * Card creation validation schema
 */
exports.cardCreateSchema = Joi.object({
  title: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Card title must be at least 2 characters long',
    'string.max': 'Card title cannot be longer than 100 characters',
    'string.empty': 'Card title is required',
    'any.required': 'Card title is required'
  }),
  description: Joi.string().allow('').max(1000).optional(),
  columnId: Joi.string().required().messages({
    'string.empty': 'Column ID is required',
    'any.required': 'Column ID is required'
  }),
  dueDate: Joi.date().iso().allow(null).optional(),
  priority: Joi.string().valid('low', 'medium', 'high').default('low'),
  labels: Joi.array().items(Joi.string()).optional()
});

/**
 * Card update validation schema
 */
exports.cardUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(100).messages({
    'string.min': 'Card title must be at least 2 characters long',
    'string.max': 'Card title cannot be longer than 100 characters'
  }),
  description: Joi.string().allow('').max(1000).optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
  priority: Joi.string().valid('low', 'medium', 'high'),
  labels: Joi.array().items(Joi.string()).optional()
});

/**
 * User profile update validation schema
 */
exports.profileUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot be longer than 50 characters'
  }),
  email: Joi.string().email().messages({
    'string.email': 'Please provide a valid email address'
  })
});
