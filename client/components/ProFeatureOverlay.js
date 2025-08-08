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
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function ProFeatureOverlay({ 
  visible, 
  onClose, 
  onUpgrade, 
  title = "Pro Feature", 
  description = "Upgrade to Pro to unlock this feature",
  children 
}) {
  return (
    <View style={styles.container}>
      {/* Show the actual content but blurred/dimmed */}
      <View style={styles.contentContainer}>
        <View style={styles.blurredContent}>
          {children}
        </View>
        
        {/* Overlay with upgrade message */}
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={32} color={colors.white} />
            </View>
            
            <Text style={styles.overlayTitle}>{title}</Text>
            <Text style={styles.overlayDescription}>{description}</Text>
            
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={onUpgrade}
              accessibilityRole="button"
              accessibilityLabel="Upgrade to Pro"
              accessibilityHint="Opens subscription screen to unlock Pro features"
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.white} style={styles.buttonIcon} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dismissButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Dismiss overlay"
              accessibilityHint="Closes the upgrade prompt"
            >
              <Text style={styles.dismissButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  blurredContent: {
    flex: 1,
    opacity: 0.3,
    transform: [{ scale: 0.95 }],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250, 250, 250, 0.85)', // More transparent primary background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 300,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 8,
  },
  overlayDescription: {
    fontSize: 16,
    color: colors.mutedAccent,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  upgradeButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  dismissButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dismissButtonText: {
    fontSize: 14,
    color: colors.mutedAccent,
    fontWeight: '500',
  },
});