import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';

export default function StreakDisplay({ streaks }) {
  console.log('StreakDisplay received streaks:', streaks);
  
  if (!streaks) {
    console.log('No streaks data, returning null');
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.mutedAccent,
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
    marginTop: 10,
    padding: 12,
    backgroundColor: colors.accent + '15',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  motivationText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
    textAlign: 'center',
  },
});