import React, { useState } from 'react';
import { TextInput, StyleSheet, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiClient from '../api/client';
import LogFormLayout from '../components/LogFormLayout';
import colors from '../constants/colors';

export default function SeminarLogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const seminarToEdit = params.id ? (() => {
    try {
      return JSON.parse(params.seminar);
    } catch (e) {
      console.error('Invalid seminar data:', e);
      return null;
    }
  })() : null;

  const [date, setDate] = useState(seminarToEdit ? new Date(seminarToEdit.date) : new Date());
  const [professorName, setProfessorName] = useState(seminarToEdit ? seminarToEdit.professorName : '');
  const [type, setType] = useState(seminarToEdit ? seminarToEdit.type : 'Gi');
  const [techniqueNotes, setTechniqueNotes] = useState(seminarToEdit ? seminarToEdit.techniqueNotes : '');
  const [tags, setTags] = useState(seminarToEdit ? seminarToEdit.tags.map(t => t.name) : []);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const isEditing = !!seminarToEdit;


  const handleSaveOrUpdate = async () => {
    if (!professorName.trim()) {
      Alert.alert('Invalid Input', 'Please enter the professor/instructor name.');
      return;
    }

    const seminarData = {
      date,
      professorName: professorName.trim(),
      type,
      techniqueNotes,
      tags,
    };

    try {
      if (isEditing) {
        await apiClient.put(`/seminars/${seminarToEdit._id}`, seminarData);
      } else {
        await apiClient.post('/seminars', seminarData);
      }
      router.back();
    } catch (error) {
      console.error('Failed to save seminar', error);
      Alert.alert('Save Failed', 'Could not save the seminar. Please try again.');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Seminar",
      "Are you sure you want to permanently delete this seminar log?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await apiClient.delete(`/seminars/${seminarToEdit._id}`);
            router.back();
          } catch (error) {
            console.error('Failed to delete seminar', error);
            Alert.alert('Delete Failed', 'Could not delete the seminar.');
          }
        }}
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };


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
      onSave={handleSaveOrUpdate}
      onDelete={handleDelete}
      onCancel={handleCancel}
      isEditing={isEditing}
      saveButtonText={isEditing ? "Save Changes" : "Save Seminar"}
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
      borderColor: colors.mutedAccent, 
      borderWidth: 1, 
      marginBottom: 15, 
      paddingHorizontal: 8, 
      borderRadius: 5, 
      backgroundColor: colors.white,
      justifyContent: 'center',
      color: colors.primaryText,
    },
});