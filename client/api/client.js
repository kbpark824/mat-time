import axios from 'axios';
import authStorage from '../auth/storage';
import getApiUrl from '../config/api';

const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000, // 30 seconds timeout
  maxContentLength: 10 * 1024 * 1024, // 10MB max response size
  maxBodyLength: 10 * 1024 * 1024, // 10MB max request size
});

// Intercept requests to add the auth token to the header
apiClient.interceptors.request.use(async (config) => {
  const token = await authStorage.getToken();
  if (token) {
    // Check token expiration before each request
    try {
      const { jwtDecode } = await import('jwt-decode');
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        // Token is expired, remove it
        await authStorage.removeToken();
        // Don't add expired token to headers
      } else {
        config.headers['x-auth-token'] = token;
      }
    } catch (error) {
      // If token decode fails, remove invalid token
      await authStorage.removeToken();
    }
  }
  return config;
});

// Add response interceptor to handle 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token might be expired or invalid, remove it
      await authStorage.removeToken();
    }
    return Promise.reject(error);
  }
);

export default apiClient;