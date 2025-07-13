import React, { useState } from 'react';
import { TextInput, StyleSheet, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiClient from '../api/client';
import LogFormLayout from '../components/LogFormLayout';
import colors from '../constants/colors';

export default function SessionLogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionToEdit = params.id ? (() => {
    try {
      return JSON.parse(params.session);
    } catch (e) {
      console.error('Invalid session data:', e);
      return null;
    }
  })() : null;

  const [date, setDate] = useState(sessionToEdit ? new Date(sessionToEdit.date) : new Date());
  const [duration, setDuration] = useState(sessionToEdit ? sessionToEdit.duration.toString() : '1.5');
  const [type, setType] = useState(sessionToEdit ? sessionToEdit.type : 'Gi');
  const [techniqueNotes, setTechniqueNotes] = useState(sessionToEdit ? sessionToEdit.techniqueNotes : '');
  const [rollingNotes, setRollingNotes] = useState(sessionToEdit ? sessionToEdit.rollingNotes : '');
  const [tags, setTags] = useState(sessionToEdit ? sessionToEdit.tags.map(t => t.name) : []);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const isEditing = !!sessionToEdit;


  const handleSaveOrUpdate = async () => {
    if (!duration || isNaN(parseFloat(duration))) {
      Alert.alert('Invalid Input', 'Please enter a valid duration in hours.');
      return;
    }

    const sessionData = {
      date,
      duration: parseFloat(duration),
      type,
      techniqueNotes,
      rollingNotes,
      tags,
    };

    try {
      if (isEditing) {
        await apiClient.put(`/sessions/${sessionToEdit._id}`, sessionData);
      } else {
        await apiClient.post('/sessions', sessionData);
      }
      router.back();
    } catch (error) {
      console.error('Failed to save session', error);
      Alert.alert('Save Failed', 'Could not save the session. Please try again.');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Session",
      "Are you sure you want to permanently delete this session log?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await apiClient.delete(`/sessions/${sessionToEdit._id}`);
            router.back();
          } catch (error) {
            console.error('Failed to delete session', error);
            Alert.alert('Delete Failed', 'Could not delete the session.');
          }
        }}
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  // Additional fields specific to sessions
  const additionalFields = (
    <>
      <Text style={styles.label}>Duration (in hours)</Text>
      <TextInput 
        style={styles.input} 
        value={duration} 
        onChangeText={setDuration} 
        keyboardType="numeric" 
        placeholder="e.g., 1.5 for 90 minutes" 
        placeholderTextColor={colors.mutedAccent} 
      />
      
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
  );

  return (
    <LogFormLayout
      date={date}
      setDate={setDate}
      typeOptions={['Gi', 'No-Gi', 'Open Mat']}
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
      saveButtonText={isEditing ? "Save Changes" : "Save Session"}
      deleteButtonText="Delete Session"
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
    textArea: { 
      height: 100, 
      textAlignVertical: 'top',
      paddingTop: 8,
    },
});