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