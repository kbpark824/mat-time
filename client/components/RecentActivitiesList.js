import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import colors from '../constants/colors';

// This component now just provides empty/loading states for when there are no activities
export default function RecentActivitiesEmptyState({ loading }) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading recent activities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No recent activities</Text>
      <Text style={styles.emptySubtext}>Start logging your training sessions!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.mutedAccent,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.mutedAccent,
    textAlign: 'center',
  },
});