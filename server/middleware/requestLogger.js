/*
 * Mat Time - Martial Arts Training Session Tracking Application
 * Copyright (C) 2025 Kibum Park
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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