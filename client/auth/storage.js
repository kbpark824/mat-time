import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const LEGACY_KEY = 'authToken'; // For backward compatibility

const storeTokens = async (accessToken, refreshToken) => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    // Remove legacy token if it exists
    await SecureStore.deleteItemAsync(LEGACY_KEY);
  } catch (error) {
    if (__DEV__) {
      console.log('Error storing tokens', error);
    }
  }
};

const getTokens = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    
    // Check for legacy token if new tokens don't exist
    if (!accessToken && !refreshToken) {
      const legacyToken = await SecureStore.getItemAsync(LEGACY_KEY);
      if (legacyToken) {
        return { accessToken: legacyToken, refreshToken: null };
      }
    }
    
    return { accessToken, refreshToken };
  } catch (error) {
    if (__DEV__) {
      console.log('Error getting tokens', error);
    }
    return { accessToken: null, refreshToken: null };
  }
};

const removeTokens = async () => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(LEGACY_KEY); // Remove legacy token too
  } catch (error) {
    if (__DEV__) {
      console.log('Error removing tokens', error);
    }
  }
};

// Legacy methods for backward compatibility
const storeToken = async (authToken) => {
  try {
    await SecureStore.setItemAsync(LEGACY_KEY, authToken);
  } catch (error) {
    if (__DEV__) {
      console.log('Error storing the auth token', error);
    }
  }
};

const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(LEGACY_KEY);
  } catch (error) {
    if (__DEV__) {
      console.log('Error getting the auth token', error);
    }
  }
};

const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(LEGACY_KEY);
  } catch (error) {
    if (__DEV__) {
      console.log('Error removing the auth token', error);
    }
  }
};

export default { 
  getTokens, 
  removeTokens, 
  storeTokens,
  // Legacy methods for backward compatibility
  getToken, 
  removeToken, 
  storeToken 
};