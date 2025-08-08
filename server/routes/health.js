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
const mongoose = require('mongoose');
const router = express.Router();

// @route   GET /api/health
// @desc    Basic health check
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// @route   GET /api/health/detailed
// @desc    Detailed health check with database connectivity
// @access  Public
router.get('/detailed', async (req, res) => {
  const healthCheck = {
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: {
        status: 'unknown',
        responseTime: null
      },
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        total: process.memoryUsage().heapTotal / 1024 / 1024 // MB
      }
    }
  };

  // Check database connection
  try {
    const startTime = Date.now();
    
    // Simple ping to database
    await mongoose.connection.db.admin().ping();
    
    const responseTime = Date.now() - startTime;
    
    healthCheck.services.database.status = 'healthy';
    healthCheck.services.database.responseTime = `${responseTime}ms`;
  } catch (error) {
    healthCheck.success = false;
    healthCheck.services.database.status = 'unhealthy';
    // Don't expose database error details in production
    if (process.env.NODE_ENV !== 'production') {
      healthCheck.services.database.error = error.message;
    }
  }

  const statusCode = healthCheck.success ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// @route   GET /api/health/ready
// @desc    Readiness probe - checks if app is ready to serve traffic
// @access  Public
router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    // Check if required environment variables are set
    const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      return res.status(503).json({
        success: false,
        message: 'Missing required environment variables',
        missing: missingEnvVars
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application is ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Application is not ready',
      // Don't expose error details in production
      ...(process.env.NODE_ENV !== 'production' && { error: error.message }),
      timestamp: new Date().toISOString()
    });
  }
});

// @route   GET /api/health/live
// @desc    Liveness probe - checks if app is alive
// @access  Public
router.get('/live', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Application is alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;