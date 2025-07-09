import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import colors from '../constants/colors';

// Get the screen width for responsive chart sizing
const screenWidth = Dimensions.get('window').width;

const StatCard = ({ title, value }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

export default function Dashboard({ stats }) {
  // A loading/default state for the chart
  const chartData = (stats && stats.typeDistribution && stats.typeDistribution.length > 0)
    ? stats.typeDistribution
    : [{ name: 'No Data', count: 1, color: colors.mutedAccent, legendFontColor: colors.primaryText, legendFontSize: 15 }];

  return (
    <View style={styles.container}>
      <View style={styles.cardsRow}>
        <StatCard title="Total Hours" value={stats?.totalHours.toFixed(1) || '0.0'} />
        <StatCard title="Hours This Month" value={stats?.hoursThisMonth.toFixed(1) || '0.0'} />
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Training Breakdown</Text>
        <PieChart
          data={chartData}
          width={screenWidth - 40} // Adjust for padding
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(74, 74, 74, ${opacity})`,
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute // Show absolute numbers instead of percentages
        />
      </View>
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
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '45%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
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
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.primaryText,
  }
});