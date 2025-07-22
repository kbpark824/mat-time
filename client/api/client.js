import axios from 'axios';
import authStorage from '../auth/storage';
import getApiUrl from '../config/api';
import { jwtDecode } from 'jwt-decode';

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
    config.headers['x-auth-token'] = token;
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