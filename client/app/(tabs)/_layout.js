/*
 * Mat Time - Martial Arts Training Session Tracking Application
 * Copyright (C) 2025 Kibum Park
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Modal, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../auth/context';
import colors from '../../constants/colors';
import AddActionBottomSheet from '../../components/AddActionBottomSheet';
import ProFeaturePreviewModal from '../../components/ProFeaturePreviewModal';
import Paywall from '../../components/Paywall';

export default function TabLayout() {
  const router = useRouter();
  const { user } = useAuth();
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showProPreview, setShowProPreview] = useState(false);
  const [previewFeatureType, setPreviewFeatureType] = useState(null);
  
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
    setShowBottomSheet(false); // Close bottom sheet first
    
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
          // Show pro feature preview for non-pro users
          setPreviewFeatureType('seminar');
          setShowProPreview(true);
        }
        break;
      case 'competition':
        if (isPro) {
          // Navigate to competition logging page for pro users
          router.push('/logCompetition');
        } else {
          // Show pro feature preview for non-pro users
          setPreviewFeatureType('competition');
          setShowProPreview(true);
        }
        break;
      default:
        break;
    }
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
  };

  const handleProPreviewClose = () => {
    setShowProPreview(false);
    setPreviewFeatureType(null);
  };

  const handleProPreviewUpgrade = () => {
    setShowProPreview(false);
    setShowPaywall(true);
  };

  const handlePurchaseCompleted = () => {
    setShowPaywall(false);
    // User can now access pro features
  };

  return (
    <>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.mutedAccent,
        tabBarStyle: {
          backgroundColor: colors.primaryBackground,
          borderTopColor: colors.mutedAccent,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: colors.accent,
        },
        headerTintColor: colors.white,
        headerTitleAlign: 'left',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 28,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="home" size={24} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.white, fontSize: 28, fontWeight: 'bold' }}>Home</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="search" size={24} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.white, fontSize: 28, fontWeight: 'bold' }}>Search</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              width: size + 24,
              height: size + 24,
              backgroundColor: colors.accent,
              borderRadius: (size + 24) / 2,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -12,
              shadowColor: colors.shadow.color,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Ionicons 
                name="add" 
                size={size + 4} 
                color={colors.white}
              />
            </View>
          ),
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
        name="stats"
        options={{
          title: 'Stats',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="stats-chart" size={24} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.white, fontSize: 28, fontWeight: 'bold' }}>Stats</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="person" size={24} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.white, fontSize: 28, fontWeight: 'bold' }}>Profile</Text>
            </View>
          ),
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

    {/* Pro Feature Preview Modal */}
    <ProFeaturePreviewModal
      visible={showProPreview}
      featureType={previewFeatureType}
      onClose={handleProPreviewClose}
      onUpgrade={handleProPreviewUpgrade}
    >
      {/* We'll add actual preview content later */}
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: colors.primaryText }}>
          {previewFeatureType === 'seminar' ? 'Seminar logging form preview' : 'Competition logging form preview'}
        </Text>
      </View>
    </ProFeaturePreviewModal>

    {/* Paywall Modal */}
    <Modal
      visible={showPaywall}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handlePaywallClose}
    >
      <Paywall
        onPurchaseCompleted={handlePurchaseCompleted}
        onClose={handlePaywallClose}
      />
    </Modal>
  </>
  );
}