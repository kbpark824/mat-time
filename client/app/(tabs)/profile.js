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

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../auth/context';
import colors from '../../constants/colors';
import Paywall from '../../components/Paywall';
import BeltRankSelector from '../../components/BeltRankSelector';
import apiClient from '../../api/client';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [beltRank, setBeltRank] = useState(null);
  const [loadingBeltRank, setLoadingBeltRank] = useState(true);

  const isPro = user?.isPro || false;

  useEffect(() => {
    fetchBeltRank();
  }, []);

  const fetchBeltRank = async () => {
    try {
      setLoadingBeltRank(true);
      const response = await apiClient.get('/auth/belt-rank');
      setBeltRank(response.data.data.beltRank);
    } catch (error) {
      console.error('Failed to fetch belt rank:', error);
      // Set default belt rank if fetch fails
      setBeltRank({
        rank: 'white',
        stripes: 0,
        achievedDate: new Date().toISOString()
      });
    } finally {
      setLoadingBeltRank(false);
    }
  };

  const handleBeltRankChange = async (newBeltRank) => {
    try {
      const response = await apiClient.put('/auth/belt-rank', newBeltRank);
      setBeltRank(response.data.data.beltRank);
      Alert.alert('Success', 'Belt rank updated successfully!');
    } catch (error) {
      console.error('Failed to update belt rank:', error);
      Alert.alert('Error', 'Failed to update belt rank. Please try again.');
    }
  };

  const handleUpgradePress = () => {
    setShowPaywall(true);
  };

  const handlePurchaseCompleted = () => {
    setShowPaywall(false);
    // The user context will update automatically through the hybrid pro check
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== 'DELETE') {
      Alert.alert('Invalid Confirmation', 'Please type "DELETE" exactly as shown to confirm account deletion.');
      return;
    }

    try {
      await apiClient.delete('/auth/account');
      Alert.alert(
        'Account Deleted', 
        'Your account and all data have been permanently deleted.',
        [{ text: 'OK', onPress: () => logout() }]
      );
    } catch (error) {
      console.error('Failed to delete account', error);
      Alert.alert('Delete Failed', 'Could not delete your account. Please try again or contact support.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ErrorBoundary fallbackMessage="Unable to load profile screen. Please try refreshing.">
      <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* User Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Member since:</Text>
            <Text style={styles.value}>{user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}</Text>
          </View>
        </View>

        {/* Belt Rank Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Belt Rank</Text>
          {loadingBeltRank ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading belt rank...</Text>
            </View>
          ) : (
            <BeltRankSelector
              currentRank={beltRank}
              onRankChange={handleBeltRankChange}
            />
          )}
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          {isPro ? (
            <View style={styles.proBadgeContainer}>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>⭐ PRO MEMBER</Text>
              </View>
              <Text style={styles.proDescription}>You have access to all premium features</Text>
            </View>
          ) : (
            <View style={styles.upgradeContainer}>
              <TouchableOpacity style={styles.button} onPress={handleUpgradePress}>
                <View style={styles.buttonContent}>
                  <Text style={styles.starIcon}>⭐</Text>
                  <Text style={styles.buttonText}>Upgrade to Pro</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <View style={styles.logoutButtonContent}>
              <Ionicons name="log-out-outline" size={20} color={colors.white} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://www.termsfeed.com/live/ff739534-7f59-4d57-84d3-6acf05dc0024')}
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
          >
            <Text style={styles.linkText}>Terms of Use</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Text style={styles.supportText}>Need help or have feedback? Please email us at </Text>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => Linking.openURL('mailto:support@mat-time.io')}
          >
            <Text style={styles.linkText}>support@mat-time.io</Text>
          </TouchableOpacity>
        </View>


        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              This action cannot be undone. All your training data, sessions, and account information will be permanently deleted.
            </Text>
            <Text style={styles.confirmInstructions}>
              Type "DELETE" to confirm:
            </Text>
            <TextInput
              style={styles.confirmInput}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="Type DELETE here"
              placeholderTextColor={colors.mutedAccent}
              autoCapitalize="characters"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmDeleteButton, deleteConfirmText.trim() !== 'DELETE' && styles.disabledButton]} 
                onPress={confirmDeleteAccount}
                disabled={deleteConfirmText.trim() !== 'DELETE'}
              >
                <Text style={styles.confirmDeleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Paywall Modal */}
      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaywall(false)}
      >
        <Paywall
          onPurchaseCompleted={handlePurchaseCompleted}
          onClose={() => setShowPaywall(false)}
        />
      </Modal>
      </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: colors.primaryText,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: colors.mutedAccent,
  },
  upgradeContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  buttonText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  proBadgeContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  proBadge: {
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 8,
  },
  proBadgeText: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  proDescription: {
    color: colors.mutedAccent,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  linkButton: {
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 16,
    color: colors.primaryText,
    textDecorationLine: 'underline',
  },
  supportText: {
    fontSize: 16,
    color: colors.primaryText,
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dangerZone: {
    marginTop: 40,
    paddingTop: 20,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.destructive,
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: colors.destructive,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    margin: 20,
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.destructive,
    textAlign: 'center',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  confirmInstructions: {
    fontSize: 14,
    color: colors.primaryText,
    marginBottom: 10,
    fontWeight: '500',
  },
  confirmInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    color: colors.primaryText,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  cancelButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '500',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: colors.destructive,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 10,
    borderRadius: 8,
  },
  confirmDeleteButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  loadingText: {
    fontSize: 16,
    color: colors.mutedAccent,
  },
});