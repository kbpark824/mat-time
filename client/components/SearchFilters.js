/*
 * Mat Time - Martial Arts Training Session Tracking Application
 * Copyright (C) 2025 Kibum Park
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import { View, Text, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import SearchableTagDropdown from './SearchableTagDropdown';
import colors from '../constants/colors';

export default function SearchFilters({
  searchQuery,
  onSearchQueryChange,
  allTags,
  selectedTags,
  onTagsChange,
  onTagDeleted,
  isSearching = false
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search & Filter</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search activities..."
          placeholderTextColor={colors.mutedAccent}
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          returnKeyType="search"
          accessibilityRole="search"
          accessibilityLabel="Search activities"
          accessibilityHint="Type to search through your training activities by notes or techniques"
        />
        {isSearching && (
          <View style={styles.searchLoadingIndicator}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        )}
      </View>
      
      <SearchableTagDropdown
        allTags={allTags}
        selectedTags={selectedTags}
        onTagsChange={onTagsChange}
        onTagDeleted={onTagDeleted}
        placeholder="Filter by tags..."
      />
      
      <Text style={styles.activitiesTitle}>All Activities</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.primaryText,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  searchLoadingIndicator: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -10,
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 10,
  },
});