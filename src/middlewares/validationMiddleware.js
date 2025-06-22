const { check, validationResult } = require('express-validator');

/**
 * Middleware pentru procesarea rezultatelor validării
 * @param {Array} validations - Array de reguli de validare
 * @returns {Array} - Middleware-uri pentru validare și procesare rezultate
 */
const validate = (validations) => {
  return [
  
    ...validations,
  
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array().map(err => ({
            field: err.path,
            message: err.msg
          }))
        });
      }
      next();
    }
  ];
};

const validations = {
  // Board validations
  validateBoardCreate: [
    check('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Title must be between 3 and 50 characters'),
    check('icon')
      .optional()
      .isString()
      .withMessage('Icon must be a string'),
    check('background')
      .optional()
      .isString()
      .withMessage('Background must be a string'),
  ],

  validateBoardUpdate: [
    check('title')
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage('Title must be between 3 and 50 characters'),
    check('icon')
      .optional()
      .isString()
      .withMessage('Icon must be a string'),
    check('background')
      .optional()
      .isString()
      .withMessage('Background must be a string'),
  ],

  // Column validations
  validateColumnCreate: [
    check('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Title must be between 3 and 50 characters'),
    check('board')
      .notEmpty()
      .withMessage('Board ID is required')
      .isMongoId()
      .withMessage('Invalid board ID format'),
  ],

  validateColumnUpdate: [
    check('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Title must be between 3 and 50 characters'),
  ],

  // Card validations
  validateCardCreate: [
    check('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    check('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    check('column')
      .notEmpty()
      .withMessage('Column ID is required')
      .isMongoId()
      .withMessage('Invalid column ID format'),
    check('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high'),
    check('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date'),
  ],

  validateCardUpdate: [
    check('title')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    check('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    check('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high'),
    check('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date'),
  ],

  // Authentication validations
  validateRegistration: [
    check('name')
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 characters'),
    check('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    check('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  
  validateLogin: [
    check('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    check('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  
  validatePasswordReset: [
    check('token')
      .notEmpty()
      .withMessage('Token is required'),
    check('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  validateProfileUpdate: [
  check('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters'),
  check('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
]
};

module.exports = {
  validations,
  validate
};