import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import ErrorBoundary from './ErrorBoundary';
import StreakDisplay from './StreakDisplay';
import colors from '../constants/colors';

// Get the screen width for responsive chart sizing
const screenWidth = Dimensions.get('window').width;

const StatCard = React.memo(({ title, value }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
));

export default function Dashboard({ stats }) {
  // Memoized chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    return (stats && stats.typeDistribution && stats.typeDistribution.length > 0)
      ? stats.typeDistribution
      : [{ name: 'No Data', count: 1, color: colors.mutedAccent, legendFontColor: colors.primaryText, legendFontSize: 15 }];
  }, [stats?.typeDistribution]);

  // Memoized chart configuration to prevent object recreation
  const chartConfig = useMemo(() => ({
    color: (opacity = 1) => `rgba(74, 74, 74, ${opacity})`,
  }), []);

  // Memoized computed values to prevent recalculation on every render
  const totalHours = useMemo(() => 
    stats?.totalHours.toFixed(1) || '0.0', 
    [stats?.totalHours]
  );

  const hoursThisMonth = useMemo(() => 
    stats?.hoursThisMonth.toFixed(1) || '0.0', 
    [stats?.hoursThisMonth]
  );

  return (
    <View style={styles.container}>
      <View style={styles.cardsRow}>
        <StatCard title="Total Hours" value={totalHours} />
        <StatCard title="Hours This Month" value={hoursThisMonth} />
      </View>
      
      <ErrorBoundary fallbackMessage="Unable to load training streak data.">
        <StreakDisplay streaks={stats?.streaks} />
      </ErrorBoundary>
      
      <ErrorBoundary fallbackMessage="Unable to load activity breakdown chart.">
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Activity Breakdown</Text>
          <PieChart
            data={chartData}
            width={screenWidth - 40} // Adjust for padding
            height={240} // Increased height for more categories
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute // Show absolute numbers instead of percentages
            hasLegend={true}
            legendOffset={20} // Add some space for legend
          />
        </View>
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: colors.primaryBackground,
  },
  cardsRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  card: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  cardTitle: {
    fontSize: 14,
    color: colors.mutedAccent,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
    color: colors.primaryText,
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.primaryText,
  }
});