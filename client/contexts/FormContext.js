import React, { createContext, useContext, useState, useRef } from 'react';
import { Platform } from 'react-native';

const FormContext = createContext(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

const FormProvider = ({ children }) => {
  // Shared form state
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState('Gi');
  const [techniqueNotes, setTechniqueNotes] = useState('');
  const [techniqueNotesError, setTechniqueNotesError] = useState('');
  const [techniqueNotesTouched, setTechniqueNotesTouched] = useState(false);
  const [tags, setTags] = useState([]);
  const [showPaywall, setShowPaywall] = useState(false);

  // Unsaved changes tracking
  const initialFormState = useRef({
    date: new Date(),
    type: 'Gi',
    techniqueNotes: '',
    tags: [],
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Validation functions
  const validateTechniqueNotes = (value) => {
    if (!value || !value.trim()) {
      return 'Technique notes are required';
    }
    return '';
  };

  // Date picker handlers
  const onChangeDate = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
    } else if (selectedDate) {
      setDate(selectedDate);
      // On Android, close the picker immediately after selection
      // On iOS, keep it open so users can continue adjusting
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
    }
  };

  // Technique notes handlers with validation and change detection
  const handleTechniqueNotesChange = (value) => {
    setTechniqueNotes(value);
    if (techniqueNotesTouched) {
      const error = validateTechniqueNotes(value);
      setTechniqueNotesError(error);
    }
    
    // Check for changes
    setTimeout(() => {
      checkForChanges({ date, type, techniqueNotes: value, tags });
    }, 0);
  };

  const handleTechniqueNotesBlur = () => {
    setTechniqueNotesTouched(true);
    const error = validateTechniqueNotes(techniqueNotes);
    setTechniqueNotesError(error);
  };

  // Helper function to check if form has changed
  const checkForChanges = (currentState) => {
    const initial = initialFormState.current;
    const hasChanges = (
      currentState.date.getTime() !== initial.date.getTime() ||
      currentState.type !== initial.type ||
      currentState.techniqueNotes !== initial.techniqueNotes ||
      JSON.stringify(currentState.tags.sort()) !== JSON.stringify(initial.tags.sort())
    );
    setHasUnsavedChanges(hasChanges);
    return hasChanges;
  };

  // Update form state with change detection
  const updateFormState = (updates) => {
    if (updates.date !== undefined) setDate(updates.date);
    if (updates.type !== undefined) setType(updates.type);
    if (updates.techniqueNotes !== undefined) {
      setTechniqueNotes(updates.techniqueNotes);
      setTechniqueNotesError('');
      setTechniqueNotesTouched(false);
    }
    if (updates.tags !== undefined) setTags(updates.tags);

    // Check for changes after state updates
    setTimeout(() => {
      const currentState = {
        date: updates.date !== undefined ? updates.date : date,
        type: updates.type !== undefined ? updates.type : type,
        techniqueNotes: updates.techniqueNotes !== undefined ? updates.techniqueNotes : techniqueNotes,
        tags: updates.tags !== undefined ? updates.tags : tags,
      };
      checkForChanges(currentState);
    }, 0);
  };

  // Reset form state and initial tracking
  const resetForm = (initialState = {}) => {
    const newInitialState = {
      date: initialState.date || new Date(),
      type: initialState.type || 'Gi',
      techniqueNotes: initialState.techniqueNotes || '',
      tags: initialState.tags || [],
    };

    // Update current state
    setDate(newInitialState.date);
    setShowDatePicker(false);
    setType(newInitialState.type);
    setTechniqueNotes(newInitialState.techniqueNotes);
    setTechniqueNotesError('');
    setTechniqueNotesTouched(false);
    setTags(newInitialState.tags);
    setShowPaywall(false);

    // Update initial state reference
    initialFormState.current = { ...newInitialState };
    setHasUnsavedChanges(false);
  };

  // Mark form as saved (reset dirty state)
  const markFormAsSaved = () => {
    initialFormState.current = {
      date,
      type,
      techniqueNotes,
      tags: [...tags],
    };
    setHasUnsavedChanges(false);
  };

  const value = {
    // Form state
    date,
    setDate,
    showDatePicker,
    setShowDatePicker,
    type,
    setType,
    techniqueNotes,
    setTechniqueNotes,
    techniqueNotesError,
    techniqueNotesTouched,
    tags,
    setTags,
    showPaywall,
    setShowPaywall,
    
    // Unsaved changes tracking
    hasUnsavedChanges,
    setHasUnsavedChanges,
    checkForChanges,
    markFormAsSaved,
    
    // Handlers
    onChangeDate,
    handleTechniqueNotesChange,
    handleTechniqueNotesBlur,
    validateTechniqueNotes,
    updateFormState,
    resetForm,
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

FormProvider.displayName = 'FormProvider';

export { FormProvider };