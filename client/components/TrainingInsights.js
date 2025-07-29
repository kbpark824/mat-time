import React from 'react';
import { View, Text } from 'react-native';
import colors from '../constants/colors';

const InsightCard = ({ insight }) => {
  const getInsightColor = (type) => {
    switch (type) {
      case 'improvement': return colors.accent;
      case 'warning': return '#FF9800';
      case 'achievement': return '#4CAF50';
      default: return colors.mutedAccent;
    }
  };

  return (
    <View style={[styles.insightCard, { borderLeftColor: getInsightColor(insight.type) }]}>
      <Text style={styles.insightText}>{insight.message}</Text>
    </View>
  );
};

const TrainingInsights = ({ analytics, styles: parentStyles }) => {
  if (!analytics?.insights || analytics.insights.length === 0) {
    return null;
  }

  return (
    <View style={parentStyles.section}>
      <Text style={parentStyles.sectionTitle}>Training Insights</Text>
      {analytics.insights.map((insight, index) => (
        <InsightCard key={index} insight={insight} />
      ))}
    </View>
  );
};

const styles = {
  insightCard: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightText: {
    fontSize: 14,
    color: colors.primaryText,
    lineHeight: 20,
  },
};

export default TrainingInsights;