import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Dashboard from './Dashboard';
import ErrorBoundary from './ErrorBoundary';
import colors from '../constants/colors';

export default function HomeDashboardSection({ stats, loading }) {
  return (
    <View style={styles.container}>
      <ErrorBoundary fallbackMessage="Unable to load dashboard. Please try refreshing.">
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        ) : (
          <Dashboard stats={stats} />
        )}
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.mutedAccent,
    textAlign: 'center',
    marginTop: 12,
  },
});