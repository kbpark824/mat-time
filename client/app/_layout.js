import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { AuthProvider, useAuth } from '../auth/context';
import authStorage from '../auth/storage';
import { useEffect, useState } from 'react';
import { SplashScreen } from 'expo-router';
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import { jwtDecode } from 'jwt-decode';
import Constants from 'expo-constants';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const revenueCatKeys = {
  apple: Constants.expoConfig?.extra?.revenueCatAppleKey,
  google: Constants.expoConfig?.extra?.revenueCatGoogleKey,
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
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="logSession"
        options={{ headerShown: true, title: 'Log a Session', presentation: 'modal' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}