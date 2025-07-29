import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Purchases from 'react-native-purchases';
import colors from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';

export default function Paywall({ onPurchaseCompleted, onClose }) {
  const [offerings, setOfferings] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedPackage, setSelectedPackage] = React.useState(null);
  const [purchasing, setPurchasing] = React.useState(false);

  React.useEffect(() => {
    const getOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          setOfferings(offerings.current);
          // Auto-select the first package
          setSelectedPackage(offerings.current.availablePackages[0]);
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
    setPurchasing(true);
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
    } finally {
      setPurchasing(false);
    }
  };

  const proFeatures = [
    {
      icon: 'pricetag',
      title: 'Unlimited Tagging',
      description: 'Organize your sessions with unlimited custom tags'
    },
    {
      icon: 'filter',
      title: 'Advanced Filtering',
      description: 'Filter and search your training history by tags'
    },
    {
      icon: 'school',
      title: 'Seminar Logging',
      description: 'Track seminars and workshops with detailed notes'
    },
    {
      icon: 'trophy',
      title: 'Competition Tracking',
      description: 'Log competitions and tournament results'
    }
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryText} />
        <Text style={styles.loadingText}>Loading subscription options...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.mutedAccent} />
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.proIcon}>
            <Ionicons name="star" size={32} color={colors.white} />
          </View>
          <Text style={styles.title}>Upgrade to Pro</Text>
          <Text style={styles.subtitle}>
            Unlock powerful features to enhance your training journey
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          {proFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon} size={20} color={colors.primaryText} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Subscription Options */}
        {offerings && offerings.availablePackages.length > 0 && (
          <View style={styles.subscriptionSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            {offerings.availablePackages.map((pkg) => (
              <TouchableOpacity 
                key={pkg.identifier}
                style={[
                  styles.packageOption,
                  selectedPackage?.identifier === pkg.identifier && styles.selectedPackage
                ]}
                onPress={() => setSelectedPackage(pkg)}
              >
                <View style={styles.packageHeader}>
                  <Text style={styles.packageTitle}>{pkg.product.title}</Text>
                  <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
                </View>
                {pkg.product.description && (
                  <Text style={styles.packageDescription}>{pkg.product.description}</Text>
                )}
                <View style={styles.radioButton}>
                  {selectedPackage?.identifier === pkg.identifier && (
                    <View style={styles.radioSelected} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomSection}>
        {selectedPackage && (
          <TouchableOpacity 
            style={[styles.purchaseButton, purchasing && styles.disabledButton]} 
            onPress={() => handlePurchase(selectedPackage)}
            disabled={purchasing}
          >
            {purchasing ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.purchaseButtonText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.purchaseButtonText}>
                Start Free Trial
              </Text>
            )}
          </TouchableOpacity>
        )}
        <Text style={styles.disclaimer}>
          Cancel anytime. Terms and conditions apply.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.mutedAccent,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  proIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryText,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedAccent,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    paddingTop: 2,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.mutedAccent,
    lineHeight: 20,
  },
  subscriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 20,
    textAlign: 'center',
  },
  packageOption: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
    position: 'relative',
  },
  selectedPackage: {
    backgroundColor: colors.primaryBackground,
    shadowOpacity: colors.shadow.opacity * 1.5,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginRight: 40, // Add margin to prevent overlap with radio button
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryText,
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryText,
  },
  packageDescription: {
    fontSize: 14,
    color: colors.mutedAccent,
    marginBottom: 12,
  },
  radioButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryText,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: colors.primaryBackground,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  purchaseButton: {
    backgroundColor: colors.primaryText,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.mutedAccent,
    textAlign: 'center',
    lineHeight: 16,
  },
});
