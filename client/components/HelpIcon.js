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
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import Tooltip from './Tooltip';

export default function HelpIcon({ title, content, size = 20 }) {
  return (
    <View style={styles.container}>
      <Tooltip title={title} content={content}>
        <Ionicons 
          name="help-circle-outline" 
          size={size} 
          color={colors.mutedAccent}
          style={styles.icon}
        />
      </Tooltip>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    opacity: 0.7,
  },
});