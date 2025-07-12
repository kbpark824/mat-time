import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useAuth } from '../auth/context';
import { useRouter } from 'expo-router';
import colors from '../constants/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(email.toLowerCase(), password);
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.msg || 'Please check your email and password.';
      Alert.alert('Login Failed', message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Welcome Back!</Text>
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
            placeholder="Enter your password"
            placeholderTextColor={colors.mutedAccent}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>
          <View style={styles.spacer} />
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/register')}>
            <Text style={styles.secondaryButtonText}>Don't have an account? Register</Text>
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
  spacer: { height: 20 },
  primaryButton: {
    backgroundColor: colors.primaryText,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primaryText,
    fontSize: 16,
  },
});