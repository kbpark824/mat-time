import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useAuth } from '../auth/context';
import colors from '../constants/colors';
import Purchases from 'react-native-purchases';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();

  const handleRegister = async () => {
    if (password.length < 6) {
        Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
        return;
    }
    try {
      const revenueCatId = await Purchases.getAppUserID();
      await register(email.toLowerCase(), password, revenueCatId);
    } catch (error) {
        const message = error.response?.data?.msg || 'An unexpected error occurred.';
        Alert.alert('Registration Failed', message);
        console.log(JSON.stringify(error.response, null, 2));
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
});