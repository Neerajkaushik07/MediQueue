import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';

/**
 * Global error handling middleware
 * Catches all errors and returns consistent error responses
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Default to 500 Internal Server Error if not set
  if (!statusCode) {
    statusCode = 500;
  }

  // Log error details
  if (process.env.NODE_ENV === 'development') {
    logger.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(', ');
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Handle 404 - Route not found
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};

export { errorHandler, notFound };
