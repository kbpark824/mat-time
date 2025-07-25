import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';
import colors from '../constants/colors';
import commonStyles from '../constants/commonStyles';
import ErrorHandler from '../utils/errorHandler';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendEmail = async () => {
    if (isResending) return;
    
    setIsResending(true);
    setResendSuccess(false);
    
    try {
      await apiClient.post('/auth/resend-verification', { email });
      setResendSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
      
    } catch (error) {
      ErrorHandler.showError('Resend Failed', error, {
        fallbackMessage: 'Failed to resend verification email. Please try again.'
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/login');
  };

  return (
    <View style={commonStyles.paddedContainer}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name="mail-outline" 
          size={80} 
          color={colors.accent} 
        />
      </View>

      <Text style={commonStyles.title}>Check Your Email</Text>
      
      <Text style={[commonStyles.bodyText, styles.instructionText]}>
        We've sent a verification link to:
      </Text>
      
      <Text style={styles.emailText}>{email}</Text>
      
      <Text style={[commonStyles.bodyText, styles.instructionText]}>
        Click the link in the email to verify your account and start using Mat Time.
      </Text>

      <View style={styles.actionContainer}>
        {resendSuccess ? (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
            <Text style={styles.successText}>Verification email sent!</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[commonStyles.secondaryButton, isResending && { opacity: 0.6 }]} 
            onPress={handleResendEmail}
            disabled={isResending}
          >
            <View style={styles.buttonContent}>
              {isResending && (
                <ActivityIndicator 
                  size="small" 
                  color={colors.primaryText} 
                  style={styles.loadingSpinner} 
                />
              )}
              <Text style={commonStyles.secondaryButtonText}>
                {isResending ? 'Sending...' : 'Resend Email'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[commonStyles.primaryButton, styles.backButton]} 
          onPress={handleBackToLogin}
        >
          <Text style={commonStyles.primaryButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={commonStyles.mutedText}>
          Didn't receive the email? Check your spam folder or try resending.
        </Text>
        <Text style={[commonStyles.mutedText, styles.expirationText]}>
          The verification link will expire in 24 hours.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  instructionText: {
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  actionContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginRight: 8,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 8,
    marginBottom: 15,
  },
  successText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '500',
    marginLeft: 8,
  },
  backButton: {
    marginTop: 15,
  },
  infoContainer: {
    alignItems: 'center',
  },
  expirationText: {
    marginTop: 10,
    fontSize: 12,
  },
});