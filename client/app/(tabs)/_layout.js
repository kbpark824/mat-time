import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Alert, View, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../auth/context';
import colors from '../../constants/colors';
import AddActionBottomSheet from '../../components/AddActionBottomSheet';
import Paywall from '../../components/Paywall';

export default function TabLayout() {
  const router = useRouter();
  const { user } = useAuth();
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const isPro = user?.isPro || false;

  const showAddMenu = () => {
    // Haptic feedback for better UX
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowBottomSheet(true);
  };

  const handleBottomSheetClose = () => {
    setShowBottomSheet(false);
  };

  const handleOptionSelect = (option) => {
    switch (option) {
      case 'session':
        // Navigate to existing session logging modal
        router.push('/logSession');
        break;
      case 'seminar':
        if (isPro) {
          // Navigate to seminar logging page for pro users
          router.push('/logSeminar');
        } else {
          // Show subscription prompt for non-pro users
          setShowPaywall(true);
        }
        break;
      case 'competition':
        // Placeholder for competition logging (future feature)
        Alert.alert(
          'Coming Soon', 
          'Competition logging will be available in a future update!',
          [{ text: 'OK' }]
        );
        break;
      default:
        break;
    }
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
  };

  const handlePurchaseCompleted = () => {
    setShowPaywall(false);
    // User can now access pro features
  };

  return (
    <>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.mutedAccent,
        tabBarStyle: {
          backgroundColor: colors.primaryBackground,
          borderTopColor: colors.mutedAccent,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: colors.primaryBackground,
        },
        headerTintColor: colors.primaryText,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              width: size + 2,
              height: size + 2,
              backgroundColor: 'transparent',
              borderWidth: 2.5,
              borderColor: focused ? colors.primaryText : colors.mutedAccent,
              borderRadius: 6,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons 
                name="add" 
                size={size - 3} 
                color={focused ? colors.primaryText : colors.mutedAccent} 
              />
            </View>
          ),
          tabBarLabel: () => null, // Hide the label
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default navigation
            e.preventDefault();
            // Show bottom sheet instead
            showAddMenu();
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    
    {/* Bottom Sheet */}
    <AddActionBottomSheet
      visible={showBottomSheet}
      onClose={handleBottomSheetClose}
      onSelectOption={handleOptionSelect}
      isPro={isPro}
    />

    {/* Paywall Modal */}
    <Modal
      visible={showPaywall}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <Paywall
        onPurchaseCompleted={handlePurchaseCompleted}
        onClose={handlePaywallClose}
      />
    </Modal>
  </>
  );
}