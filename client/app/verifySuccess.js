import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/context';
import colors from '../constants/colors';
import commonStyles from '../constants/commonStyles';
import ErrorHandler from '../utils/errorHandler';

export default function VerifySuccessScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        ErrorHandler.showError('Verification Error', 'No verification token provided');
        router.replace('/login');
        return;
      }

      try {
        const result = await verifyEmail(token);
        
        // Show success message briefly, then redirect to app
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 2000);
        
      } catch (error) {
        ErrorHandler.showError('Verification Failed', error, {
          fallbackMessage: 'Email verification failed. The link may be expired or invalid.'
        });
        
        // Redirect to login after error
        setTimeout(() => {
          router.replace('/login');
        }, 3000);
      }
    };

    handleVerification();
  }, [token]);

  return (
    <View style={commonStyles.centeredContent}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name="checkmark-circle" 
          size={100} 
          color={colors.accent} 
        />
      </View>

      <Text style={[commonStyles.title, styles.successTitle]}>
        Email Verified!
      </Text>
      
      <Text style={[commonStyles.bodyText, styles.successText]}>
        Welcome to Mat Time! Your account is now active.
      </Text>
      
      <Text style={[commonStyles.mutedText, styles.redirectText]}>
        Redirecting you to the app...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successTitle: {
    color: colors.accent,
    marginBottom: 15,
  },
  successText: {
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  redirectText: {
    textAlign: 'center',
    fontSize: 14,
  },
});