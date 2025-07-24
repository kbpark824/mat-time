import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
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
};

const TechniqueFocusChart = ({ techniqueData, styles }) => {
  if (!techniqueData || techniqueData.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Technique Focus</Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={techniqueData}
          width={screenWidth - 60}
          height={200}
          chartConfig={chartConfig}
          accessor="frequency"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>
    </View>
  );
};

export default TechniqueFocusChart;