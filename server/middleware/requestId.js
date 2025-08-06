const crypto = require('crypto');

// Middleware to add unique request ID for log correlation
const requestIdMiddleware = (req, res, next) => {
  // Generate unique request ID
  req.requestId = crypto.randomUUID();
  
  // Add request ID to response headers for debugging
  res.set('X-Request-ID', req.requestId);
  
  next();
};

module.exports = requestIdMiddleware;