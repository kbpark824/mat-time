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
      const { token } = response.data;
      const decodedToken = jwtDecode(token);
      setUser(decodedToken.user);
      // Always store token for persistent login
      await authStorage.storeToken(token);
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
      if (response.data.isVerified && response.data.token) {
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

  const logout = async () => {
    setUser(null);
    await authStorage.removeToken();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, verifyEmail, checkVerificationStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);