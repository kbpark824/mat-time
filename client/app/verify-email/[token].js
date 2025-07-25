import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../auth/context';
import apiClient from '../../api/client';
import colors from '../../constants/colors';
import commonStyles from '../../constants/commonStyles';
import ErrorHandler from '../../utils/errorHandler';

export default function VerifyEmailDeepLink() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    verifyEmailToken();
  }, [token]);

  const verifyEmailToken = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    try {
      setStatus('verifying');
      setMessage('Verifying your email...');
      
      // Call the server to verify the token
      const response = await apiClient.get(`/auth/verify-email/${token}`);
      
      if (response.data.success) {
        setStatus('success');
        setMessage('Email verified successfully!');
        
        // If user data is returned, log them in automatically
        if (response.data.user && response.data.token) {
          await login(response.data.user, response.data.token);
          
          // Redirect to main app after a brief success message
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 2000);
        } else {
          // If no auto-login data, redirect to login screen
          setTimeout(() => {
            router.replace('/login');
          }, 2000);
        }
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      
      if (error.response?.status === 400) {
        setMessage('Invalid or expired verification link');
      } else if (error.response?.status === 410) {
        setMessage('This verification link has expired');
      } else {
        setMessage('Failed to verify email. Please try again.');
      }
      
      // Redirect to verification screen after error
      setTimeout(() => {
        router.replace('/verifyEmail');
      }, 3000);
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'verifying':
        return <ActivityIndicator size="large" color={colors.accent} />;
      case 'success':
        return <Ionicons name="checkmark-circle" size={80} color={colors.accent} />;
      case 'error':
        return <Ionicons name="close-circle" size={80} color={colors.destructive} />;
      default:
        return <ActivityIndicator size="large" color={colors.accent} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return colors.accent;
      case 'error':
        return colors.destructive;
      default:
        return colors.primaryText;
    }
  };

  return (
    <View style={commonStyles.paddedContainer}>
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>

      <Text style={commonStyles.title}>Email Verification</Text>
      
      <Text style={[commonStyles.bodyText, styles.messageText, { color: getStatusColor() }]}>
        {message}
      </Text>

      {status === 'success' && (
        <Text style={[commonStyles.mutedText, styles.redirectText]}>
          Redirecting you to the app...
        </Text>
      )}

      {status === 'error' && (
        <Text style={[commonStyles.mutedText, styles.redirectText]}>
          You'll be redirected to try again...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 60,
  },
  messageText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 18,
    fontWeight: '500',
  },
  redirectText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});