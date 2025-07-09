import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, Alert, Pressable, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiClient from '../api/client';
import TagInput from '../components/TagInput';
import colors from '../constants/colors';
import Purchases from 'react-native-purchases';
import { useAuth } from '../auth/context';

export default function SessionLogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionToEdit = params.id ? JSON.parse(params.session) : null;
  const { user } = useAuth();

  const [date, setDate] = useState(sessionToEdit ? new Date(sessionToEdit.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState(sessionToEdit ? sessionToEdit.duration.toString() : '1.5');
  const [type, setType] = useState(sessionToEdit ? sessionToEdit.type : 'Gi');
  const [techniqueNotes, setTechniqueNotes] = useState(sessionToEdit ? sessionToEdit.techniqueNotes : '');
  const [rollingNotes, setRollingNotes] = useState(sessionToEdit ? sessionToEdit.rollingNotes : '');
  const [tags, setTags] = useState(sessionToEdit ? sessionToEdit.tags.map(t => t.name) : []);
  const [isPro, setIsPro] = useState(false);
  
  const isEditing = !!sessionToEdit;

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // Check both RevenueCat and database for premium status
        const customerInfo = await Purchases.getCustomerInfo();
        const isProFromRevenueCat = typeof customerInfo.entitlements.active.pro !== 'undefined';
        const isProFromDatabase = user?.isPro || false;
        
        // User is pro if either RevenueCat OR database says so
        const isPremium = isProFromRevenueCat || isProFromDatabase;
        setIsPro(isPremium);
      } catch (e) {
        // If RevenueCat fails, fall back to database only
        const isProFromDatabase = user?.isPro || false;
        setIsPro(isProFromDatabase);
      }
    };
    checkSubscription();
  }, [user]);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

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
      tags: isPro ? tags : [],
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

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      resetScrollToCoords={{ x: 0, y: 0 }}
      contentContainerStyle={{ flexGrow: 1 }}
      scrollEnabled={true}
      keyboardShouldPersistTaps="handled"
    >
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
        />
      )}
      
      <Text style={styles.label}>Duration (in hours)</Text>
      <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="e.g., 1.5 for 90 minutes" placeholderTextColor={colors.mutedAccent} />
      
      <Text style={styles.label}>Class Type</Text>
      <View style={styles.buttonGroup}>
        {['Gi', 'No-Gi', 'Open Mat'].map(t => (
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
      <TextInput style={[styles.input, styles.textArea]} multiline value={techniqueNotes} onChangeText={setTechniqueNotes} placeholder="What did you learn today?" placeholderTextColor={colors.mutedAccent} />
      
      <Text style={styles.label}>Rolling / Sparring Notes</Text>
      <TextInput style={[styles.input, styles.textArea]} multiline value={rollingNotes} onChangeText={setRollingNotes} placeholder="How did rolling go?" placeholderTextColor={colors.mutedAccent} />

      {isPro ? (
        <TagInput tags={tags} onTagsChange={setTags} />
      ) : (
        <View style={styles.premiumFeatureContainer}>
          <Text style={styles.premiumFeatureText}>Tagging is a premium feature. Upgrade to unlock.</Text>
        </View>
      )}

      <View style={styles.spacer} />
      <TouchableOpacity style={styles.primaryButton} onPress={handleSaveOrUpdate}>
        <Text style={styles.primaryButtonText}>{isEditing ? "Save Changes" : "Save Session"}</Text>
      </TouchableOpacity>
      <View style={styles.spacer} />
      
      {isEditing && (
         <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
           <Text style={styles.deleteButtonText}>Delete Session</Text>
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
      backgroundColor: '#D9534F', // A standard destructive red
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    deleteButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
    premiumFeatureContainer: {
      padding: 20,
      backgroundColor: colors.lightBackground,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 15,
    },
    premiumFeatureText: {
      fontSize: 16,
      color: colors.primaryText,
      textAlign: 'center',
    },
});