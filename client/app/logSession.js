import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LogFormLayout from '../components/LogFormLayout';
import useLogFormHandler from '../hooks/useLogFormHandler';
import { FormProvider, useFormContext } from '../contexts/FormContext';
import colors from '../constants/colors';

function SessionLogScreenContent() {
  // Session-specific state (not in context)
  const [duration, setDuration] = useState(1.5);
  const [durationError, setDurationError] = useState('');
  const [durationTouched, setDurationTouched] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [rollingNotes, setRollingNotes] = useState('');
  const [rollingNotesError, setRollingNotesError] = useState('');
  const [rollingNotesTouched, setRollingNotesTouched] = useState(false);
  
  // Get shared form state from context
  const { date, type, techniqueNotes, tags, updateFormState, hasUnsavedChanges, markFormAsSaved } = useFormContext();
  
  // Track initial local state for unsaved changes detection
  const initialLocalState = useRef({
    duration: 1.5,
    rollingNotes: '',
  });

  // Validation functions
  const validateDuration = (value) => {
    if (!value || value <= 0) {
      return 'Duration is required and must be greater than 0';
    }
    return '';
  };

  const validateRollingNotes = (value) => {
    if (!value || !value.trim()) {
      return 'Rolling notes are required';
    }
    return '';
  };

  // Combined unsaved changes detection
  const checkForUnsavedChanges = () => {
    // Check context changes
    const contextHasChanges = hasUnsavedChanges;
    
    // Check local state changes
    const localHasChanges = (
      duration !== initialLocalState.current.duration ||
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
      duration,
      rollingNotes,
    };
  };

  // Validation handlers with change detection
  const handleDurationChange = (value) => {
    setDuration(value);
    if (durationTouched) {
      const error = validateDuration(value);
      setDurationError(error);
    }
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
    endpoint: 'sessions',
    itemName: 'session',
    validateData: (data) => {
      const durationError = validateDuration(data.duration);
      if (durationError) return durationError;
      
      const rollingNotesError = validateRollingNotes(data.rollingNotes);
      if (rollingNotesError) return rollingNotesError;
      
      return null;
    },
    transformDataForEdit: (session) => {
      updateFormState({
        date: new Date(session.date),
        type: session.type,
        techniqueNotes: session.techniqueNotes || '',
        tags: session.tags.map(t => t.name),
      });
      setDuration(session.duration);
      setDurationError('');
      setDurationTouched(false);
      setRollingNotes(session.rollingNotes || '');
      setRollingNotesError('');
      setRollingNotesTouched(false);
      
      // Update initial state tracking for editing
      initialLocalState.current = {
        duration: session.duration,
        rollingNotes: session.rollingNotes || '',
      };
    },
    transformDataForSave: (formData) => ({
      date: formData.date,
      duration: formData.duration,
      type: formData.type,
      techniqueNotes: formData.techniqueNotes,
      rollingNotes: formData.rollingNotes,
      tags: formData.tags,
    }),
    hasUnsavedChanges: checkForUnsavedChanges,
    markFormAsSaved: markAllFormAsSaved,
  });

  // Create save handler with form data
  const handleSave = async () => {
    const formData = {
      date,
      duration,
      type,
      techniqueNotes,
      rollingNotes,
      tags,
    };
    
    await handleSaveOrUpdate(formData);
  };

  // Setup the form handler
  setupFormHandler(handleSave);

  // Generate duration options (15 min increments from 15 min to 4 hours)
  const generateDurationOptions = () => {
    const options = [];
    for (let i = 0.25; i <= 4; i += 0.25) {
      const hours = Math.floor(i);
      const minutes = (i % 1) * 60;
      let label;
      
      if (hours === 0) {
        label = `${minutes} min`;
      } else if (minutes === 0) {
        label = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      } else {
        label = `${hours}h ${minutes}m`;
      }
      
      options.push({ value: i, label });
    }
    return options;
  };

  const durationOptions = generateDurationOptions();
  const selectedDurationLabel = durationOptions.find(opt => opt.value === duration)?.label || `${duration} hours`;

  // Convert duration (in hours) to Date object for DateTimePicker
  const durationToDate = (durationHours) => {
    const totalMinutes = durationHours * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    return date;
  };

  // Convert Date object back to duration in hours
  const dateToDuration = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours + (minutes / 60);
  };

  const onChangeDuration = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowDurationPicker(false);
    } else if (selectedDate) {
      const newDuration = dateToDuration(selectedDate);
      handleDurationChange(newDuration);
      setDurationTouched(true);
    }
  };

  // Additional fields specific to sessions (duration picker)
  const additionalFields = (
    <>
      <Text style={styles.label}>Duration</Text>
      <TouchableOpacity 
        onPress={() => setShowDurationPicker(true)} 
        style={[
          styles.input,
          durationError && durationTouched && { borderWidth: 1, borderColor: colors.destructive }
        ]}
      >
        <Text style={styles.durationPickerText}>{selectedDurationLabel}</Text>
      </TouchableOpacity>
      {durationError && durationTouched ? (
        <Text style={styles.errorText}>{durationError}</Text>
      ) : null}

      {showDurationPicker && (
        <DateTimePicker
          value={durationToDate(duration)}
          mode="countdown"
          is24Hour={true}
          onChange={onChangeDuration}
          style={styles.datePicker}
          textColor="#333333"
          accentColor="#007AFF"
          themeVariant="light"
        />
      )}
    </>
  );

  return (
    <LogFormLayout
      typeOptions={['Gi', 'No-Gi', 'Open Mat']}
      rollingNotes={rollingNotes}
      setRollingNotes={handleRollingNotesChange}
      rollingNotesError={rollingNotesError}
      rollingNotesTouched={rollingNotesTouched}
      onRollingNotesBlur={handleRollingNotesBlur}
      additionalFields={additionalFields}
      onDelete={handleDelete}
      isEditing={isEditing}
      deleteButtonText="Delete Session"
    />
  );
}

export default function SessionLogScreen() {
  return (
    <FormProvider>
      <SessionLogScreenContent />
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
      shadowColor: colors.shadow.color,
      shadowOffset: colors.shadow.offset,
      shadowOpacity: colors.shadow.opacity,
      shadowRadius: colors.shadow.radius,
      elevation: colors.shadow.elevation,
      justifyContent: 'center',
      color: colors.primaryText,
    },
    durationPickerText: {
      fontSize: 16,
      color: colors.primaryText,
      paddingVertical: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.primaryBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: '60%',
      minHeight: 400,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.mutedAccent,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primaryText,
    },
    cancelButtonText: {
      fontSize: 16,
      color: colors.mutedAccent,
    },
    doneButtonText: {
      fontSize: 16,
      color: colors.accent,
      fontWeight: '600',
    },
    datePicker: {
      alignSelf: 'center',
      marginVertical: 10,
    },
    textArea: { 
      height: 100, 
      textAlignVertical: 'top',
      paddingTop: 8,
    },
    errorText: {
      fontSize: 12,
      color: colors.destructive,
      marginTop: -12,
      marginBottom: 12,
      marginLeft: 4,
    },
});