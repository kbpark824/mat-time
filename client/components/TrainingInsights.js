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