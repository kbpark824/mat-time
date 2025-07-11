import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Purchases from 'react-native-purchases';
import colors from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';

export default function Paywall({ onPurchaseCompleted, onClose }) {
  const [offerings, setOfferings] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const getOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          setOfferings(offerings.current);
        }
      } catch (e) {
        Alert.alert('Error fetching offerings', e.message);
      } finally {
        setLoading(false);
      }
    };
    getOfferings();
  }, []);

  const handlePurchase = async (pkg) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (typeof customerInfo.entitlements.active.pro !== 'undefined') {
        // RevenueCat will automatically send webhook to server
        onPurchaseCompleted(true);
      }
    } catch (e) {
      if (!e.userCancelled) {
        Alert.alert('Error purchasing', e.message);
      }
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primaryText} />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close-circle" size={32} color={colors.primaryText} />
      </TouchableOpacity>
      <Text style={styles.title}>Unlock Pro Features</Text>
      <Text style={styles.subtitle}>Get unlimited access to tagging and filtering.</Text>
      {offerings && offerings.availablePackages.map((pkg) => (
        <TouchableOpacity key={pkg.identifier} style={styles.button} onPress={() => handlePurchase(pkg)}>
          <Text style={styles.buttonText}>
            {`${pkg.product.title} - ${pkg.product.priceString}`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedAccent,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primaryText,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
