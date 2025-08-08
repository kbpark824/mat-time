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
import { View, TextInput, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, Linking } from 'react-native';
import { useAuth } from '../auth/context';
import { useRouter } from 'expo-router';
import colors from '../constants/colors';
import commonStyles from '../constants/commonStyles';
import ErrorHandler from '../utils/errorHandler';
import Purchases from 'react-native-purchases';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[@$!%*?&#+\-_=<>.,;:()\[\]{}|~^])/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null; // Password is valid
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailTouched) {
      const error = validateEmail(text);
      setEmailError(error || '');
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordTouched) {
      const error = validatePassword(text);
      setPasswordError(error || '');
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    const error = validateEmail(email);
    setEmailError(error || '');
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);  
    const error = validatePassword(password);
    setPasswordError(error || '');
  };

  const handleRegister = async () => {
    const passwordError = validatePassword(password);
    if (passwordError) {
      ErrorHandler.validation(passwordError);
      return;
    }
    if (!acceptedTerms) {
      ErrorHandler.validation('Please accept the Terms of Use and Privacy Policy to continue.');
      return;
    }
    try {
      const revenueCatId = __DEV__ 
        ? `preview-user-${Date.now()}-${Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
        : await Purchases.getAppUserID();
      
      await register(email.toLowerCase(), password, revenueCatId);
      
      // Registration successful - redirect to email verification screen
      router.replace({
        pathname: '/verifyEmail',
        params: { email: email.toLowerCase() }
      });
      
    } catch (error) {
      ErrorHandler.showError('Registration Failed', error, {
        fallbackMessage: 'An unexpected error occurred during registration. Please try again.'
      });
        // Error logged for debugging - remove in production
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={commonStyles.paddedContainer}>
          <Text style={commonStyles.title}>Create Account</Text>
          <Text style={commonStyles.label}>Email Address</Text>
          <TextInput
            style={[commonStyles.input, emailError && emailTouched && commonStyles.inputError]}
            placeholder="e.g., your.name@email.com"
            placeholderTextColor={colors.mutedAccent}
            value={email}
            onChangeText={handleEmailChange}
            onBlur={handleEmailBlur}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {emailError && emailTouched ? <Text style={commonStyles.errorText}>{emailError}</Text> : null}
          
          <Text style={commonStyles.label}>Password</Text>
          <TextInput
            style={[commonStyles.input, passwordError && passwordTouched && commonStyles.inputError]}
            placeholder="8+ chars, uppercase, lowercase, number, special char"
            placeholderTextColor={colors.mutedAccent}
            value={password}
            onChangeText={handlePasswordChange}
            onBlur={handlePasswordBlur}
            secureTextEntry
          />
          {passwordError && passwordTouched ? <Text style={commonStyles.errorText}>{passwordError}</Text> : null}
          
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>I agree to the </Text>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
                  <Text style={styles.linkText}>Terms of Use</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}> and </Text>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.termsfeed.com/live/ff739534-7f59-4d57-84d3-6acf05dc0024')}>
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={commonStyles.primaryButton} onPress={handleRegister}>
            <Text style={commonStyles.primaryButtonText}>Register</Text>
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
  termsContainer: {
    marginVertical: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    backgroundColor: colors.white,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  checkboxChecked: {
    backgroundColor: colors.primaryText,
    borderColor: colors.primaryText,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  termsText: {
    fontSize: 14,
    color: colors.primaryText,
    lineHeight: 20,
  },
  linkText: {
    fontSize: 14,
    color: colors.primaryText,
    textDecorationLine: 'underline',
    fontWeight: '500',
    lineHeight: 20,
  },
});