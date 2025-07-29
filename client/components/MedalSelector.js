import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { HelpText } from './Tooltip';

const medalOptions = [
  { value: 'gold', emoji: '🥇', isEmoji: true },
  { value: 'silver', emoji: '🥈', isEmoji: true },
  { value: 'bronze', emoji: '🥉', isEmoji: true },
  { value: 'none', icon: 'close', color: '#E74C3C', isEmoji: false }
];

export default function MedalSelector({ value, onSelect }) {
  return (
    <>
      <HelpText>Select your competition result: 🥇 Gold, 🥈 Silver, 🥉 Bronze, or ✕ No placement</HelpText>
      <View style={styles.container}>
      {medalOptions.map((medal) => (
        <TouchableOpacity
          key={medal.value}
          style={[
            styles.medalButton,
            value === medal.value && styles.medalButtonSelected
          ]}
          onPress={() => onSelect(medal.value)}
        >
          {medal.isEmoji ? (
            <Text style={styles.emoji}>{medal.emoji}</Text>
          ) : (
            <Ionicons
              name={medal.icon}
              size={32}
              color={value === medal.value ? colors.white : medal.color}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  medalButton: {
    flex: 1,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  medalButtonSelected: {
    backgroundColor: colors.accent,
  },
  emoji: {
    fontSize: 32,
  },
});