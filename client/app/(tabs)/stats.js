import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export default function StatsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Advanced Stats</Text>
        <Text style={styles.subtitle}>Detailed analytics and tracking</Text>
        <Text style={styles.description}>
          This tab will eventually contain:
          {'\n'}• Detailed training analytics
          {'\n'}• Progress tracking charts
          {'\n'}• Milestones and achievements
          {'\n'}• Training streaks and patterns
          {'\n'}• Technique progression tracking
          {'\n'}• Competition performance analysis
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  description: {
    fontSize: 14,
    color: colors.primaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
});