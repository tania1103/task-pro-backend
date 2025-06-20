/**
 * Error handling middleware
 */

/**
 * Handle 404 Not Found errors
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler
 * Formats error responses consistently
 */
const errorHandler = (err, req, res, next) => {
  // Get status code (default to 500 if not set)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Set status code
  res.status(statusCode);
  
  // Construct error response
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    // Include validation errors if they exist
    errors: err.errors || null,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
