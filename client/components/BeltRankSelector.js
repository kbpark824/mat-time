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
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../constants/colors';
import HelpIcon from './HelpIcon';
import { HelpText } from './Tooltip';

const beltRanks = [
  { value: 'white', name: 'White Belt', color: '#FFFFFF', textColor: '#000000' },
  { value: 'blue', name: 'Blue Belt', color: '#0066CC', textColor: '#FFFFFF' },
  { value: 'purple', name: 'Purple Belt', color: '#6B2C91', textColor: '#FFFFFF' },
  { value: 'brown', name: 'Brown Belt', color: '#8B4513', textColor: '#FFFFFF' },
  { value: 'black', name: 'Black Belt', color: '#000000', textColor: '#FFFFFF' }
];

const stripeOptions = [0, 1, 2, 3, 4];

export default function BeltRankSelector({ currentRank, onRankChange }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedRank, setSelectedRank] = useState(currentRank?.rank || 'white');
  const [selectedStripes, setSelectedStripes] = useState(currentRank?.stripes || 0);
  const [selectedDate, setSelectedDate] = useState(currentRank?.achievedDate ? new Date(currentRank.achievedDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const currentBelt = beltRanks.find(belt => belt.value === (currentRank?.rank || 'white'));

  const handleSave = () => {
    setShowDatePicker(false); // Close date picker if open
    const rankData = {
      rank: selectedRank,
      stripes: selectedStripes,
      achievedDate: selectedDate.toISOString()
    };
    onRankChange(rankData);
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowDatePicker(false); // Close date picker if open
    setSelectedRank(currentRank?.rank || 'white');
    setSelectedStripes(currentRank?.stripes || 0);
    setSelectedDate(currentRank?.achievedDate ? new Date(currentRank.achievedDate) : new Date());
    setShowModal(false);
  };

  const onDateChange = (event, date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
    } else if (date) {
      setSelectedDate(date);
    }
  };

  const getRankBarColor = (beltRank) => {
    return beltRank === 'black' ? '#DC143C' : '#000000'; // Red for black belt, black for all others
  };

  const getStripeColor = (beltColor) => {
    return '#FFFFFF'; // Always white stripes
  };

  const renderStripes = (count, beltColor, vertical = false, beltRank = null, isPreview = false) => {
    const stripes = [];
    for (let i = 0; i < count; i++) {
      stripes.push(
        <View 
          key={i} 
          style={[
            vertical ? (isPreview ? styles.previewVerticalStripe : styles.verticalStripe) : styles.stripe, 
            { backgroundColor: getStripeColor(beltColor) }
          ]} 
        />
      );
    }
    return stripes;
  };

  return (
    <>
      <TouchableOpacity style={styles.beltDisplay} onPress={() => setShowModal(true)}>
        <View style={styles.beltContainer}>
          <View style={[styles.belt, { backgroundColor: currentBelt.color }]}>
            <Text style={[styles.beltText, { color: currentBelt.textColor }]}>
              {currentBelt.name}
            </Text>
            <View style={styles.beltRightSection}>
              <View style={[styles.rankBar, { backgroundColor: getRankBarColor(currentRank?.rank || 'white') }]}>
                <View style={styles.verticalStripesContainer}>
                  {renderStripes(currentRank?.stripes || 0, currentBelt.color, true, currentRank?.rank)}
                </View>
              </View>
              <View style={[styles.mainBeltTip, { backgroundColor: currentBelt.color }]} />
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.mutedAccent} />
        </View>
        <Text style={styles.achievedDate}>
          Achieved: {currentRank?.achievedDate ? new Date(currentRank.achievedDate).toLocaleDateString() : 'Not set'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Belt Rank</Text>
            
            <ScrollView 
              style={[styles.scrollContent, showDatePicker && styles.scrollContentWithDatePicker]} 
              showsVerticalScrollIndicator={false}
            >
              {/* Belt Selection */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Belt Rank</Text>
                <HelpIcon 
                  title="Belt Progression"
                  content="BJJ belt progression follows this order: White → Blue → Purple → Brown → Black. Each belt represents years of dedicated training and skill development."
                />
              </View>
              <View style={styles.beltGrid}>
                {beltRanks.map((belt) => (
                  <TouchableOpacity
                    key={belt.value}
                    style={[
                      styles.beltOption,
                      { backgroundColor: belt.color },
                      selectedRank === belt.value && styles.selectedBelt
                    ]}
                    onPress={() => setSelectedRank(belt.value)}
                  >
                    <Text style={[styles.beltOptionText, { color: belt.textColor }]}>
                      {belt.name}
                    </Text>
                    <View style={styles.beltOptionRight}>
                      <View style={[styles.beltOptionRankBar, { backgroundColor: getRankBarColor(belt.value) }]} />
                      <View style={styles.beltTip} />
                      {selectedRank === belt.value && (
                        <Ionicons name="checkmark" size={16} color={belt.textColor} style={styles.checkmark} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Stripes Selection */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Stripes</Text>
                <HelpIcon 
                  title="Stripe System"
                  content="Stripes (white tape) are added to belts to mark progress within each belt rank. Most belts can have 0-4 stripes before promotion to the next belt level."
                />
              </View>
              <HelpText>Each stripe represents progress toward your next belt promotion</HelpText>
              <View style={styles.stripesSelection}>
                {stripeOptions.map((stripeCount) => (
                  <TouchableOpacity
                    key={stripeCount}
                    style={[
                      styles.stripeOption,
                      selectedStripes === stripeCount && styles.selectedStripeOption
                    ]}
                    onPress={() => setSelectedStripes(stripeCount)}
                  >
                    <Text style={[
                      styles.stripeOptionText,
                      selectedStripes === stripeCount && styles.selectedStripeOptionText
                    ]}>
                      {stripeCount}
                    </Text>
                    <View style={styles.stripesPreview}>
                      {renderStripes(stripeCount, '#FFFFFF', true, null, true)}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

            </ScrollView>

            {/* Date Selection - Outside ScrollView so it stays visible */}
            <View style={styles.dateSection}>
              <Text style={styles.sectionLabel}>Date Achieved</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateButtonText}>{selectedDate.toLocaleDateString()}</Text>
                <Ionicons name="calendar" size={20} color={colors.accent} />
              </TouchableOpacity>
            </View>

            {/* Date Picker - Outside ScrollView */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                maximumDate={new Date()}
                textColor="#333333"
                accentColor="#007AFF"
                themeVariant="light"
              />
            )}

            {/* Action Buttons - Fixed at bottom */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  beltDisplay: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 12,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  beltContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  belt: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.mutedAccent,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  beltText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    paddingLeft: 10,
  },
  stripesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
  },
  stripe: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
  },
  beltRightSection: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: '100%',
  },
  rankBar: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  mainBeltTip: {
    width: 25,
    height: '100%',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  verticalStripesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    height: '100%',
    paddingHorizontal: 13,
  },
  verticalStripe: {
    width: 6,
    height: '100%',
    borderRadius: 1,
  },
  previewVerticalStripe: {
    width: 3,
    height: '100%',
    borderRadius: 0.5,
  },
  achievedDate: {
    fontSize: 14,
    color: colors.mutedAccent,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    margin: 10,
    padding: 15,
    borderRadius: 12,
    width: '95%',
    maxHeight: '90%',
  },
  scrollContent: {
    maxHeight: 450,
    marginBottom: 15,
  },
  scrollContentWithDatePicker: {
    maxHeight: 400,
  },
  dateSection: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primaryText,
    flex: 1,
  },
  beltGrid: {
    flexDirection: 'column',
    gap: 4,
  },
  beltOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 0,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.mutedAccent,
    height: 40,
    overflow: 'hidden',
  },
  selectedBelt: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  beltOptionText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    paddingLeft: 10,
  },
  beltOptionRight: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: '100%',
  },
  beltOptionRankBar: {
    width: 80,
    height: '100%',
    borderRadius: 0,
  },
  beltTip: {
    width: 25,
    height: '100%',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  checkmark: {
    position: 'absolute',
    right: 4,
    alignSelf: 'center',
  },
  stripesSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  stripeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  selectedStripeOption: {
    backgroundColor: colors.accent,
  },
  stripeOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 4,
  },
  selectedStripeOptionText: {
    color: colors.white,
  },
  stripesPreview: {
    flexDirection: 'row',
    gap: 2,
    height: 16,
    width: 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#000000',
    borderRadius: 2,
    paddingRight: 3,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.primaryText,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});