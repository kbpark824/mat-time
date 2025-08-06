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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  const queue = failedQueue.splice(0); // Clear the array and get all items
  queue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
};

// Helper function to check if token is expired or expiring soon
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    // Consider token expired if it expires within 5 minutes
    return decoded.exp < (currentTime + 300);
  } catch {
    return true;
  }
};

// Intercept requests to add the auth token to the header
apiClient.interceptors.request.use(async (config) => {
  const { accessToken, refreshToken } = await authStorage.getTokens();
  
  // Use legacy token if new tokens don't exist
  if (!accessToken) {
    const legacyToken = await authStorage.getToken();
    if (legacyToken) {
      config.headers['x-auth-token'] = legacyToken;
    }
    return config;
  }
  
  // Check if access token is expired and we have a refresh token
  if (isTokenExpired(accessToken) && refreshToken && !isRefreshing) {
    try {
      isRefreshing = true;
      
      const response = await axios.post(`${getApiUrl()}/auth/refresh`, {
        refreshToken
      });
      
      const newAccessToken = response.data.accessToken;
      await authStorage.storeTokens(newAccessToken, refreshToken);
      
      processQueue(null, newAccessToken);
      config.headers['x-auth-token'] = newAccessToken;
      
    } catch (refreshError) {
      processQueue(refreshError, null);
      await authStorage.removeTokens();
      // Don't throw error here, let the original request fail
    } finally {
      isRefreshing = false;
    }
  } else if (accessToken) {
    config.headers['x-auth-token'] = accessToken;
  }
  
  return config;
});

// Add response interceptor to handle 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request (with size limit)
        if (failedQueue.length >= 50) {
          // Prevent memory exhaustion - reject oldest requests when queue is full
          const oldestRequest = failedQueue.shift();
          oldestRequest.reject(new Error('Request queue full - please try again'));
        }
        
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['x-auth-token'] = token;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      const { refreshToken } = await authStorage.getTokens();
      
      if (refreshToken) {
        try {
          isRefreshing = true;
          
          const response = await axios.post(`${getApiUrl()}/auth/refresh`, {
            refreshToken
          });
          
          const newAccessToken = response.data.accessToken;
          await authStorage.storeTokens(newAccessToken, refreshToken);
          
          processQueue(null, newAccessToken);
          originalRequest.headers['x-auth-token'] = newAccessToken;
          
          return apiClient(originalRequest);
          
        } catch (refreshError) {
          processQueue(refreshError, null);
          await authStorage.removeTokens();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token available, remove any remaining tokens
        await authStorage.removeTokens();
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;