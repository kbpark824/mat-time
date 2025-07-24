import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../auth/context';
import { useRouter } from 'expo-router';
import colors from '../constants/colors';
import commonStyles from '../constants/commonStyles';
import ErrorHandler from '../utils/errorHandler';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(email.toLowerCase(), password);
    } catch (error) {
      ErrorHandler.authentication(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={commonStyles.paddedContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={commonStyles.title}>Welcome Back!</Text>
          <Text style={commonStyles.label}>Email Address</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="e.g., your.name@email.com"
            placeholderTextColor={colors.mutedAccent}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={commonStyles.label}>Password</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.mutedAccent}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={commonStyles.primaryButton} onPress={handleLogin}>
            <Text style={commonStyles.primaryButtonText}>Login</Text>
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
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 30,
    borderRadius: 16,
  },
  spacer: { height: 20 },
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