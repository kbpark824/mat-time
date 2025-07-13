import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Linking, ScrollView } from 'react-native';
import { useAuth } from '../../auth/context';
import colors from '../../constants/colors';
import Paywall from '../../components/Paywall';
import apiClient from '../../api/client';

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const isPro = user?.isPro || false;

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

  if (showPaywall) {
    return <Paywall onPurchaseCompleted={handlePurchaseCompleted} onClose={() => setShowPaywall(false)} />;
  }

  return (
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

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          {isPro ? (
            <TouchableOpacity style={[styles.button, styles.proButton]} disabled>
              <Text style={styles.proButtonText}>✓ Pro Member</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleUpgradePress}>
              <Text style={styles.buttonText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
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
          <Text style={styles.supportText}>Need help? Please contact us at </Text>
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
    </ScrollView>
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
  button: {
    backgroundColor: colors.primaryText,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  proButton: {
    backgroundColor: colors.lightBackground,
    borderWidth: 1,
    borderColor: colors.mutedAccent,
  },
  proButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: 'bold',
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
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryText,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerZone: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.mutedAccent,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D9534F',
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: '#D9534F',
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
    color: '#D9534F',
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
    borderWidth: 1,
    borderColor: colors.mutedAccent,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    color: colors.primaryText,
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
    borderWidth: 1,
    borderColor: colors.mutedAccent,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '500',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#D9534F',
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
});