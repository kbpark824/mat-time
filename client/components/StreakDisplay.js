import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';

export default function StreakDisplay({ streaks }) {
  if (!streaks) {
    return null;
  }

  const { currentStreak, longestStreak } = streaks;

  return (
    <View style={styles.container}>
      <View style={styles.streakCard}>
        <View style={styles.streakItem}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Current Streak</Text>
          <Text style={styles.streakSubtext}>
            {currentStreak === 0 
              ? 'Start training today!' 
              : currentStreak === 1 
                ? 'day' 
                : 'days'
            }
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.streakItem}>
          <Text style={styles.streakNumber}>{longestStreak}</Text>
          <Text style={styles.streakLabel}>Best Streak</Text>
          <Text style={styles.streakSubtext}>
            {longestStreak === 0 
              ? 'No streak yet' 
              : longestStreak === 1 
                ? 'day' 
                : 'days'
            }
          </Text>
        </View>
      </View>
      
      {currentStreak > 0 && (
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>
            {currentStreak >= 7 
              ? `🔥 Amazing! You're on fire with ${currentStreak} days!`
              : currentStreak >= 3
                ? `💪 Great momentum! Keep it going!`
                : `🎯 You're building a streak! Don't break it!`
            }
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  streakCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: colors.mutedAccent,
    marginHorizontal: 15,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 5,
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 2,
  },
  streakSubtext: {
    fontSize: 12,
    color: colors.mutedAccent,
    textAlign: 'center',
  },
  motivationContainer: {
    marginTop: 16,
    padding: 20,
    backgroundColor: colors.accent,
    borderRadius: 16,
    shadowColor: colors.accent,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  motivationText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
});