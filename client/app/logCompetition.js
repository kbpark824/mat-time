import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Alert, TouchableOpacity, Switch } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiClient from '../api/client';
import TagInput from '../components/TagInput';
import colors from '../constants/colors';

export default function CompetitionLogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const competitionToEdit = params.id && params.data ? (() => {
    try {
      return JSON.parse(params.data);
    } catch (e) {
      console.error('Invalid competition data:', e);
      return null;
    }
  })() : null;

  const [date, setDate] = useState(competitionToEdit ? new Date(competitionToEdit.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [name, setName] = useState(competitionToEdit ? competitionToEdit.name : '');
  const [organization, setOrganization] = useState(competitionToEdit ? competitionToEdit.organization : '');
  const [type, setType] = useState(competitionToEdit ? competitionToEdit.type : 'Gi');
  const [weightDivision, setWeightDivision] = useState(competitionToEdit ? competitionToEdit.weightDivision : '');
  const [resultsInDivision, setResultsInDivision] = useState(competitionToEdit ? competitionToEdit.resultsInDivision : '');
  const [matchesInDivision, setMatchesInDivision] = useState(competitionToEdit ? competitionToEdit.matchesInDivision.toString() : '1');
  const [matchNotesInDivision, setMatchNotesInDivision] = useState(
    competitionToEdit 
      ? competitionToEdit.matchNotesInDivision.map(note => note.notes)
      : ['']
  );
  
  const [competedInOpenClass, setCompetedInOpenClass] = useState(competitionToEdit ? competitionToEdit.competedInOpenClass : false);
  const [resultsInOpenClass, setResultsInOpenClass] = useState(competitionToEdit ? competitionToEdit.resultsInOpenClass : '');
  const [matchesInOpenClass, setMatchesInOpenClass] = useState(competitionToEdit ? competitionToEdit.matchesInOpenClass.toString() : '0');
  const [matchNotesInOpenClass, setMatchNotesInOpenClass] = useState(
    competitionToEdit 
      ? competitionToEdit.matchNotesInOpenClass.map(note => note.notes)
      : []
  );
  
  const [generalNotes, setGeneralNotes] = useState(competitionToEdit ? competitionToEdit.generalNotes : '');
  const [tags, setTags] = useState(competitionToEdit ? competitionToEdit.tags.map(t => t.name) : []);
  
  const isEditing = !!competitionToEdit;
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };


  // Update match notes arrays when number of matches changes
  const updateMatchesInDivision = (value) => {
    setMatchesInDivision(value);
    const numMatches = parseInt(value) || 0;
    const newNotes = Array(numMatches).fill('').map((_, index) => 
      matchNotesInDivision[index] || ''
    );
    setMatchNotesInDivision(newNotes);
  };

  const updateMatchesInOpenClass = (value) => {
    setMatchesInOpenClass(value);
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

  const handleSaveOrUpdate = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Invalid Input', 'Please enter the competition name.');
      return;
    }
    if (!organization.trim()) {
      Alert.alert('Invalid Input', 'Please enter the organization.');
      return;
    }
    if (!weightDivision.trim()) {
      Alert.alert('Invalid Input', 'Please enter your weight division.');
      return;
    }
    if (!resultsInDivision.trim()) {
      Alert.alert('Invalid Input', 'Please enter your results in the division.');
      return;
    }
    if (!matchesInDivision || isNaN(parseInt(matchesInDivision))) {
      Alert.alert('Invalid Input', 'Please enter a valid number of matches in your division.');
      return;
    }
    if (competedInOpenClass && (!matchesInOpenClass || isNaN(parseInt(matchesInOpenClass)))) {
      Alert.alert('Invalid Input', 'Please enter a valid number of matches in open class.');
      return;
    }

    // Prepare match notes data
    const formattedMatchNotesInDivision = matchNotesInDivision.map((note, index) => ({
      matchNumber: index + 1,
      notes: note
    }));

    const formattedMatchNotesInOpenClass = competedInOpenClass 
      ? matchNotesInOpenClass.map((note, index) => ({
          matchNumber: index + 1,
          notes: note
        }))
      : [];

    const competitionData = {
      date,
      name: name.trim(),
      organization: organization.trim(),
      type,
      weightDivision: weightDivision.trim(),
      resultsInDivision: resultsInDivision.trim(),
      matchesInDivision: parseInt(matchesInDivision),
      matchNotesInDivision: formattedMatchNotesInDivision,
      competedInOpenClass,
      resultsInOpenClass: competedInOpenClass ? resultsInOpenClass.trim() : '',
      matchesInOpenClass: competedInOpenClass ? parseInt(matchesInOpenClass) : 0,
      matchNotesInOpenClass: formattedMatchNotesInOpenClass,
      generalNotes,
      tags,
    };

    try {
      if (isEditing) {
        await apiClient.put(`/competitions/${competitionToEdit._id}`, competitionData);
      } else {
        await apiClient.post('/competitions', competitionData);
      }
      router.back();
    } catch (error) {
      console.error('Failed to save competition', error);
      Alert.alert('Save Failed', 'Could not save the competition. Please try again.');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Competition",
      "Are you sure you want to permanently delete this competition log?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await apiClient.delete(`/competitions/${competitionToEdit._id}`);
            router.back();
          } catch (error) {
            console.error('Failed to delete competition', error);
            Alert.alert('Delete Failed', 'Could not delete the competition.');
          }
        }}
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };


  return (
    <KeyboardAwareScrollView style={styles.container}>
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <View style={styles.input}>
            <Text style={styles.datePickerText}>{date.toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          onChange={onChangeDate}
          textColor="#333333"
        />
      )}

      <Text style={styles.label}>Competition Name</Text>
      <TextInput 
        style={styles.input} 
        value={name} 
        onChangeText={setName} 
        placeholder="Name of the competition" 
        placeholderTextColor={colors.mutedAccent} 
      />

      <Text style={styles.label}>Organization</Text>
      <TextInput 
        style={styles.input} 
        value={organization} 
        onChangeText={setOrganization} 
        placeholder="e.g., IBJJF, NAGA, etc." 
        placeholderTextColor={colors.mutedAccent} 
      />
      
      <Text style={styles.label}>Type</Text>
      <View style={styles.buttonGroup}>
        {['Gi', 'No-Gi'].map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.typeButton, type === t && styles.typeButtonSelected]} 
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeButtonText, type === t && styles.typeButtonTextSelected]}>{t}</Text>
            </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Weight Division</Text>
      <TextInput 
        style={styles.input} 
        value={weightDivision} 
        onChangeText={setWeightDivision} 
        placeholder="e.g., Lightweight, 155lbs, etc." 
        placeholderTextColor={colors.mutedAccent} 
      />

      <Text style={styles.label}>Results in Your Division</Text>
      <TextInput 
        style={styles.input} 
        value={resultsInDivision} 
        onChangeText={setResultsInDivision} 
        placeholder="e.g., 1st Place, 2nd Place, etc." 
        placeholderTextColor={colors.mutedAccent} 
      />

      <Text style={styles.label}>Number of Matches in Your Division</Text>
      <TextInput 
        style={styles.input} 
        value={matchesInDivision} 
        onChangeText={updateMatchesInDivision} 
        keyboardType="numeric" 
        placeholder="e.g., 3" 
        placeholderTextColor={colors.mutedAccent} 
      />

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
          trackColor={{ false: colors.mutedAccent, true: colors.primaryText }}
          thumbColor={competedInOpenClass ? colors.white : colors.white}
        />
      </View>

      {competedInOpenClass && (
        <>
          <Text style={styles.label}>Results in Open Class</Text>
          <TextInput 
            style={styles.input} 
            value={resultsInOpenClass} 
            onChangeText={setResultsInOpenClass} 
            placeholder="e.g., 1st Place, 2nd Place, etc." 
            placeholderTextColor={colors.mutedAccent} 
          />

          <Text style={styles.label}>Number of Matches in Open Class</Text>
          <TextInput 
            style={styles.input} 
            value={matchesInOpenClass} 
            onChangeText={updateMatchesInOpenClass} 
            keyboardType="numeric" 
            placeholder="e.g., 2" 
            placeholderTextColor={colors.mutedAccent} 
          />

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
        style={[styles.input, styles.textArea]} 
        multiline 
        value={generalNotes} 
        onChangeText={setGeneralNotes} 
        placeholder="Overall thoughts about the competition..." 
        placeholderTextColor={colors.mutedAccent} 
      />

      <TagInput tags={tags} onTagsChange={setTags} />

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
      backgroundColor: colors.lightBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.mutedAccent,
      alignItems: 'center',
      marginBottom: 15,
    },
    compactProFeatureText: {
      fontSize: 14,
      color: colors.mutedAccent,
      textAlign: 'center',
    },
});