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
import { View, StyleSheet, ActivityIndicator, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useAuth } from '../../auth/context';
import SearchFilters from '../../components/SearchFilters';
import SearchResults from '../../components/SearchResults';
import useSearchData from '../../hooks/useSearchData';
import colors from '../../constants/colors';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function SearchScreen() {
  const { user } = useAuth();
  const {
    allActivities,
    allTags,
    loading,
    searchQuery,
    selectedTags,
    hasSearchCriteria,
    isSearching,
    setSearchQuery,
    handleTagsChange,
    handleTagDeleted
  } = useSearchData();

  return (
    <ErrorBoundary fallbackMessage="Unable to load search functionality. Please try refreshing.">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <SearchFilters
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            allTags={allTags}
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            onTagDeleted={handleTagDeleted}
            isSearching={isSearching}
          />
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Loading activities...</Text>
            </View>
          ) : (
            <SearchResults
              activities={allActivities}
              hasSearchCriteria={hasSearchCriteria}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
  },
  loadingText: {
    fontSize: 16,
    color: colors.mutedAccent,
    textAlign: 'center',
    marginTop: 12,
  },
});