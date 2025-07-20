import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import AdvancedAnalytics from '../../components/AdvancedAnalytics';
import Paywall from '../../components/Paywall';
import { useProStatus } from '../../hooks/useProStatus';
import colors from '../../constants/colors';

export default function StatsScreen() {
  const { isProUser } = useProStatus();
  const [showPaywall, setShowPaywall] = useState(false);

  // If user is pro, show the advanced analytics
  if (isProUser) {
    return (
      <View style={styles.container}>
        <AdvancedAnalytics />
      </View>
    );
  }

  // If user is not pro, show the upgrade prompt
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🏆 Advanced Analytics</Text>
        <Text style={styles.subtitle}>Unlock detailed insights into your training</Text>
        
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Training progression charts</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Technique focus analysis</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔥</Text>
            <Text style={styles.featureText}>Advanced streak tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💡</Text>
            <Text style={styles.featureText}>Personalized training insights</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📈</Text>
            <Text style={styles.featureText}>Performance metrics & trends</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🗓️</Text>
            <Text style={styles.featureText}>Training consistency analysis</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.upgradeButton}
          onPress={() => setShowPaywall(true)}
        >
          <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
          <Text style={styles.upgradeButtonSubtext}>Unlock advanced analytics</Text>
        </TouchableOpacity>

        <Text style={styles.freeNote}>
          Basic training stats are available on the Home tab for all users
        </Text>
      </View>

      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaywall(false)}
      >
        <Paywall onClose={() => setShowPaywall(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedAccent,
    marginBottom: 30,
    textAlign: 'center',
  },
  featureList: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: colors.primaryText,
    fontWeight: '500',
  },
  upgradeButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  upgradeButtonSubtext: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginTop: 2,
  },
  freeNote: {
    fontSize: 12,
    color: colors.mutedAccent,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});