import React, { createContext, useState, useContext } from 'react';
import apiClient from '../api/client';
import authStorage from './storage';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken } = response.data;
      const decodedToken = jwtDecode(accessToken);
      setUser(decodedToken.user);
      // Store both tokens for persistent login
      await authStorage.storeTokens(accessToken, refreshToken);
    } catch (error) {
      // Only log error details in development, not production
      if (__DEV__) {
        console.error("Login failed", error.response?.data);
      } else {
        console.error("Login failed");
      }
      throw error;
    }
  };

  const register = async (email, password, revenueCatId) => {
    try {
      const response = await apiClient.post('/auth/register', { email, password, revenueCatId });
      // Registration now returns user data but no token (user must verify email first)
      return {
        user: response.data.data.user,
        message: response.data.message
      };
    } catch (error) {
        // Only log error details in development, not production
        if (__DEV__) {
            console.error("Registration failed", error.response?.data);
        } else {
            console.error("Registration failed");
        }
        throw error;
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await apiClient.get(`/auth/verify-email/${token}`);
      const { token: jwtToken } = response.data;
      const decodedToken = jwtDecode(jwtToken);
      setUser(decodedToken.user);
      await authStorage.storeToken(jwtToken);
      return response.data;
    } catch (error) {
      if (__DEV__) {
        console.error("Email verification failed", error.response?.data);
      } else {
        console.error("Email verification failed");
      }
      throw error;
    }
  };

  const checkVerificationStatus = async (email) => {
    try {
      const response = await apiClient.post('/auth/check-verification-status', { email });
      if (response.data.isVerified && response.data.accessToken) {
        const decodedToken = jwtDecode(response.data.accessToken);
        setUser(decodedToken.user);
        await authStorage.storeTokens(response.data.accessToken, response.data.refreshToken);
      } else if (response.data.isVerified && response.data.token) {
        // Backward compatibility with old token format
        const decodedToken = jwtDecode(response.data.token);
        setUser(decodedToken.user);
        await authStorage.storeToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      if (__DEV__) {
        console.error("Verification status check failed", error.response?.data);
      } else {
        console.error("Verification status check failed");
      }
      throw error;
    }
  };

  // Method for auto-login with user data and tokens (used in deep linking)
  const loginWithTokens = async (userData, accessToken, refreshToken) => {
    try {
      setUser(userData);
      await authStorage.storeTokens(accessToken, refreshToken);
    } catch (error) {
      console.error('Error during auto-login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { refreshToken } = await authStorage.getTokens();
      if (refreshToken) {
        // Call server logout to revoke refresh token
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.log('Error during server logout:', error);
    }
    
    setUser(null);
    await authStorage.removeTokens();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, loginWithTokens, register, logout, verifyEmail, checkVerificationStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);