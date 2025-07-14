import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  FlatList,
  Pressable,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';
import colors from '../constants/colors';

export default function SearchableTagDropdown({ 
  allTags, 
  selectedTags, 
  onTagsChange,
  onTagDeleted,
  placeholder = "Filter by tags..."
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTags, setFilteredTags] = useState(allTags);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTags(allTags);
    } else {
      setFilteredTags(
        allTags.filter(tag => 
          tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, allTags]);

  const toggleTag = (tagName) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName)
      : [...selectedTags, tagName];
    onTagsChange(newSelectedTags);
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  const removeTag = (tagName) => {
    onTagsChange(selectedTags.filter(t => t !== tagName));
  };

  const deleteTag = async (tag) => {
    Alert.alert(
      'Delete Tag',
      `Are you sure you want to delete "${tag.name}"? This will remove it from all your activities.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/tags/${tag._id}`);
              
              // Remove from selected tags if it was selected
              if (selectedTags.includes(tag.name)) {
                onTagsChange(selectedTags.filter(t => t !== tag.name));
              }
              
              // Notify parent component to update the tags list
              if (onTagDeleted) {
                onTagDeleted(tag._id);
              }
              
            } catch (error) {
              console.error('Error deleting tag:', error);
              Alert.alert('Error', 'Failed to delete tag. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getDisplayText = () => {
    if (selectedTags.length === 0) {
      return placeholder;
    }
    if (selectedTags.length === 1) {
      return `1 tag selected`;
    }
    return `${selectedTags.length} tags selected`;
  };

  const renderTagItem = ({ item }) => {
    const isSelected = selectedTags.includes(item.name);
    
    return (
      <View style={[styles.tagItem, isSelected && styles.tagItemSelected]}>
        <TouchableOpacity 
          style={styles.tagSelectArea}
          onPress={() => toggleTag(item.name)}
        >
          <Text style={[styles.tagItemText, isSelected && styles.tagItemTextSelected]}>
            {item.name}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteTag(item)}
        >
          <Ionicons name="trash" size={18} color={colors.destructive} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSelectedTag = (tagName, index) => (
    <View key={index} style={styles.selectedTagChip}>
      <Text style={styles.selectedTagText}>{tagName}</Text>
      <TouchableOpacity 
        onPress={() => removeTag(tagName)}
        style={styles.removeTagButton}
      >
        <Text style={styles.removeTagText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          <View style={styles.selectedTagsHeader}>
            <Text style={styles.selectedTagsTitle}>Selected Tags:</Text>
            <TouchableOpacity onPress={clearAllTags} style={styles.clearAllButton}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.selectedTagsRow}>
            {selectedTags.map((tagName, index) => renderSelectedTag(tagName, index))}
          </View>
        </View>
      )}

      {/* Dropdown Trigger */}
      <TouchableOpacity 
        style={styles.dropdownTrigger}
        onPress={() => setIsVisible(true)}
      >
        <Text style={[
          styles.dropdownText, 
          selectedTags.length === 0 && styles.placeholderText
        ]}>
          {getDisplayText()}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setIsVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter by Tags</Text>
            <TouchableOpacity 
              onPress={() => setIsVisible(false)}
              style={styles.doneButton}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search tags..."
              placeholderTextColor={colors.mutedAccent}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={false}
            />
          </View>

          {/* Selected Count */}
          {selectedTags.length > 0 && (
            <View style={styles.selectedCountContainer}>
              <Text style={styles.selectedCountText}>
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
              </Text>
              <TouchableOpacity onPress={clearAllTags}>
                <Text style={styles.clearAllTextModal}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Tags List */}
          <FlatList
            data={filteredTags}
            keyExtractor={(item) => item._id}
            renderItem={renderTagItem}
            style={styles.tagsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No tags found matching your search' : 'No tags created yet'}
                </Text>
              </View>
            }
          />

          {/* Bottom Safe Area */}
          <View style={styles.bottomSafeArea} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  selectedTagsContainer: {
    marginBottom: 12,
  },
  selectedTagsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedTagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
  },
  clearAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  selectedTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryText,
    borderRadius: 16,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primaryText,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedTagText: {
    color: colors.primaryBackground,
    fontSize: 14,
    fontWeight: '600',
  },
  removeTagButton: {
    marginLeft: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(243, 241, 236, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeTagText: {
    color: colors.primaryBackground,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.secondaryBackground,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.mutedAccent,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.primaryText,
    flex: 1,
  },
  placeholderText: {
    color: colors.mutedAccent,
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.mutedAccent,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
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
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.mutedAccent,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryText,
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 60,
    alignItems: 'flex-end',
  },
  doneButtonText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInput: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.primaryText,
    borderWidth: 1,
    borderColor: colors.mutedAccent,
  },
  selectedCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  selectedCountText: {
    fontSize: 14,
    color: colors.mutedAccent,
  },
  clearAllTextModal: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  tagsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 8,
    marginBottom: 8,
  },
  tagItemSelected: {
    backgroundColor: colors.accent,
  },
  tagSelectArea: {
    flex: 1,
    paddingRight: 16,
  },
  tagItemText: {
    fontSize: 16,
    color: colors.primaryText,
  },
  tagItemTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.mutedAccent,
    textAlign: 'center',
  },
  bottomSafeArea: {
    height: 20,
  },
});