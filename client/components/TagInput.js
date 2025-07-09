import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import colors from '../constants/colors';

export default function TagInput({ tags, onTagsChange }) {
  const [text, setText] = useState('');

  const handleAddTag = () => {
    const newTag = text.trim();
    if (newTag && !tags.includes(newTag)) {
      onTagsChange([...tags, newTag]);
    }
    setText('');
  };

  const handleRemoveTag = (tagToRemove) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <View>
      <Text style={styles.label}>Tags</Text>
      <View style={styles.tagContainer}>
        {tags.map((tag, index) => (
          <Pressable key={index} onLongPress={() => handleRemoveTag(tag)}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          </Pressable>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Add a tag (e.g., 'armbar', 'guard pass')"
        placeholderTextColor={colors.mutedAccent}
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleAddTag} // Add tag when user hits enter
        returnKeyType="done"
      />
       <Text style={styles.hint}>Long-press a tag to remove it.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { 
    fontSize: 16, 
    marginBottom: 5, 
    fontWeight: 'bold',
    color: colors.primaryText,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: colors.mutedAccent,
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 12,
    margin: 4,
  },
  tagText: {
    color: colors.white,
    fontSize: 14,
  },
  input: {
    height: 40,
    borderColor: colors.mutedAccent,
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 5,
    color: colors.primaryText,
  },
  hint: {
    fontSize: 12,
    color: colors.mutedAccent,
    marginTop: 5,
    marginBottom: 15,
  }
});