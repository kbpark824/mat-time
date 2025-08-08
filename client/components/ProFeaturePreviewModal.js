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
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function ProFeaturePreviewModal({ 
  visible, 
  onClose, 
  onUpgrade,
  featureType,
  children 
}) {
  const getFeatureInfo = () => {
    switch (featureType) {
      case 'seminar':
        return {
          title: 'Seminar Logging',
          icon: 'school',
          description: 'Track seminars and workshops with detailed notes about techniques learned and professors',
          features: [
            'Record seminar details and professor information',
            'Add rolling portion notes if applicable',  
            'Tag techniques learned for easy searching',
            'Track your learning progress over time'
          ]
        };
      case 'competition':
        return {
          title: 'Competition Logging',
          icon: 'trophy',
          description: 'Log tournament results with detailed match tracking and medal achievements',
          features: [
            'Track competition details and divisions',
            'Record match-by-match performance',
            'Visual medal selector (🥇🥈🥉)',
            'Analyze competition performance trends'
          ]
        };
      default:
        return {
          title: 'Pro Feature',
          icon: 'star',
          description: 'Unlock advanced features with Pro',
          features: []
        };
    }
  };

  const featureInfo = getFeatureInfo();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close preview"
          >
            <Ionicons name="close" size={24} color={colors.mutedAccent} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name={featureInfo.icon} size={32} color={colors.accent} />
            </View>
            <Text style={styles.title}>{featureInfo.title}</Text>
            <Text style={styles.subtitle}>{featureInfo.description}</Text>
          </View>
        </View>

        {/* Preview Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Feature List */}
          <View style={styles.featureSection}>
            <Text style={styles.sectionTitle}>What you&apos;ll get:</Text>
            {featureInfo.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Preview Screenshot/UI */}
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Preview:</Text>
            <View style={styles.previewContainer}>
              <View style={styles.blurredPreview}>
                {children}
              </View>
              <View style={styles.previewOverlay}>
                <Ionicons name="lock-closed" size={24} color={colors.white} />
                <Text style={styles.previewText}>Unlock to access</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={onUpgrade}
            accessibilityRole="button"
            accessibilityLabel="Upgrade to Pro"
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} style={styles.buttonIcon} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Maybe later"
          >
            <Text style={styles.dismissButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  header: {
    backgroundColor: colors.white,
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 12,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedAccent,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  featureSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: colors.primaryText,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blurredPreview: {
    flex: 1,
    opacity: 0.3,
    transform: [{ scale: 0.9 }],
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(61, 149, 206, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginTop: 8,
  },
  bottomActions: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34, // Account for safe area
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  upgradeButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  dismissButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 16,
    color: colors.mutedAccent,
    fontWeight: '500',
  },
});