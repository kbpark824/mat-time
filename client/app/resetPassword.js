/*
 * Mat Time - Martial Arts Training Session Tracking Application
 * Copyright (C) 2025 Kibum Park
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../auth/context';
import authStorage from '../auth/storage';
import colors from '../constants/colors';
import commonStyles from '../constants/commonStyles';
import ErrorHandler from '../utils/errorHandler';
import api from '../api/client';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      Alert.alert('Error', 'Invalid reset link. Please request a new password reset.');
      router.replace('/forgotPassword');
      return;
    }

    try {
      const response = await api.get(`/auth/validate-reset-token/${token}`);
      setIsValidToken(true);
      setUserEmail(response.data.email);
    } catch (error) {
      Alert.alert(
        'Invalid Link', 
        'This password reset link is invalid or has expired. Please request a new one.',
        [
          {
            text: 'Request New Link',
            onPress: () => router.replace('/forgotPassword')
          }
        ]
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { 
        token,
        password 
      });
      
      // Auto-login the user after successful password reset
      if (response.data.success && response.data.accessToken) {
        // Store tokens for persistent login
        await authStorage.storeTokens(
          response.data.accessToken, 
          response.data.refreshToken
        );
        
        // Set user in context
        setUser(response.data.data.user);
        
        Alert.alert(
          'Success!', 
          'Your password has been reset successfully. You are now logged in.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)')
            }
          ]
        );
      }
    } catch (error) {
      if (error.response?.status === 400) {
        Alert.alert(
          'Invalid Link', 
          'This password reset link is invalid or has expired. Please request a new one.',
          [
            {
              text: 'Request New Link',
              onPress: () => router.replace('/forgotPassword')
            }
          ]
        );
      } else {
        ErrorHandler.authentication(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Validating reset link...</Text>
      </View>
    );
  }

  if (!isValidToken) {
    return null; // Will redirect to forgot password
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={commonStyles.paddedContainer}>
          <Text style={commonStyles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Create a new password for {userEmail}
          </Text>
          
          <Text style={commonStyles.label}>New Password</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter your new password"
            placeholderTextColor={colors.mutedAccent}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
          
          <Text style={commonStyles.label}>Confirm Password</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Confirm your new password"
            placeholderTextColor={colors.mutedAccent}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!isLoading}
          />
          
          <Text style={styles.passwordRequirements}>
            Password must be at least 8 characters long and contain:
            {'\n'}• At least one uppercase letter
            {'\n'}• At least one lowercase letter  
            {'\n'}• At least one number
            {'\n'}• At least one special character
          </Text>
          
          <TouchableOpacity 
            style={[commonStyles.primaryButton, isLoading && styles.disabledButton]} 
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={commonStyles.primaryButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/login')}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.secondaryText,
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  passwordRequirements: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 20,
    lineHeight: 20,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: colors.secondaryText,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
});