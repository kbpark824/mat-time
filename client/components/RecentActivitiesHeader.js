import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '../constants/colors';

export default function RecentActivitiesHeader() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Activities</Text>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/search')}
          accessibilityRole="button"
          accessibilityLabel="View all activities"
          accessibilityHint="Navigate to search screen to view all your training activities"
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryText,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent,
  },
});