import React, { useState, useRef, useImperativeHandle } from 'react';
import { TextInput, StyleSheet, Text, Alert, View, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiClient from '../api/client';
import LogFormLayout from '../components/LogFormLayout';
import colors from '../constants/colors';

export default function SessionLogScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const screenRef = useRef();
  const sessionToEdit = params.id && params.data ? (() => {
    try {
      return JSON.parse(params.data);
    } catch (e) {
      console.error('Invalid session data:', e);
      return null;
    }
  })() : null;

  const [date, setDate] = useState(sessionToEdit ? new Date(sessionToEdit.date) : new Date());
  const [duration, setDuration] = useState(sessionToEdit ? sessionToEdit.duration : 1.5);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [type, setType] = useState(sessionToEdit ? sessionToEdit.type : 'Gi');
  const [techniqueNotes, setTechniqueNotes] = useState(sessionToEdit ? sessionToEdit.techniqueNotes : '');
  const [rollingNotes, setRollingNotes] = useState(sessionToEdit ? sessionToEdit.rollingNotes : '');
  const [tags, setTags] = useState(sessionToEdit ? sessionToEdit.tags.map(t => t.name) : []);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const isEditing = !!sessionToEdit;


  const handleSaveOrUpdate = async () => {
    if (!duration || duration <= 0) {
      Alert.alert('Invalid Input', 'Please select a valid duration.');
      return;
    }

    const sessionData = {
      date,
      duration: duration,
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

  // Expose handleSave to the header button via ref
  useImperativeHandle(screenRef, () => ({
    handleSave: handleSaveOrUpdate
  }));

  // Set the screen ref in navigation params so header can access it
  React.useEffect(() => {
    navigation.setParams({ screenRef });
  }, [navigation]);

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
      setDuration(newDuration);
    }
  };

  // Additional fields specific to sessions (duration picker)
  const additionalFields = (
    <>
      <Text style={styles.label}>Duration</Text>
      <TouchableOpacity onPress={() => setShowDurationPicker(true)} style={styles.input}>
        <Text style={styles.durationPickerText}>{selectedDurationLabel}</Text>
      </TouchableOpacity>

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
      date={date}
      setDate={setDate}
      typeOptions={['Gi', 'No-Gi', 'Open Mat']}
      type={type}
      setType={setType}
      techniqueNotes={techniqueNotes}
      setTechniqueNotes={setTechniqueNotes}
      tags={tags}
      setTags={setTags}
      rollingNotes={rollingNotes}
      setRollingNotes={setRollingNotes}
      additionalFields={additionalFields}
      onDelete={handleDelete}
      isEditing={isEditing}
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
});