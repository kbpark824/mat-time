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

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function Tooltip({ children, content, title, placement = 'top' }) {
  const [visible, setVisible] = useState(false);

  const showTooltip = () => setVisible(true);
  const hideTooltip = () => setVisible(false);

  return (
    <>
      <TouchableOpacity 
        onPress={showTooltip}
        style={styles.trigger}
        accessibilityRole="button"
        accessibilityLabel={`Help: ${title || 'More information'}`}
        accessibilityHint="Tap to show help information"
      >
        {children || <Ionicons name="help-circle-outline" size={20} color={colors.mutedAccent} />}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideTooltip}
      >
        <Pressable style={styles.overlay} onPress={hideTooltip}>
          <View style={styles.tooltipContainer}>
            <View style={styles.tooltip}>
              {title && <Text style={styles.tooltipTitle}>{title}</Text>}
              <Text style={styles.tooltipText}>{content}</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={hideTooltip}
                accessibilityRole="button"
                accessibilityLabel="Close help"
              >
                <Text style={styles.closeButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// Inline help text component for simpler cases
export function HelpText({ children, style }) {
  return (
    <Text style={[styles.helpText, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tooltipContainer: {
    maxWidth: '90%',
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    maxWidth: 320,
    shadowColor: colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 8,
    textAlign: 'center',
  },
  tooltipText: {
    fontSize: 16,
    color: colors.primaryText,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    color: colors.mutedAccent,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },
});