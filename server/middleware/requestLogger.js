const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Log the request
    logger.http(
      `${req.method} ${req.path} ${res.statusCode} - ${responseTime}ms - IP: ${req.ip}`
    );
    
    originalEnd.apply(this, args);
  };
  
  next();
};

module.exports = requestLogger;