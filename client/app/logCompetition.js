import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Switch } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import TagInput from '../components/TagInput';
import MedalSelector from '../components/MedalSelector';
import useLogFormHandler from '../hooks/useLogFormHandler';
import colors from '../constants/colors';

export default function CompetitionLogScreen() {
  // Form state
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [type, setType] = useState('Gi');
  const [weightDivision, setWeightDivision] = useState('');
  const [resultsInDivision, setResultsInDivision] = useState('none');
  const [matchesInDivision, setMatchesInDivision] = useState('1');
  const [matchNotesInDivision, setMatchNotesInDivision] = useState(['']);
  const [competedInOpenClass, setCompetedInOpenClass] = useState(false);
  const [resultsInOpenClass, setResultsInOpenClass] = useState('none');
  const [matchesInOpenClass, setMatchesInOpenClass] = useState('0');
  const [matchNotesInOpenClass, setMatchNotesInOpenClass] = useState([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [tags, setTags] = useState([]);

  // Hook configuration
  const { isEditing, handleDelete, handleSaveOrUpdate, setupFormHandler } = useLogFormHandler({
    endpoint: 'competitions',
    itemName: 'competition',
    validateData: (data) => {
      if (!data.name.trim()) return 'Please enter the competition name.';
      if (!data.organization.trim()) return 'Please enter the organization.';
      if (!data.weightDivision.trim()) return 'Please enter your weight division.';
      if (data.resultsInDivision === 'none') return 'Please select your results in the division.';
      if (!data.matchesInDivision || isNaN(parseInt(data.matchesInDivision))) {
        return 'Please enter a valid number of matches in your division.';
      }
      if (data.competedInOpenClass && (!data.matchesInOpenClass || isNaN(parseInt(data.matchesInOpenClass)))) {
        return 'Please enter a valid number of matches in open class.';
      }
      return null;
    },
    transformDataForEdit: (competition) => {
      setDate(new Date(competition.date));
      setName(competition.name || '');
      setOrganization(competition.organization || '');
      setType(competition.type);
      setWeightDivision(competition.weightDivision || '');
      setResultsInDivision(competition.resultsInDivision || 'none');
      setMatchesInDivision(competition.matchesInDivision.toString());
      setMatchNotesInDivision(competition.matchNotesInDivision.map(note => note.notes));
      setCompetedInOpenClass(competition.competedInOpenClass || false);
      setResultsInOpenClass(competition.resultsInOpenClass || 'none');
      setMatchesInOpenClass(competition.matchesInOpenClass.toString());
      setMatchNotesInOpenClass(competition.matchNotesInOpenClass.map(note => note.notes));
      setGeneralNotes(competition.generalNotes || '');
      setTags(competition.tags.map(t => t.name));
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
    }
  });
  const onChangeDate = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
    } else if (selectedDate) {
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
          accentColor="#007AFF"
          themeVariant="light"
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
      <MedalSelector 
        value={resultsInDivision} 
        onSelect={setResultsInDivision} 
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
      alignItems: 'center',
      marginBottom: 15,
      shadowColor: colors.shadow.color,
      shadowOffset: colors.shadow.offset,
      shadowOpacity: colors.shadow.opacity,
      shadowRadius: colors.shadow.radius,
      elevation: colors.shadow.elevation,
    },
    compactProFeatureText: {
      fontSize: 14,
      color: colors.mutedAccent,
      textAlign: 'center',
    },
});