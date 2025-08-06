const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Log the request with request ID for correlation
    const requestId = req.requestId || 'unknown';
    const sanitizedIp = req.ip.length > 7 ? req.ip.substring(0, 7) + '***' : req.ip;
    
    logger.http(
      `[${requestId}] ${req.method} ${req.path} ${res.statusCode} - ${responseTime}ms - IP: ${sanitizedIp}`
    );
    
    originalEnd.apply(this, args);
  };
  
  next();
};

module.exports = requestLogger;