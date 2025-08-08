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

import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import TagInput from '../components/TagInput';
import MedalSelector from '../components/MedalSelector';
import useLogFormHandler from '../hooks/useLogFormHandler';
import { FormProvider, useFormContext } from '../contexts/FormContext';
import colors from '../constants/colors';

function CompetitionLogScreenContent() {
  // Competition-specific state (not in context)
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [organization, setOrganization] = useState('');
  const [organizationError, setOrganizationError] = useState('');
  const [organizationTouched, setOrganizationTouched] = useState(false);
  const [weightDivision, setWeightDivision] = useState('');
  const [weightDivisionError, setWeightDivisionError] = useState('');
  const [weightDivisionTouched, setWeightDivisionTouched] = useState(false);
  const [resultsInDivision, setResultsInDivision] = useState('none');
  const [matchesInDivision, setMatchesInDivision] = useState('1');
  const [matchesInDivisionError, setMatchesInDivisionError] = useState('');
  const [matchesInDivisionTouched, setMatchesInDivisionTouched] = useState(false);
  const [matchNotesInDivision, setMatchNotesInDivision] = useState(['']);
  const [competedInOpenClass, setCompetedInOpenClass] = useState(false);
  const [resultsInOpenClass, setResultsInOpenClass] = useState('none');
  const [matchesInOpenClass, setMatchesInOpenClass] = useState('0');
  const [matchesInOpenClassError, setMatchesInOpenClassError] = useState('');
  const [matchesInOpenClassTouched, setMatchesInOpenClassTouched] = useState(false);
  const [matchNotesInOpenClass, setMatchNotesInOpenClass] = useState([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [generalNotesError, setGeneralNotesError] = useState('');
  const [generalNotesTouched, setGeneralNotesTouched] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Get shared form state from context
  const { date, type, tags, updateFormState, onChangeDate, hasUnsavedChanges, markFormAsSaved } = useFormContext();
  
  // Track initial local state for unsaved changes detection
  const initialLocalState = useRef({
    name: '',
    organization: '',
    weightDivision: '',
    resultsInDivision: 'none',
    matchesInDivision: '1',
    matchNotesInDivision: [''],
    competedInOpenClass: false,
    resultsInOpenClass: 'none',
    matchesInOpenClass: '0',
    matchNotesInOpenClass: [],
    generalNotes: '',
  });

  // Combined unsaved changes detection
  const checkForUnsavedChanges = () => {
    // Check context changes
    const contextHasChanges = hasUnsavedChanges;
    
    // Check local state changes
    const localHasChanges = (
      name !== initialLocalState.current.name ||
      organization !== initialLocalState.current.organization ||
      weightDivision !== initialLocalState.current.weightDivision ||
      resultsInDivision !== initialLocalState.current.resultsInDivision ||
      matchesInDivision !== initialLocalState.current.matchesInDivision ||
      JSON.stringify(matchNotesInDivision) !== JSON.stringify(initialLocalState.current.matchNotesInDivision) ||
      competedInOpenClass !== initialLocalState.current.competedInOpenClass ||
      resultsInOpenClass !== initialLocalState.current.resultsInOpenClass ||
      matchesInOpenClass !== initialLocalState.current.matchesInOpenClass ||
      JSON.stringify(matchNotesInOpenClass) !== JSON.stringify(initialLocalState.current.matchNotesInOpenClass) ||
      generalNotes !== initialLocalState.current.generalNotes
    );
    
    return contextHasChanges || localHasChanges;
  };

  // Mark form as saved (reset all dirty state)
  const markAllFormAsSaved = () => {
    // Reset context dirty state
    markFormAsSaved();
    
    // Reset local state tracking
    initialLocalState.current = {
      name,
      organization,
      weightDivision,
      resultsInDivision,
      matchesInDivision,
      matchNotesInDivision: [...matchNotesInDivision],
      competedInOpenClass,
      resultsInOpenClass,
      matchesInOpenClass,
      matchNotesInOpenClass: [...matchNotesInOpenClass],
      generalNotes,
    };
  };

  // Validation functions
  const validateName = (value) => {
    if (!value || !value.trim()) {
      return 'Competition name is required';
    }
    return '';
  };

  const validateOrganization = (value) => {
    if (!value || !value.trim()) {
      return 'Organization is required';
    }
    return '';
  };

  const validateWeightDivision = (value) => {
    if (!value || !value.trim()) {
      return 'Weight division is required';
    }
    return '';
  };

  const validateMatchesInDivision = (value) => {
    if (!value || isNaN(parseInt(value)) || parseInt(value) <= 0) {
      return 'Please enter a valid number of matches';
    }
    return '';
  };

  const validateMatchesInOpenClass = (value) => {
    if (competedInOpenClass && (!value || isNaN(parseInt(value)) || parseInt(value) <= 0)) {
      return 'Please enter a valid number of matches for open class';
    }
    return '';
  };

  const validateGeneralNotes = (value) => {
    if (!value || !value.trim()) {
      return 'General notes are required';
    }
    return '';
  };

  // Validation handlers
  const handleNameChange = (value) => {
    setName(value);
    if (nameTouched) {
      const error = validateName(value);
      setNameError(error);
    }
  };

  const handleNameBlur = () => {
    setNameTouched(true);
    const error = validateName(name);
    setNameError(error);
  };

  const handleOrganizationChange = (value) => {
    setOrganization(value);
    if (organizationTouched) {
      const error = validateOrganization(value);
      setOrganizationError(error);
    }
  };

  const handleOrganizationBlur = () => {
    setOrganizationTouched(true);
    const error = validateOrganization(organization);
    setOrganizationError(error);
  };

  const handleWeightDivisionChange = (value) => {
    setWeightDivision(value);
    if (weightDivisionTouched) {
      const error = validateWeightDivision(value);
      setWeightDivisionError(error);
    }
  };

  const handleWeightDivisionBlur = () => {
    setWeightDivisionTouched(true);
    const error = validateWeightDivision(weightDivision);
    setWeightDivisionError(error);
  };

  const handleMatchesInDivisionChange = (value) => {
    setMatchesInDivision(value);
    if (matchesInDivisionTouched) {
      const error = validateMatchesInDivision(value);
      setMatchesInDivisionError(error);
    }
  };

  const handleMatchesInDivisionBlur = () => {
    setMatchesInDivisionTouched(true);
    const error = validateMatchesInDivision(matchesInDivision);
    setMatchesInDivisionError(error);
  };

  const handleMatchesInOpenClassChange = (value) => {
    setMatchesInOpenClass(value);
    if (matchesInOpenClassTouched) {
      const error = validateMatchesInOpenClass(value);
      setMatchesInOpenClassError(error);
    }
  };

  const handleMatchesInOpenClassBlur = () => {
    setMatchesInOpenClassTouched(true);
    const error = validateMatchesInOpenClass(matchesInOpenClass);
    setMatchesInOpenClassError(error);
  };

  const handleGeneralNotesChange = (value) => {
    setGeneralNotes(value);
    if (generalNotesTouched) {
      const error = validateGeneralNotes(value);
      setGeneralNotesError(error);
    }
  };

  const handleGeneralNotesBlur = () => {
    setGeneralNotesTouched(true);
    const error = validateGeneralNotes(generalNotes);
    setGeneralNotesError(error);
  };

  // Hook configuration
  const { isEditing, handleDelete, handleSaveOrUpdate, setupFormHandler } = useLogFormHandler({
    endpoint: 'competitions',
    itemName: 'competition',
    validateData: (data) => {
      const nameError = validateName(data.name);
      if (nameError) return nameError;
      
      const organizationError = validateOrganization(data.organization);
      if (organizationError) return organizationError;
      
      const weightDivisionError = validateWeightDivision(data.weightDivision);
      if (weightDivisionError) return weightDivisionError;
      
      if (data.resultsInDivision === 'none') return 'Please select your results in the division.';
      
      const matchesInDivisionError = validateMatchesInDivision(data.matchesInDivision);
      if (matchesInDivisionError) return matchesInDivisionError;
      
      const matchesInOpenClassError = validateMatchesInOpenClass(data.matchesInOpenClass);
      if (matchesInOpenClassError) return matchesInOpenClassError;
      
      const generalNotesError = validateGeneralNotes(data.generalNotes);
      if (generalNotesError) return generalNotesError;
      
      return null;
    },
    transformDataForEdit: (competition) => {
      updateFormState({
        date: new Date(competition.date),
        type: competition.type,
        tags: competition.tags.map(t => t.name),
      });
      setName(competition.name || '');
      setNameError('');
      setNameTouched(false);
      setOrganization(competition.organization || '');
      setOrganizationError('');
      setOrganizationTouched(false);
      setWeightDivision(competition.weightDivision || '');
      setWeightDivisionError('');
      setWeightDivisionTouched(false);
      setResultsInDivision(competition.resultsInDivision || 'none');
      setMatchesInDivision(competition.matchesInDivision.toString());
      setMatchesInDivisionError('');
      setMatchesInDivisionTouched(false);
      setMatchNotesInDivision(competition.matchNotesInDivision.map(note => note.notes));
      setCompetedInOpenClass(competition.competedInOpenClass || false);
      setResultsInOpenClass(competition.resultsInOpenClass || 'none');
      setMatchesInOpenClass(competition.matchesInOpenClass.toString());
      setMatchesInOpenClassError('');
      setMatchesInOpenClassTouched(false);
      setMatchNotesInOpenClass(competition.matchNotesInOpenClass.map(note => note.notes));
      setGeneralNotes(competition.generalNotes || '');
      setGeneralNotesError('');
      setGeneralNotesTouched(false);
      
      // Update initial state tracking for editing
      initialLocalState.current = {
        name: competition.name || '',
        organization: competition.organization || '',
        weightDivision: competition.weightDivision || '',
        resultsInDivision: competition.resultsInDivision || 'none',
        matchesInDivision: competition.matchesInDivision.toString(),
        matchNotesInDivision: competition.matchNotesInDivision.map(note => note.notes),
        competedInOpenClass: competition.competedInOpenClass || false,
        resultsInOpenClass: competition.resultsInOpenClass || 'none',
        matchesInOpenClass: competition.matchesInOpenClass.toString(),
        matchNotesInOpenClass: competition.matchNotesInOpenClass.map(note => note.notes),
        generalNotes: competition.generalNotes || '',
      };
    },
    transformDataForSave: (formData) => {
      // Prepare match notes data
      const formattedMatchNotesInDivision = formData.matchNotesInDivision.map((note, index) => ({
        matchNumber: index + 1,
        notes: note
      }));

      const formattedMatchNotesInOpenClass = formData.competedInOpenClass 
        ? formData.matchNotesInOpenClass.map((note, index) => ({
            matchNumber: index + 1,
            notes: note
          }))
        : [];

      return {
        date: formData.date,
        name: formData.name.trim(),
        organization: formData.organization.trim(),
        type: formData.type,
        weightDivision: formData.weightDivision.trim(),
        resultsInDivision: formData.resultsInDivision,
        matchesInDivision: parseInt(formData.matchesInDivision),
        matchNotesInDivision: formattedMatchNotesInDivision,
        competedInOpenClass: formData.competedInOpenClass,
        resultsInOpenClass: formData.competedInOpenClass ? formData.resultsInOpenClass : 'none',
        matchesInOpenClass: formData.competedInOpenClass ? parseInt(formData.matchesInOpenClass) : 0,
        matchNotesInOpenClass: formattedMatchNotesInOpenClass,
        generalNotes: formData.generalNotes,
        tags: formData.tags,
      };
    },
    hasUnsavedChanges: checkForUnsavedChanges,
    markFormAsSaved: markAllFormAsSaved,
  });

  const onChangeDateWrapper = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
    } else {
      onChangeDate(event, selectedDate);
      // On Android, close the picker immediately after selection
      // On iOS, keep it open so users can continue adjusting
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
    }
  };

  // Update match notes arrays when number of matches changes
  const updateMatchesInDivision = (value) => {
    handleMatchesInDivisionChange(value);
    const numMatches = parseInt(value) || 0;
    const newNotes = Array(numMatches).fill('').map((_, index) => 
      matchNotesInDivision[index] || ''
    );
    setMatchNotesInDivision(newNotes);
  };

  const updateMatchesInOpenClass = (value) => {
    handleMatchesInOpenClassChange(value);
    const numMatches = parseInt(value) || 0;
    const newNotes = Array(numMatches).fill('').map((_, index) => 
      matchNotesInOpenClass[index] || ''
    );
    setMatchNotesInOpenClass(newNotes);
  };

  const updateMatchNoteInDivision = (index, note) => {
    const newNotes = [...matchNotesInDivision];
    newNotes[index] = note;
    setMatchNotesInDivision(newNotes);
  };

  const updateMatchNoteInOpenClass = (index, note) => {
    const newNotes = [...matchNotesInOpenClass];
    newNotes[index] = note;
    setMatchNotesInOpenClass(newNotes);
  };

  // Create save handler using the hook
  const handleSave = async () => {
    const formData = {
      date,
      name,
      organization,
      type,
      weightDivision,
      resultsInDivision,
      matchesInDivision,
      matchNotesInDivision,
      competedInOpenClass,
      resultsInOpenClass,
      matchesInOpenClass,
      matchNotesInOpenClass,
      generalNotes,
      tags,
    };
    
    await handleSaveOrUpdate(formData);
  };

  // Setup the form handler for header buttons
  setupFormHandler(handleSave);

  return (
    <KeyboardAwareScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 80 : 20 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      keyboardOpeningTime={0}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)}>
        <View style={styles.input}>
            <Text style={styles.datePickerText}>{date.toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          onChange={onChangeDateWrapper}
          textColor="#333333"
          accentColor="#007AFF"
          themeVariant="light"
          style={styles.datePicker}
        />
      )}

      <Text style={styles.label}>Competition Name</Text>
      <TextInput 
        style={[
          styles.input,
          nameError && nameTouched && { borderWidth: 1, borderColor: colors.destructive }
        ]} 
        value={name} 
        onChangeText={handleNameChange}
        onBlur={handleNameBlur}
        placeholder="Name of the competition" 
        placeholderTextColor={colors.mutedAccent} 
      />
      {nameError && nameTouched ? (
        <Text style={styles.errorText}>{nameError}</Text>
      ) : null}

      <Text style={styles.label}>Organization</Text>
      <TextInput 
        style={[
          styles.input,
          organizationError && organizationTouched && { borderWidth: 1, borderColor: colors.destructive }
        ]} 
        value={organization} 
        onChangeText={handleOrganizationChange}
        onBlur={handleOrganizationBlur}
        placeholder="e.g., IBJJF, NAGA, etc." 
        placeholderTextColor={colors.mutedAccent} 
      />
      {organizationError && organizationTouched ? (
        <Text style={styles.errorText}>{organizationError}</Text>
      ) : null}
      
      <Text style={styles.label}>Type</Text>
      <View style={styles.buttonGroup}>
        {['Gi', 'No-Gi'].map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.typeButton, type === t && styles.typeButtonSelected]} 
              onPress={() => updateFormState({ type: t })}
            >
              <Text style={[styles.typeButtonText, type === t && styles.typeButtonTextSelected]}>{t}</Text>
            </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Weight Division</Text>
      <TextInput 
        style={[
          styles.input,
          weightDivisionError && weightDivisionTouched && { borderWidth: 1, borderColor: colors.destructive }
        ]} 
        value={weightDivision} 
        onChangeText={handleWeightDivisionChange}
        onBlur={handleWeightDivisionBlur}
        placeholder="e.g., Lightweight, 155lbs, etc." 
        placeholderTextColor={colors.mutedAccent} 
      />
      {weightDivisionError && weightDivisionTouched ? (
        <Text style={styles.errorText}>{weightDivisionError}</Text>
      ) : null}

      <Text style={styles.label}>Results in Your Division</Text>
      <MedalSelector 
        value={resultsInDivision} 
        onSelect={setResultsInDivision} 
      />

      <Text style={styles.label}>Number of Matches in Your Division</Text>
      <TextInput 
        style={[
          styles.input,
          matchesInDivisionError && matchesInDivisionTouched && { borderWidth: 1, borderColor: colors.destructive }
        ]} 
        value={matchesInDivision} 
        onChangeText={updateMatchesInDivision}
        onBlur={handleMatchesInDivisionBlur}
        keyboardType="numeric" 
        placeholder="e.g., 3" 
        placeholderTextColor={colors.mutedAccent} 
      />
      {matchesInDivisionError && matchesInDivisionTouched ? (
        <Text style={styles.errorText}>{matchesInDivisionError}</Text>
      ) : null}

      {/* Division Match Notes */}
      {parseInt(matchesInDivision) > 0 && (
        <>
          <Text style={styles.sectionTitle}>Match Notes (Division)</Text>
          {matchNotesInDivision.map((note, index) => (
            <View key={index}>
              <Text style={styles.label}>Match {index + 1} Notes</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                multiline 
                value={note} 
                onChangeText={(text) => updateMatchNoteInDivision(index, text)} 
                placeholder={`Notes for match ${index + 1}...`} 
                placeholderTextColor={colors.mutedAccent} 
              />
            </View>
          ))}
        </>
      )}

      {/* Open Class Section */}
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Did you compete in Open Class?</Text>
        <Switch
          value={competedInOpenClass}
          onValueChange={setCompetedInOpenClass}
          trackColor={{ false: colors.mutedAccent, true: colors.accent }}
          thumbColor={competedInOpenClass ? colors.white : colors.white}
        />
      </View>

      {competedInOpenClass && (
        <>
          <Text style={styles.label}>Results in Open Class</Text>
          <MedalSelector 
            value={resultsInOpenClass} 
            onSelect={setResultsInOpenClass} 
          />

          <Text style={styles.label}>Number of Matches in Open Class</Text>
          <TextInput 
            style={[
              styles.input,
              matchesInOpenClassError && matchesInOpenClassTouched && { borderWidth: 1, borderColor: colors.destructive }
            ]} 
            value={matchesInOpenClass} 
            onChangeText={updateMatchesInOpenClass}
            onBlur={handleMatchesInOpenClassBlur}
            keyboardType="numeric" 
            placeholder="e.g., 2" 
            placeholderTextColor={colors.mutedAccent} 
          />
          {matchesInOpenClassError && matchesInOpenClassTouched ? (
            <Text style={styles.errorText}>{matchesInOpenClassError}</Text>
          ) : null}

          {/* Open Class Match Notes */}
          {parseInt(matchesInOpenClass) > 0 && (
            <>
              <Text style={styles.sectionTitle}>Match Notes (Open Class)</Text>
              {matchNotesInOpenClass.map((note, index) => (
                <View key={index}>
                  <Text style={styles.label}>Open Class Match {index + 1} Notes</Text>
                  <TextInput 
                    style={[styles.input, styles.textArea]} 
                    multiline 
                    value={note} 
                    onChangeText={(text) => updateMatchNoteInOpenClass(index, text)} 
                    placeholder={`Notes for open class match ${index + 1}...`} 
                    placeholderTextColor={colors.mutedAccent} 
                  />
                </View>
              ))}
            </>
          )}
        </>
      )}

      <Text style={styles.label}>General Notes</Text>
      <TextInput 
        style={[
          styles.input, 
          styles.textArea,
          generalNotesError && generalNotesTouched && { borderWidth: 1, borderColor: colors.destructive }
        ]} 
        multiline 
        value={generalNotes} 
        onChangeText={handleGeneralNotesChange}
        onBlur={handleGeneralNotesBlur}
        placeholder="Overall thoughts about the competition..." 
        placeholderTextColor={colors.mutedAccent} 
      />
      {generalNotesError && generalNotesTouched ? (
        <Text style={styles.errorText}>{generalNotesError}</Text>
      ) : null}

      <TagInput tags={tags} onTagsChange={(newTags) => updateFormState({ tags: newTags })} />

      <View style={styles.spacer} />
      <View style={styles.spacer} />
      
      {isEditing && (
         <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
           <Text style={styles.deleteButtonText}>Delete Competition</Text>
         </TouchableOpacity>
      )}
       <View style={styles.spacer} />
    </KeyboardAwareScrollView>
  );
}

export default function CompetitionLogScreen() {
  return (
    <FormProvider>
      <CompetitionLogScreenContent />
    </FormProvider>
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
    sectionTitle: {
      fontSize: 18,
      marginTop: 15,
      marginBottom: 10,
      fontWeight: 'bold',
      color: colors.primaryText,
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
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
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
    errorText: {
      fontSize: 12,
      color: colors.destructive,
      marginTop: -12,
      marginBottom: 12,
      marginLeft: 4,
    },
    datePicker: {
      alignSelf: 'center',
      marginVertical: 10,
    },
});