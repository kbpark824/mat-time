import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/context';
import apiClient from '../api/client';
import colors from '../constants/colors';
import commonStyles from '../constants/commonStyles';
import ErrorHandler from '../utils/errorHandler';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { checkVerificationStatus } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  const intervalRef = useRef(null);

  // Auto-check verification status every 5 seconds
  useEffect(() => {
    if (autoCheckEnabled && email) {
      // Check immediately
      handleCheckVerification(true);
      
      // Set up interval for auto-checking
      intervalRef.current = setInterval(() => {
        handleCheckVerification(true);
      }, 5000);
      
      // Clear interval after 5 minutes
      setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          setAutoCheckEnabled(false);
        }
      }, 300000); // 5 minutes
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [email, autoCheckEnabled]);

  const handleBackToLogin = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    router.replace('login');
  };

  const handleCheckVerification = async (isAutoCheck = false) => {
    if (!email || (isCheckingStatus && !isAutoCheck)) return;
    
    setIsCheckingStatus(true);
    
    try {
      const result = await checkVerificationStatus(email);
      
      if (result.isVerified) {
        // Clear auto-check interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setAutoCheckEnabled(false);
        
        // Redirect to app
        router.replace('/(tabs)');
      } else if (!isAutoCheck) {
        // Only show error for manual checks, not auto-checks
        ErrorHandler.showError('Not Verified Yet', 'Your email has not been verified yet. Please check your email and click the verification link, then try again.');
      }
    } catch (error) {
      ErrorHandler.showError('Check Failed', error, {
        fallbackMessage: 'Unable to check verification status. Please try again.'
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

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
        Click the link in the email to verify your account. We'll automatically check your verification status.
      </Text>

      {autoCheckEnabled && (
        <View style={styles.autoCheckContainer}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.autoCheckText}>Auto-checking verification status...</Text>
        </View>
      )}

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[commonStyles.primaryButton, isCheckingStatus && { opacity: 0.6 }]} 
          onPress={handleCheckVerification}
          disabled={isCheckingStatus}
        >
          <View style={styles.buttonContent}>
            {isCheckingStatus && (
              <ActivityIndicator 
                size="small" 
                color={colors.white} 
                style={styles.loadingSpinner} 
              />
            )}
            <Text style={commonStyles.primaryButtonText}>
              {isCheckingStatus ? 'Checking...' : 'Check Verification Status'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.buttonSpacer} />

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
          style={styles.backButton} 
          onPress={handleBackToLogin}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
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
  buttonSpacer: {
    height: 15,
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
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  infoContainer: {
    alignItems: 'center',
  },
  expirationText: {
    marginTop: 10,
    fontSize: 12,
  },
  autoCheckContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 6,
  },
  autoCheckText: {
    fontSize: 14,
    color: colors.mutedAccent,
    marginLeft: 8,
  },
});