import axios from 'axios';
import authStorage from '../auth/storage';


const apiClient = axios.create({
  baseURL: 'http://192.168.1.219:5001/api',
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