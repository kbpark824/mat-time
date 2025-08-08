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

// Simple CSRF protection middleware
// Currently disabled for API-only backend, but ready for future web interface
const csrfProtection = (req, res, next) => {
  // Skip CSRF protection for API-only requests and safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  const isApiRequest = req.path.startsWith('/api/');
  
  if (safeMethods.includes(req.method) || isApiRequest) {
    return next();
  }
  
  // For future web forms, validate CSRF token
  const token = req.body._csrf || req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token'
    });
  }
  
  next();
};

// Generate CSRF token for forms (future use)
const generateCSRFToken = (req, res, next) => {
  if (!req.session) {
    return next();
  }
  
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

module.exports = {
  csrfProtection,
  generateCSRFToken
};