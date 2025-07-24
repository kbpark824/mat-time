import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import apiClient from '../api/client';
import colors from '../constants/colors';
import ErrorBoundary from './ErrorBoundary';
import TrainingProgressionChart from './TrainingProgressionChart';
import TechniqueFocusChart from './TechniqueFocusChart';
import PerformanceOverview from './PerformanceOverview';
import TrainingInsights from './TrainingInsights';
import TrainingConsistency from './TrainingConsistency';
import MedalStatistics from './MedalStatistics';


const TimeframeSelector = ({ selected, onSelect }) => {
  const timeframes = [
    { value: '1month', label: '1M' },
    { value: '3months', label: '3M' },
    { value: '6months', label: '6M' },
    { value: '1year', label: '1Y' },
    { value: 'all', label: 'All' }
  ];

  return (
    <View style={styles.timeframeContainer}>
      {timeframes.map((timeframe) => (
        <TouchableOpacity
          key={timeframe.value}
          style={[
            styles.timeframeButton,
            selected === timeframe.value && styles.timeframeButtonSelected
          ]}
          onPress={() => onSelect(timeframe.value)}
        >
          <Text style={[
            styles.timeframeText,
            selected === timeframe.value && styles.timeframeTextSelected
          ]}>
            {timeframe.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};


export default function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('6months');

  const fetchAnalytics = useCallback(async (selectedTimeframe = timeframe) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/stats/advanced?timeframe=${selectedTimeframe}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch advanced analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleTimeframeChange = useCallback((newTimeframe) => {
    setTimeframe(newTimeframe);
    fetchAnalytics(newTimeframe);
  }, [fetchAnalytics]);

  // Prepare chart data - memoized for performance (MUST be before early returns)
  const monthlyData = useMemo(() => {
    if (!analytics?.monthlyProgression) return [];
    return analytics.monthlyProgression.map(month => ({
      label: `${month._id.month}/${month._id.year.toString().slice(-2)}`,
      sessions: month.sessions,
      hours: month.hours
    }));
  }, [analytics?.monthlyProgression]);

  const lineChartData = useMemo(() => {
    const lastSixMonths = monthlyData.slice(-6);
    return {
      labels: lastSixMonths.map(d => d.label),
      datasets: [
        {
          data: lastSixMonths.map(d => d.sessions),
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  }, [monthlyData]);

  const techniqueData = useMemo(() => {
    if (!analytics?.techniqueFocus) return [];
    return analytics.techniqueFocus.slice(0, 5).map((tech, index) => ({
      name: tech._id ? (tech._id.substring(0, 12) + (tech._id.length > 12 ? '...' : '')) : 'Unknown',
      frequency: tech.frequency,
      color: `hsl(${(index * 72) % 360}, 70%, 60%)`, // Consistent colors instead of random
      legendFontColor: colors.primaryText,
      legendFontSize: 12
    }));
  }, [analytics?.techniqueFocus]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading advanced analytics...</Text>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load analytics data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Timeframe Selector */}
      <TimeframeSelector selected={timeframe} onSelect={handleTimeframeChange} />

      {/* Performance Overview */}
      <ErrorBoundary fallbackMessage="Unable to load performance overview.">
        <PerformanceOverview analytics={analytics} styles={styles} />
      </ErrorBoundary>

      {/* Training Progression Chart */}
      <ErrorBoundary fallbackMessage="Unable to load training progression chart.">
        <TrainingProgressionChart lineChartData={lineChartData} styles={styles} />
      </ErrorBoundary>

      {/* Technique Focus Chart */}
      <ErrorBoundary fallbackMessage="Unable to load technique focus chart.">
        <TechniqueFocusChart techniqueData={techniqueData} styles={styles} />
      </ErrorBoundary>

      {/* Training Insights */}
      <ErrorBoundary fallbackMessage="Unable to load training insights.">
        <TrainingInsights analytics={analytics} styles={styles} />
      </ErrorBoundary>

      {/* Medal Statistics */}
      <ErrorBoundary fallbackMessage="Unable to load medal statistics.">
        <MedalStatistics analytics={analytics} styles={styles} />
      </ErrorBoundary>

      {/* Training Consistency */}
      <ErrorBoundary fallbackMessage="Unable to load training consistency data.">
        <TrainingConsistency analytics={analytics} styles={styles} />
      </ErrorBoundary>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
  },
  loadingText: {
    fontSize: 16,
    color: colors.mutedAccent,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
  },
  errorText: {
    fontSize: 16,
    color: colors.destructive,
  },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  timeframeButtonSelected: {
    backgroundColor: colors.accent,
  },
  timeframeText: {
    fontSize: 14,
    color: colors.mutedAccent,
    fontWeight: '500',
  },
  timeframeTextSelected: {
    color: colors.white,
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
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    flex: 0.48,
    minHeight: 100,
    justifyContent: 'center',
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  metricTitle: {
    fontSize: 12,
    color: colors.mutedAccent,
    fontWeight: '600',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryText,
  },
  metricSubtitle: {
    fontSize: 11,
    color: colors.mutedAccent,
    marginTop: 2,
  },
  metricTrend: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 10,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  chart: {
    borderRadius: 8,
  },
  insightCard: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 5,
  },
  insightMessage: {
    fontSize: 13,
    color: colors.mutedAccent,
    lineHeight: 18,
  },
  consistencyContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  consistencyItem: {
    marginBottom: 15,
  },
  consistencyLabel: {
    fontSize: 12,
    color: colors.mutedAccent,
    marginBottom: 5,
  },
  consistencyBar: {
    height: 8,
    backgroundColor: colors.tertiaryBackground,
    borderRadius: 4,
    marginBottom: 5,
  },
  consistencyFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  consistencyValue: {
    fontSize: 11,
    color: colors.primaryText,
    fontWeight: '500',
  },
});