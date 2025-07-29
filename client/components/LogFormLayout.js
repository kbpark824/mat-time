import React from 'react';
import { View, TextInput, StyleSheet, Text, Pressable, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import TagInput from './TagInput';
import colors from '../constants/colors';
import commonStyles from '../constants/commonStyles';
import { useFormContext } from '../contexts/FormContext';

export default function LogFormLayout({
  typeOptions,
  rollingNotes,
  setRollingNotes,
  rollingNotesError,
  rollingNotesTouched,
  onRollingNotesBlur,
  additionalFields,
  onDelete,
  isEditing,
  deleteButtonText = "Delete",
  children,
}) {
  const {
    date,
    showDatePicker,
    setShowDatePicker,
    type,
    setType,
    techniqueNotes,
    techniqueNotesError,
    techniqueNotesTouched,
    handleTechniqueNotesChange,
    handleTechniqueNotesBlur,
    tags,
    setTags,
    onChangeDate,
  } = useFormContext();


  return (
    <KeyboardAwareScrollView style={styles.container}>
      <Text style={commonStyles.label}>Date</Text>
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
          accentColor="#007AFF"
          themeVariant="light"
        />
      )}
      
      {/* Additional fields (duration, professor, etc.) */}
      {additionalFields}
      
      {/* Children for additional custom content */}
      {children}
      
      <Text style={commonStyles.label}>Type</Text>
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

      <Text style={commonStyles.label}>Technique Notes</Text>
      <TextInput 
        style={[
          styles.input, 
          styles.textArea, 
          techniqueNotesError && techniqueNotesTouched && commonStyles.inputError
        ]} 
        multiline 
        value={techniqueNotes} 
        onChangeText={handleTechniqueNotesChange}
        onBlur={handleTechniqueNotesBlur}
        placeholder="What did you learn today?" 
        placeholderTextColor={colors.mutedAccent} 
      />
      {techniqueNotesError && techniqueNotesTouched ? (
        <Text style={commonStyles.errorText}>{techniqueNotesError}</Text>
      ) : null}

      <TagInput tags={tags} onTagsChange={setTags} />

      {/* Rolling Notes - only show if rolling notes props are provided */}
      {rollingNotes !== undefined && setRollingNotes && (
        <>
          <Text style={commonStyles.label}>Rolling / Sparring Notes</Text>
          <TextInput 
            style={[
              styles.input, 
              styles.textArea,
              rollingNotesError && rollingNotesTouched && commonStyles.inputError
            ]} 
            multiline 
            value={rollingNotes} 
            onChangeText={setRollingNotes} 
            onBlur={onRollingNotesBlur}
            placeholder="How did rolling go?" 
            placeholderTextColor={colors.mutedAccent} 
          />
          {rollingNotesError && rollingNotesTouched ? (
            <Text style={commonStyles.errorText}>{rollingNotesError}</Text>
          ) : null}
        </>
      )}

      {/* Delete button only shows for editing, at bottom */}
      {isEditing && (
        <>
          <View style={styles.spacer} />
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteButtonText}>{deleteButtonText}</Text>
          </TouchableOpacity>
          <View style={styles.spacer} />
        </>
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      padding: 20, 
      backgroundColor: colors.primaryBackground 
    },
    datePickerText: {
      fontSize: 16,
      color: colors.primaryText,
      paddingVertical: 8,
    },
    input: { 
      height: 40, 
      marginBottom: 15, 
      paddingHorizontal: 8, 
      borderRadius: 8, 
      backgroundColor: colors.white,
      justifyContent: 'center',
      color: colors.primaryText,
      shadowColor: colors.shadow.color,
      shadowOffset: colors.shadow.offset,
      shadowOpacity: colors.shadow.opacity,
      shadowRadius: colors.shadow.radius,
      elevation: colors.shadow.elevation,
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
      borderRadius: 8,
      backgroundColor: colors.white,
      shadowColor: colors.shadow.color,
      shadowOffset: colors.shadow.offset,
      shadowOpacity: colors.shadow.opacity,
      shadowRadius: colors.shadow.radius,
      elevation: colors.shadow.elevation,
      paddingVertical: 10,
      alignItems: 'center',
      marginHorizontal: 2,
    },
    typeButtonSelected: {
      backgroundColor: colors.accent,
    },
    typeButtonText: {
      color: colors.primaryText,
      fontSize: 14,
    },
    typeButtonTextSelected: {
      color: colors.white,
    },
    spacer: { height: 20 },
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
      backgroundColor: colors.lightGray,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 15,
      shadowColor: colors.shadow.color,
      shadowOffset: colors.shadow.offset,
      shadowOpacity: colors.shadow.opacity,
      shadowRadius: colors.shadow.radius,
      elevation: colors.shadow.elevation,
    },
    compactProFeatureText: {
      fontSize: 14,
      color: colors.mutedAccent,
      textAlign: 'center',
    },
});