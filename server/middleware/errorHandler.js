const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  // Sanitize sensitive data in logs
  const sanitizedPath = req.path.replace(/\/[a-f\d]{24}/gi, '/:id'); // Hide ObjectIds
  const sanitizedIp = req.ip.length > 7 ? req.ip.substring(0, 7) + '***' : req.ip;
  const requestId = req.requestId || 'unknown';
  
  // Log error with winston including request ID for correlation
  logger.error(`[${requestId}] ${err.message} - ${req.method} ${sanitizedPath} - IP: ${sanitizedIp}`);
  
  if (process.env.NODE_ENV !== 'production') {
    logger.debug(`Stack trace: ${err.stack}`);
  }

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;