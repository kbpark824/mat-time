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

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const requestIdMiddleware = require('./middleware/requestId');
const constants = require('./config/constants');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'REVENUECAT_WEBHOOK_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Validate JWT secret strength
if (process.env.JWT_SECRET.length < constants.SECURITY.MIN_JWT_SECRET_LENGTH) {
  console.error(`JWT_SECRET must be at least ${constants.SECURITY.MIN_JWT_SECRET_LENGTH} characters long for security`);
  process.exit(1);
}

// Connect to database
connectDB();

const app = express();

// Security headers middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for mobile app compatibility
  hsts: {
    maxAge: constants.SECURITY.HSTS_MAX_AGE,
    includeSubDomains: true,
    preload: true
  }
}));

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://mat-time-production.up.railway.app'] // Your Railway domain
    : [
        'http://localhost:19006', 
        'http://localhost:8081',
        // Allow any local network IP for development
        /^http:\/\/192\.168\.\d+\.\d+:(19006|8081)$/,
        /^http:\/\/10\.\d+\.\d+\.\d+:(19006|8081)$/,
        /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:(19006|8081)$/
      ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: constants.SECURITY.BODY_SIZE_LIMIT })); // Body parser for JSON with size limit
app.use(express.urlencoded({ extended: true, parameterLimit: constants.VALIDATION.MAX_URL_PARAMETERS })); // Limit URL parameters to prevent HPP

// Request ID and logging middleware
app.use(requestIdMiddleware);
app.use(requestLogger);

// Rate limiting middleware
const generalLimiter = rateLimit({
  windowMs: constants.RATE_LIMITING.WINDOW_MS,
  max: constants.RATE_LIMITING.GENERAL_MAX_REQUESTS,
  message: {
    error: constants.ERROR_MESSAGES.RATE_LIMIT_GENERAL
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const authLimiter = rateLimit({
  windowMs: constants.RATE_LIMITING.WINDOW_MS,
  max: constants.RATE_LIMITING.AUTH_MAX_ATTEMPTS,
  message: {
    error: constants.ERROR_MESSAGES.RATE_LIMIT_AUTH
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// Serve static files for email verification pages
app.use(express.static(path.join(__dirname, 'public')));

// Define Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/seminars', require('./routes/seminars'));
app.use('/api/competitions', require('./routes/competitions'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/revenuecat', require('./routes/revenuecat'));

// Error handling middleware (must be last)
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || constants.SERVER.DEFAULT_PORT;

app.listen(PORT, () => {
  logger.info(`🚀 Server started on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Database: ${process.env.MONGO_URI ? 'Connected' : 'Not configured'}`);
});