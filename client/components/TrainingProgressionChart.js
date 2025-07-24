import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
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

const TrainingProgressionChart = ({ lineChartData, styles }) => {
  if (!lineChartData || lineChartData.labels.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Training Progression</Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={lineChartData}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
    </View>
  );
};

export default TrainingProgressionChart;