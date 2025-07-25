import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { AuthProvider, useAuth } from '../auth/context';
import authStorage from '../auth/storage';
import { useEffect, useState } from 'react';
import { SplashScreen } from 'expo-router';
import Purchases from 'react-native-purchases';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { jwtDecode } from 'jwt-decode';
import Constants from 'expo-constants';
import colors from '../constants/colors';
import ErrorBoundary from '../components/ErrorBoundary';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const revenueCatKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || Constants.expoConfig?.extra?.revenueCatAppleKey || 'appl_FrctCCLTynKgxasefzLYLewAUpz',
  google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || Constants.expoConfig?.extra?.revenueCatGoogleKey || 'goog_PxjVqJelFyQQBVPtpRKVzdNDdwE',
};

function Layout() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: revenueCatKeys.google });
      } else {
        await Purchases.configure({ apiKey: revenueCatKeys.apple });
      }

      const restoreToken = async () => {
        try {
          const token = await authStorage.getToken();
          if (token) {
            const decodedToken = jwtDecode(token);
            
            // Check if token is expired
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp && decodedToken.exp < currentTime) {
              // Token is expired, remove it
              await authStorage.removeToken();
            } else {
              setUser(decodedToken.user);
            }
          }
        } catch (error) {
          // Invalid token, remove it
          await authStorage.removeToken();
        } finally {
          setIsReady(true);
          // Hide the splash screen after we're done
          SplashScreen.hideAsync();
        }
      };

      restoreToken();
    }
    init();
  }, []);

  useEffect(() => {
    if (!navigationState?.key || !isReady) {
      return;
    }

    if (!user) {
      router.replace('/login');
    } else {
      router.replace('/(tabs)');
    }
  }, [user, navigationState?.key, isReady]);

  if (!isReady) {
    return null; // Return null while the splash screen is visible
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="login" 
        options={{
          headerShown: true,
          title: 'Login',
          headerStyle: {
            backgroundColor: colors.accent,
          },
          headerTintColor: colors.white,
          headerTitleAlign: 'left',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 28,
          },
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.white, fontSize: 28, fontWeight: 'bold' }}>Login</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{
          headerShown: true,
          title: 'Register',
          headerStyle: {
            backgroundColor: colors.accent,
          },
          headerTintColor: colors.white,
          headerTitleAlign: 'left',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 28,
          },
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.white, fontSize: 28, fontWeight: 'bold' }}>Register</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen 
        name="verifyEmail" 
        options={{
          headerShown: true,
          title: 'Verify Email',
          headerStyle: {
            backgroundColor: colors.accent,
          },
          headerTintColor: colors.white,
          headerTitleAlign: 'left',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 28,
          },
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.white, fontSize: 28, fontWeight: 'bold' }}>Verify Email</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen 
        name="verifySuccess" 
        options={{
          headerShown: true,
          title: 'Email Verified',
          headerStyle: {
            backgroundColor: colors.accent,
          },
          headerTintColor: colors.white,
          headerTitleAlign: 'left',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 28,
          },
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.white, fontSize: 28, fontWeight: 'bold' }}>Email Verified</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="logSession"
        options={({ navigation, route }) => ({
          headerShown: true,
          title: 'Log a Session',
          presentation: 'modal',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ color: colors.destructive, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => {
                // This will be handled by the screen component
                const screenRef = route.params?.screenRef;
                if (screenRef?.current?.handleSave) {
                  screenRef.current.handleSave();
                }
              }}
            >
              <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="logSeminar"
        options={({ navigation, route }) => ({
          headerShown: true,
          title: 'Log a Seminar',
          presentation: 'modal',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ color: colors.destructive, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => {
                const screenRef = route.params?.screenRef;
                if (screenRef?.current?.handleSave) {
                  screenRef.current.handleSave();
                }
              }}
            >
              <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="logCompetition"
        options={({ navigation, route }) => ({
          headerShown: true,
          title: 'Log a Competition',
          presentation: 'modal',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ color: colors.destructive, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => {
                const screenRef = route.params?.screenRef;
                if (screenRef?.current?.handleSave) {
                  screenRef.current.handleSave();
                }
              }}
            >
              <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
          ),
        })}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary fallbackMessage="The app encountered an error during startup. Please restart the app.">
      <AuthProvider>
        <ErrorBoundary fallbackMessage="Authentication system encountered an error.">
          <Layout />
        </ErrorBoundary>
      </AuthProvider>
    </ErrorBoundary>
  );
}