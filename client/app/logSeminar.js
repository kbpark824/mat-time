import React, { useState } from 'react';
import { TextInput, StyleSheet, Text } from 'react-native';
import LogFormLayout from '../components/LogFormLayout';
import useLogFormHandler from '../hooks/useLogFormHandler';
import colors from '../constants/colors';

export default function SeminarLogScreen() {
  // Form state
  const [date, setDate] = useState(new Date());
  const [professorName, setProfessorName] = useState('');
  const [type, setType] = useState('Gi');
  const [techniqueNotes, setTechniqueNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [showPaywall, setShowPaywall] = useState(false);

  // Hook configuration
  const { isEditing, handleDelete, handleSaveOrUpdate, setupFormHandler } = useLogFormHandler({
    endpoint: 'seminars',
    itemName: 'seminar',
    validateData: (data) => {
      if (!data.professorName.trim()) {
        return 'Please enter the professor/instructor name.';
      }
      return null;
    },
    transformDataForEdit: (seminar) => {
      setDate(new Date(seminar.date));
      setProfessorName(seminar.professorName || '');
      setType(seminar.type);
      setTechniqueNotes(seminar.techniqueNotes || '');
      setTags(seminar.tags.map(t => t.name));
    },
    transformDataForSave: (formData) => ({
      date: formData.date,
      professorName: formData.professorName.trim(),
      type: formData.type,
      techniqueNotes: formData.techniqueNotes,
      tags: formData.tags,
    })
  });

  // Create save handler with form data
  const handleSave = async () => {
    const formData = {
      date,
      professorName,
      type,
      techniqueNotes,
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
        style={styles.input} 
        value={professorName} 
        onChangeText={setProfessorName} 
        placeholder="Who taught this seminar?" 
        placeholderTextColor={colors.mutedAccent} 
      />
    </>
  );

  return (
    <LogFormLayout
      date={date}
      setDate={setDate}
      typeOptions={['Gi', 'No-Gi']}
      type={type}
      setType={setType}
      techniqueNotes={techniqueNotes}
      setTechniqueNotes={setTechniqueNotes}
      tags={tags}
      setTags={setTags}
      additionalFields={additionalFields}
      onDelete={handleDelete}
      isEditing={isEditing}
      deleteButtonText="Delete Seminar"
      showPaywall={showPaywall}
      setShowPaywall={setShowPaywall}
    />
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
});