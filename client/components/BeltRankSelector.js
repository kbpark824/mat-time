import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../constants/colors';

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

  const renderStripes = (count, beltColor) => {
    const stripes = [];
    for (let i = 0; i < count; i++) {
      stripes.push(
        <View key={i} style={[styles.stripe, { backgroundColor: beltColor === '#FFFFFF' ? '#FFD700' : '#FFFFFF' }]} />
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
            <View style={styles.stripesContainer}>
              {renderStripes(currentRank?.stripes || 0, currentBelt.color)}
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
              <Text style={styles.sectionLabel}>Belt Rank</Text>
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
                    {selectedRank === belt.value && (
                      <Ionicons name="checkmark" size={16} color={belt.textColor} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Stripes Selection */}
              <Text style={styles.sectionLabel}>Stripes</Text>
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
                      {renderStripes(stripeCount, '#000000')}
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mutedAccent,
  },
  beltText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
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
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '85%',
  },
  scrollContent: {
    maxHeight: 350,
    marginBottom: 15,
  },
  scrollContentWithDatePicker: {
    maxHeight: 280,
  },
  dateSection: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 10,
    marginTop: 15,
  },
  beltGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  beltOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mutedAccent,
  },
  selectedBelt: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  beltOptionText: {
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: colors.lightBackground,
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
    height: 8,
    alignItems: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.lightBackground,
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
    backgroundColor: colors.lightBackground,
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