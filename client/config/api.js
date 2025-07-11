import Constants from 'expo-constants';

// API endpoint configuration
const API_ENDPOINTS = {
  local: 'http://localhost:5001/api',
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