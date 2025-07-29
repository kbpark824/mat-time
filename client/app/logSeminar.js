import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Text, Switch } from 'react-native';
import LogFormLayout from '../components/LogFormLayout';
import useLogFormHandler from '../hooks/useLogFormHandler';
import { FormProvider, useFormContext } from '../contexts/FormContext';
import colors from '../constants/colors';

function SeminarLogScreenContent() {
  // Seminar-specific state (not in context)
  const [professorName, setProfessorName] = useState('');
  const [professorNameError, setProfessorNameError] = useState('');
  const [professorNameTouched, setProfessorNameTouched] = useState(false);
  const [hasRollingPortion, setHasRollingPortion] = useState(false);
  const [rollingNotes, setRollingNotes] = useState('');
  const [rollingNotesError, setRollingNotesError] = useState('');
  const [rollingNotesTouched, setRollingNotesTouched] = useState(false);
  
  // Get shared form state from context
  const { date, type, techniqueNotes, tags, updateFormState, hasUnsavedChanges, markFormAsSaved } = useFormContext();
  
  // Track initial local state for unsaved changes detection
  const initialLocalState = useRef({
    professorName: '',
    hasRollingPortion: false,
    rollingNotes: '',
  });

  // Validation functions
  const validateProfessorName = (value) => {
    if (!value || !value.trim()) {
      return 'Professor/Instructor name is required';
    }
    return '';
  };

  const validateRollingNotes = (value) => {
    if (hasRollingPortion && (!value || !value.trim())) {
      return 'Rolling notes are required when rolling portion is enabled';
    }
    return '';
  };

  // Combined unsaved changes detection
  const checkForUnsavedChanges = () => {
    // Check context changes
    const contextHasChanges = hasUnsavedChanges;
    
    // Check local state changes
    const localHasChanges = (
      professorName !== initialLocalState.current.professorName ||
      hasRollingPortion !== initialLocalState.current.hasRollingPortion ||
      rollingNotes !== initialLocalState.current.rollingNotes
    );
    
    return contextHasChanges || localHasChanges;
  };

  // Mark form as saved (reset all dirty state)
  const markAllFormAsSaved = () => {
    // Reset context dirty state
    markFormAsSaved();
    
    // Reset local state tracking
    initialLocalState.current = {
      professorName,
      hasRollingPortion,
      rollingNotes,
    };
  };

  // Validation handlers with change detection
  const handleProfessorNameChange = (value) => {
    setProfessorName(value);
    if (professorNameTouched) {
      const error = validateProfessorName(value);
      setProfessorNameError(error);
    }
  };

  const handleProfessorNameBlur = () => {
    setProfessorNameTouched(true);
    const error = validateProfessorName(professorName);
    setProfessorNameError(error);
  };

  const handleRollingNotesChange = (value) => {
    setRollingNotes(value);
    if (rollingNotesTouched) {
      const error = validateRollingNotes(value);
      setRollingNotesError(error);
    }
  };

  const handleRollingNotesBlur = () => {
    setRollingNotesTouched(true);
    const error = validateRollingNotes(rollingNotes);
    setRollingNotesError(error);
  };

  // Hook configuration
  const { isEditing, handleDelete, handleSaveOrUpdate, setupFormHandler } = useLogFormHandler({
    endpoint: 'seminars',
    itemName: 'seminar',
    validateData: (data) => {
      const professorError = validateProfessorName(data.professorName);
      if (professorError) return professorError;
      
      const rollingNotesError = validateRollingNotes(data.rollingNotes);
      if (rollingNotesError) return rollingNotesError;
      
      return null;
    },
    transformDataForEdit: (seminar) => {
      updateFormState({
        date: new Date(seminar.date),
        type: seminar.type,
        techniqueNotes: seminar.techniqueNotes || '',
        tags: seminar.tags.map(t => t.name),
      });
      setProfessorName(seminar.professorName || '');
      setProfessorNameError('');
      setProfessorNameTouched(false);
      setHasRollingPortion(!!seminar.rollingNotes);
      setRollingNotes(seminar.rollingNotes || '');
      setRollingNotesError('');
      setRollingNotesTouched(false);
      
      // Update initial state tracking for editing
      initialLocalState.current = {
        professorName: seminar.professorName || '',
        hasRollingPortion: !!seminar.rollingNotes,
        rollingNotes: seminar.rollingNotes || '',
      };
    },
    transformDataForSave: (formData) => ({
      date: formData.date,
      professorName: formData.professorName.trim(),
      type: formData.type,
      techniqueNotes: formData.techniqueNotes,
      rollingNotes: formData.hasRollingPortion ? formData.rollingNotes : '',
      tags: formData.tags,
    }),
    hasUnsavedChanges: checkForUnsavedChanges,
    markFormAsSaved: markAllFormAsSaved,
  });

  // Create save handler with form data
  const handleSave = async () => {
    const formData = {
      date,
      professorName,
      type,
      techniqueNotes,
      hasRollingPortion,
      rollingNotes,
      tags,
    };
    
    await handleSaveOrUpdate(formData);
  };

  // Setup the form handler
  setupFormHandler(handleSave);

  // Additional fields specific to seminars
  const additionalFields = (
    <>
      <Text style={styles.label}>Professor/Instructor</Text>
      <TextInput 
        style={[
          styles.input,
          professorNameError && professorNameTouched && { borderWidth: 1, borderColor: colors.destructive }
        ]} 
        value={professorName} 
        onChangeText={handleProfessorNameChange}
        onBlur={handleProfessorNameBlur}
        placeholder="Who taught this seminar?" 
        placeholderTextColor={colors.mutedAccent} 
      />
      {professorNameError && professorNameTouched ? (
        <Text style={styles.errorText}>{professorNameError}</Text>
      ) : null}
      
      {/* Rolling Portion Toggle */}
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Was there a rolling portion?</Text>
        <Switch
          value={hasRollingPortion}
          onValueChange={setHasRollingPortion}
          trackColor={{ false: colors.mutedAccent, true: colors.accent }}
          thumbColor={hasRollingPortion ? colors.white : colors.white}
        />
      </View>
    </>
  );

  return (
    <LogFormLayout
      typeOptions={['Gi', 'No-Gi']}
      rollingNotes={hasRollingPortion ? rollingNotes : undefined}
      setRollingNotes={hasRollingPortion ? handleRollingNotesChange : undefined}
      rollingNotesError={hasRollingPortion ? rollingNotesError : undefined}
      rollingNotesTouched={hasRollingPortion ? rollingNotesTouched : undefined}
      onRollingNotesBlur={hasRollingPortion ? handleRollingNotesBlur : undefined}
      additionalFields={additionalFields}
      onDelete={handleDelete}
      isEditing={isEditing}
      deleteButtonText="Delete Seminar"
    />
  );
}

export default function SeminarLogScreen() {
  return (
    <FormProvider>
      <SeminarLogScreenContent />
    </FormProvider>
  );
}

const styles = StyleSheet.create({
    label: { 
      fontSize: 16, 
      marginBottom: 5, 
      fontWeight: 'bold', 
      color: colors.primaryText 
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
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    errorText: {
      fontSize: 12,
      color: colors.destructive,
      marginTop: -12,
      marginBottom: 12,
      marginLeft: 4,
    },
});