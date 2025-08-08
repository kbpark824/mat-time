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