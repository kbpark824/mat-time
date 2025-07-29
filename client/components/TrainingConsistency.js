import React from 'react';
import { View, Text } from 'react-native';
import colors from '../constants/colors';

const TrainingConsistency = ({ analytics, styles: parentStyles }) => {
  if (!analytics?.monthlyConsistency) {
    return null;
  }

  return (
    <View style={parentStyles.section}>
      <Text style={parentStyles.sectionTitle}>Training Consistency</Text>
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
  );
};

const styles = {
  consistencyContainer: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consistencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  consistencyLabel: {
    width: 50,
    fontSize: 12,
    color: colors.mutedAccent,
    marginRight: 10,
  },
  consistencyBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    marginRight: 10,
  },
  consistencyFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  consistencyValue: {
    width: 50,
    fontSize: 12,
    color: colors.primaryText,
    textAlign: 'right',
  },
};

export default TrainingConsistency;