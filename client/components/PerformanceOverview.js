import React from 'react';
import { View, Text } from 'react-native';

const MetricCard = ({ title, value, subtitle, trend }) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
  </View>
);

const PerformanceOverview = ({ analytics, styles }) => {
  if (!analytics?.performanceMetrics || !analytics?.streaks) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Performance Overview</Text>
      <View style={styles.metricsRow}>
        <MetricCard 
          title="Total Sessions" 
          value={analytics.performanceMetrics.totalSessions}
          subtitle={`${analytics.performanceMetrics.totalHours.toFixed(1)} hours total`}
        />
        <MetricCard 
          title="Avg Duration" 
          value={`${analytics.performanceMetrics.avgDuration.toFixed(1)}h`}
          subtitle="per session"
        />
      </View>
      <View style={styles.metricsRow}>
        <MetricCard 
          title="Longest Session" 
          value={`${analytics.performanceMetrics.longestSession.toFixed(1)}h`}
        />
        <MetricCard 
          title="Training Streak" 
          value={analytics.streaks.currentStreak}
          subtitle={`Best: ${analytics.streaks.longestStreak} days`}
        />
      </View>
    </View>
  );
};

// Add the metric card styles that will be merged with the main styles
const styles = {
  metricCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#888',
  },
};

export default PerformanceOverview;