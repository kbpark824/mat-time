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

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '../constants/colors';
import commonStyles from '../constants/commonStyles';
import ErrorHandler from '../utils/errorHandler';
import api from '../api/client';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { 
        email: email.toLowerCase().trim() 
      });
      
      setIsEmailSent(true);
    } catch (error) {
      ErrorHandler.authentication(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={commonStyles.paddedContainer}>
          <View style={styles.successContainer}>
            <Text style={styles.checkmark}>✉️</Text>
            <Text style={commonStyles.title}>Check Your Email</Text>
            <Text style={styles.successText}>
              If an account with that email exists, we've sent you a password reset link.
            </Text>
            <Text style={styles.instructionText}>
              Check your email and click the link to reset your password. The link will expire in 1 hour.
            </Text>
            
            <TouchableOpacity 
              style={styles.resendButton} 
              onPress={() => setIsEmailSent(false)}
            >
              <Text style={styles.resendButtonText}>Send Another Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={commonStyles.primaryButton} 
              onPress={() => router.push('/login')}
            >
              <Text style={commonStyles.primaryButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={commonStyles.paddedContainer}>
          <Text style={commonStyles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>
          
          <Text style={commonStyles.label}>Email Address</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="e.g., your.name@email.com"
            placeholderTextColor={colors.mutedAccent}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
          
          <TouchableOpacity 
            style={[commonStyles.primaryButton, isLoading && styles.disabledButton]} 
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={commonStyles.primaryButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
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
  subtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  checkmark: {
    fontSize: 60,
    marginBottom: 20,
  },
  successText: {
    fontSize: 16,
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  instructionText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  resendButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
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