const { validationResult, check } = require('express-validator');

/**
 * Middleware to validate request data
 * @param {Array} validations - Array of express-validator validation rules
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    // Format validation errors
    const formattedErrors = errors.array().reduce((acc, error) => {
      if (!acc[error.path]) {
        acc[error.path] = [];
      }
      acc[error.path].push(error.msg);
      return acc;
    }, {});
    
    // Return validation errors
    return res.status(400).json({
      message: 'Validation Error',
      errors: formattedErrors,
    });
  };
};

/**
 * Common validation rules
 */
const validations = {
  // Auth validations
  login: [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email'),
    check('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  
  register: [
    check('name')
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 characters'),
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  
  // Board validations
  createBoard: [
    check('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3 })
      .withMessage('Title must be at least 3 characters')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
  ],
  
  // Column validations
  createColumn: [
    check('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3 })
      .withMessage('Title must be at least 3 characters')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    check('boardId')
      .notEmpty()
      .withMessage('Board ID is required')
      .isMongoId()
      .withMessage('Invalid board ID'),
  ],
  
  // Card validations
  createCard: [
    check('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3 })
      .withMessage('Title must be at least 3 characters')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    check('columnId')
      .notEmpty()
      .withMessage('Column ID is required')
      .isMongoId()
      .withMessage('Invalid column ID'),
    check('priority')
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high'),
  ],
};

module.exports = {
  validate,
  validations,
};
