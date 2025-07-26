import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import colors from '../constants/colors';

export default function TagInput({ tags, onTagsChange }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const MAX_TAG_LENGTH = 50;
  const MAX_TAGS = 20;

  const handleAddTag = () => {
    const newTag = text.trim();
    setError('');

    // Validation checks
    if (!newTag) {
      return;
    }

    if (newTag.length > MAX_TAG_LENGTH) {
      setError(`Tag cannot exceed ${MAX_TAG_LENGTH} characters`);
      return;
    }

    if (tags.length >= MAX_TAGS) {
      setError(`Cannot add more than ${MAX_TAGS} tags per session`);
      return;
    }

    if (tags.includes(newTag)) {
      setError('Tag already exists');
      return;
    }

    onTagsChange([...tags, newTag]);
    setText('');
  };

  const handleTextChange = (newText) => {
    setText(newText);
    setError(''); // Clear error when user starts typing
  };

  const handleRemoveTag = (tagToRemove) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <View>
      <Text style={styles.label}>Tags</Text>
      <View style={styles.tagContainer}>
        {tags.map((tag, index) => (
          <Pressable 
            key={index} 
            onLongPress={() => handleRemoveTag(tag)}
            style={styles.tagPressable}
            accessibilityRole="button"
            accessibilityLabel={`${tag} tag`}
            accessibilityHint="Long press to remove this tag"
          >
            <View style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          </Pressable>
        ))}
      </View>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="Add a tag (e.g., 'armbar', 'guard pass')"
        placeholderTextColor={colors.mutedAccent}
        value={text}
        onChangeText={handleTextChange}
        onSubmitEditing={handleAddTag}
        returnKeyType="done"
        maxLength={MAX_TAG_LENGTH}
      />
      <View style={styles.feedbackContainer}>
        <Text style={styles.charCounter}>
          {text.length}/{MAX_TAG_LENGTH} characters
        </Text>
        <Text style={styles.tagCounter}>
          {tags.length}/{MAX_TAGS} tags
        </Text>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  tagPressable: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  tag: {
    backgroundColor: colors.mutedAccent,
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 32,
    justifyContent: 'center',
  },
  tagText: {
    color: colors.white,
    fontSize: 14,
  },
  input: {
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.white,
    color: colors.primaryText,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  charCounter: {
    fontSize: 12,
    color: colors.mutedAccent,
  },
  tagCounter: {
    fontSize: 12,
    color: colors.mutedAccent,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    marginTop: 5,
  },
  hint: {
    fontSize: 12,
    color: colors.mutedAccent,
    marginTop: 5,
    marginBottom: 15,
  }
});