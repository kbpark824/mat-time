import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import apiClient from '../api/client';
import colors from '../constants/colors';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundColor: colors.white,
  backgroundGradientFrom: colors.white,
  backgroundGradientTo: colors.white,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(74, 74, 74, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: colors.accent
  }
};

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

const InsightCard = ({ insight }) => {
  const getInsightColor = (type) => {
    switch (type) {
      case 'positive': return colors.success || '#4CAF50';
      case 'suggestion': return colors.warning || '#FF9800';
      case 'info': return colors.accent;
      default: return colors.mutedAccent;
    }
  };

  return (
    <View style={[styles.insightCard, { borderLeftColor: getInsightColor(insight.type) }]}>
      <Text style={styles.insightTitle}>{insight.title}</Text>
      <Text style={styles.insightMessage}>{insight.message}</Text>
    </View>
  );
};

const MetricCard = ({ title, value, subtitle, trend }) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    {trend && (
      <Text style={[styles.metricTrend, { color: trend > 0 ? colors.success : colors.destructive }]}>
        {trend > 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
      </Text>
    )}
  </View>
);

export default function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('6months');

  const fetchAnalytics = async (selectedTimeframe = timeframe) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/stats/advanced?timeframe=${selectedTimeframe}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch advanced analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    fetchAnalytics(newTimeframe);
  };

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

  // Prepare chart data
  const monthlyData = analytics.monthlyProgression.map(month => ({
    label: `${month._id.month}/${month._id.year.toString().slice(-2)}`,
    sessions: month.sessions,
    hours: month.hours
  }));

  const lineChartData = {
    labels: monthlyData.slice(-6).map(d => d.label), // Last 6 months
    datasets: [
      {
        data: monthlyData.slice(-6).map(d => d.sessions),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

  const techniqueData = analytics.techniqueFocus.slice(0, 5).map(tech => ({
    name: tech._id.substring(0, 12) + (tech._id.length > 12 ? '...' : ''),
    frequency: tech.frequency,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    legendFontColor: colors.primaryText,
    legendFontSize: 12
  }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Timeframe Selector */}
      <TimeframeSelector selected={timeframe} onSelect={handleTimeframeChange} />

      {/* Performance Metrics */}
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

      {/* Training Progression Chart */}
      {monthlyData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Progression</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={lineChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </View>
      )}

      {/* Technique Focus */}
      {techniqueData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technique Focus</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={techniqueData}
              width={screenWidth - 40}
              height={200}
              chartConfig={chartConfig}
              accessor="frequency"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        </View>
      )}

      {/* Insights */}
      {analytics.insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Insights</Text>
          {analytics.insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </View>
      )}

      {/* Consistency Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Training Consistency</Text>
        <View style={styles.consistencyContainer}>
          {analytics.monthlyConsistency.slice(-6).map((month, index) => (
            <View key={index} style={styles.consistencyItem}>
              <Text style={styles.consistencyLabel}>
                {month._id.month}/{month._id.year.toString().slice(-2)}
              </Text>
              <View style={styles.consistencyBar}>
                <View 
                  style={[
                    styles.consistencyFill, 
                    { width: `${Math.min(month.trainingDays * 3.33, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.consistencyValue}>{month.trainingDays} days</Text>
            </View>
          ))}
        </View>
      </View>
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
    padding: 15,
    borderRadius: 12,
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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