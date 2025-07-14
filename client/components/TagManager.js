import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import apiClient from '../api/client';
import colors from '../constants/colors';

export default function TagManager() {
  const [tags, setTags] = useState([]);
  const fetchTags = async () => {
    try {
      const response = await apiClient.get('/tags');
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleDeleteTag = (tag) => {
    Alert.alert(
      'Delete Tag',
      `Are you sure you want to delete "${tag.name}"? This will remove it from all your activities.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTag(tag._id)
        }
      ]
    );
  };

  const deleteTag = async (tagId) => {
    try {
      await apiClient.delete(`/tags/${tagId}`);
      setTags(tags.filter(tag => tag._id !== tagId));
      Alert.alert('Success', 'Tag deleted successfully');
    } catch (error) {
      console.error('Error deleting tag:', error);
      Alert.alert('Error', 'Failed to delete tag. Please try again.');
    }
  };

  const renderTag = ({ item }) => (
    <View style={styles.tagItem}>
      <Text style={styles.tagName}>{item.name}</Text>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteTag(item)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Tags</Text>
      <Text style={styles.subtitle}>
        Delete tags you no longer need. This will remove them from all activities.
      </Text>
      
      {tags.length === 0 ? (
        <Text style={styles.emptyText}>No tags created yet.</Text>
      ) : (
        <FlatList
          data={tags}
          keyExtractor={(item) => item._id}
          renderItem={renderTag}
          style={styles.tagList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedAccent,
    marginBottom: 15,
  },
  tagList: {
    maxHeight: 200,
  },
  tagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 2,
    backgroundColor: colors.tertiaryBackground,
    borderRadius: 8,
  },
  tagName: {
    fontSize: 16,
    color: colors.primaryText,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: colors.destructive,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: colors.mutedAccent,
    textAlign: 'center',
    marginTop: 20,
  },
});