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

import Constants from 'expo-constants';

// Get local IP dynamically for development
const getLocalIP = () => {
  // For Expo development, use the debuggerHost which contains your local IP
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
  return debuggerHost || 'localhost';
};

// API endpoint configuration
const API_ENDPOINTS = {
  local: `http://${getLocalIP()}:5001/api`,
  production: 'https://mat-time-production.up.railway.app/api',
  // staging: 'https://mat-time-staging.up.railway.app/api', // Future use
};

/**
 * Get the appropriate API URL based on environment configuration
 * Priority order:
 * 1. Explicit apiEnvironment setting in app.json extra config
 * 2. Default: 'local' for development builds, 'production' for release builds
 * 3. Fallback: production endpoint
 */
const getApiUrl = () => {
  const config = Constants.expoConfig?.extra;
  
  // Check for explicit environment override
  const environment = config?.apiEnvironment || (__DEV__ ? 'local' : 'production');
  
  // Return the configured endpoint, fallback to production
  return API_ENDPOINTS[environment] || API_ENDPOINTS.production;
};

export default getApiUrl;