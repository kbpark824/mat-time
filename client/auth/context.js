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
      const { token } = response.data;
      const decodedToken = jwtDecode(token);
      setUser(decodedToken.user);
      await authStorage.storeToken(token);
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

  const logout = async () => {
    setUser(null);
    await authStorage.removeToken();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);