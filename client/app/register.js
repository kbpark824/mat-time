import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, Linking } from 'react-native';
import { useAuth } from '../auth/context';
import colors from '../constants/colors';
import Purchases from 'react-native-purchases';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (password.length < 6) {
        Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
        return;
    }
    if (!acceptedTerms) {
        Alert.alert('Terms Required', 'Please accept the Terms of Use and Privacy Policy to continue.');
        return;
    }
    try {
      const revenueCatId = await Purchases.getAppUserID();
      await register(email.toLowerCase(), password, revenueCatId);
    } catch (error) {
        const message = error.response?.data?.error || error.response?.data?.msg || 'An unexpected error occurred.';
        Alert.alert('Registration Failed', message);
        // Error logged for debugging - remove in production
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., your.name@email.com"
            placeholderTextColor={colors.mutedAccent}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 6 characters"
            placeholderTextColor={colors.mutedAccent}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
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
          
          <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
            <Text style={styles.primaryButtonText}>Register</Text>
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
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: colors.primaryBackground 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20, 
    color: colors.primaryText 
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: colors.primaryText,
  },
  input: {
    height: 40,
    borderColor: colors.mutedAccent,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: colors.white,
    color: colors.primaryText,
  },
  primaryButton: {
    backgroundColor: colors.primaryText,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
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
    borderWidth: 2,
    borderColor: colors.mutedAccent,
    borderRadius: 3,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
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