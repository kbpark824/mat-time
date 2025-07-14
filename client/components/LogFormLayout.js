import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Pressable, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import TagInput from './TagInput';
import Paywall from './Paywall';
import colors from '../constants/colors';
import { useProStatus } from '../hooks/useProStatus';

export default function LogFormLayout({
  // Form data
  date,
  setDate,
  typeOptions,
  type,
  setType,
  techniqueNotes,
  setTechniqueNotes,
  tags,
  setTags,
  
  // Rolling notes (optional - only for sessions)
  rollingNotes,
  setRollingNotes,
  
  // Additional fields (passed as render props)
  additionalFields,
  
  // Actions
  onSave,
  onDelete,
  onCancel,
  isEditing,
  saveButtonText,
  deleteButtonText = "Delete",
  
  // Pro features
  showPaywall,
  setShowPaywall,
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };


  return (
    <KeyboardAwareScrollView style={styles.container}>
      <Text style={styles.label}>Date</Text>
      <Pressable onPress={() => setShowDatePicker(true)}>
        <View style={styles.input}>
            <Text style={styles.datePickerText}>{date.toLocaleDateString()}</Text>
        </View>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          onChange={onChangeDate}
          textColor="#333333"
        />
      )}
      
      {/* Additional fields (duration, professor, etc.) */}
      {additionalFields}
      
      <Text style={styles.label}>Type</Text>
      <View style={styles.buttonGroup}>
        {typeOptions.map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.typeButton, type === t && styles.typeButtonSelected]} 
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeButtonText, type === t && styles.typeButtonTextSelected]}>{t}</Text>
            </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Technique Notes</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        multiline 
        value={techniqueNotes} 
        onChangeText={setTechniqueNotes} 
        placeholder="What did you learn today?" 
        placeholderTextColor={colors.mutedAccent} 
      />

      <TagInput tags={tags} onTagsChange={setTags} />

      {/* Rolling Notes - only show if rolling notes props are provided */}
      {rollingNotes !== undefined && setRollingNotes && (
        <>
          <Text style={styles.label}>Rolling / Sparring Notes</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            multiline 
            value={rollingNotes} 
            onChangeText={setRollingNotes} 
            placeholder="How did rolling go?" 
            placeholderTextColor={colors.mutedAccent} 
          />
        </>
      )}

      <View style={styles.spacer} />
      <TouchableOpacity style={styles.primaryButton} onPress={onSave}>
        <Text style={styles.primaryButtonText}>{saveButtonText}</Text>
      </TouchableOpacity>
      <View style={styles.buttonSpacer} />
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <View style={styles.spacer} />
      
      {isEditing && (
         <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
           <Text style={styles.deleteButtonText}>{deleteButtonText}</Text>
         </TouchableOpacity>
      )}
       <View style={styles.spacer} />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      padding: 20, 
      backgroundColor: colors.primaryBackground 
    },
    label: { 
      fontSize: 16, 
      marginBottom: 5, 
      fontWeight: 'bold', 
      color: colors.primaryText 
    },
    datePickerText: {
      fontSize: 16,
      color: colors.primaryText,
      paddingVertical: 8,
    },
    input: { 
      height: 40, 
      borderColor: colors.mutedAccent, 
      borderWidth: 1, 
      marginBottom: 15, 
      paddingHorizontal: 8, 
      borderRadius: 5, 
      backgroundColor: colors.white,
      justifyContent: 'center',
      color: colors.primaryText,
    },
    textArea: { 
      height: 100, 
      textAlignVertical: 'top',
      paddingTop: 8,
    },
    buttonGroup: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginBottom: 15 
    },
    typeButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.mutedAccent,
      borderRadius: 5,
      paddingVertical: 10,
      alignItems: 'center',
      marginHorizontal: 2,
    },
    typeButtonSelected: {
      backgroundColor: colors.primaryText,
      borderColor: colors.primaryText,
    },
    typeButtonText: {
      color: colors.primaryText,
      fontSize: 14,
    },
    typeButtonTextSelected: {
      color: colors.white,
    },
    spacer: { height: 20 },
    primaryButton: {
      backgroundColor: colors.primaryText,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
    deleteButton: {
      backgroundColor: colors.destructive,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    deleteButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
    tagsTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    proLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.white,
      backgroundColor: colors.mutedAccent,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      marginLeft: 8,
      textAlign: 'center',
      overflow: 'hidden',
    },
    compactProFeatureContainer: {
      padding: 12,
      backgroundColor: colors.lightBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.mutedAccent,
      alignItems: 'center',
      marginBottom: 15,
    },
    compactProFeatureText: {
      fontSize: 14,
      color: colors.mutedAccent,
      textAlign: 'center',
    },
    buttonSpacer: { 
      height: 12 
    },
    cancelButton: {
      backgroundColor: '#DFDFDF',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primaryText,
    },
});