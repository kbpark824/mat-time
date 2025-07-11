import axios from 'axios';
import authStorage from '../auth/storage';
import getApiUrl from '../config/api';

const apiClient = axios.create({
  baseURL: getApiUrl(),
});

// Intercept requests to add the auth token to the header
apiClient.interceptors.request.use(async (config) => {
  const token = await authStorage.getToken();
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default apiClient;