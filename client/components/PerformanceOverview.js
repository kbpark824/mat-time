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

import React from 'react';
import { View, Text } from 'react-native';
import colors from '../constants/colors';

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
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    ...{
      shadowColor: colors.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }
  },
  metricTitle: {
    fontSize: 14,
    color: colors.mutedAccent,
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 5,
  },
  metricSubtitle: {
    fontSize: 12,
    color: colors.mutedAccent,
  },
};

export default PerformanceOverview;