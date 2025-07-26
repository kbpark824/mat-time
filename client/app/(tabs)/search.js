import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../auth/context';
import apiClient from '../../api/client';
import SearchableTagDropdown from '../../components/SearchableTagDropdown';
import colors from '../../constants/colors';
import { 
  getActivityTypeLabel, 
  getActivityTypeColor, 
  getActivitySubtitle, 
  getNotesExcerpt,
  getActivityRoute 
} from '../../utils/activityHelpers';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function SearchScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const handleTagsChange = useCallback((newSelectedTags) => {
    setSelectedTags(newSelectedTags);
  }, []);

  const handleTagDeleted = useCallback((deletedTagId) => {
    // Remove the deleted tag from the allTags list
    setAllTags(prevTags => prevTags.filter(tag => tag._id !== deletedTagId));
  }, []);

  const fetchAllActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchQuery) {
        params.append('keyword', debouncedSearchQuery);
      }
      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }
      
      // Fetch all three types of activities in parallel with error handling
      const requests = [
        apiClient.get(`/sessions?${params.toString()}`).catch(() => ({ data: [] })),
        apiClient.get(`/seminars?${params.toString()}`).catch(() => ({ data: [] })),
        apiClient.get(`/competitions?${params.toString()}`).catch(() => ({ data: [] }))
      ];

      const [sessionsResponse, seminarsResponse, competitionsResponse] = await Promise.all(requests);

      // Tag each activity with its type for proper routing
      const sessions = (sessionsResponse.data || []).map(session => ({ ...session, activityType: 'session' }));
      const seminars = (seminarsResponse.data || []).map(seminar => ({ ...seminar, activityType: 'seminar' }));
      const competitions = (competitionsResponse.data || []).map(competition => ({ ...competition, activityType: 'competition' }));

      // Combine and sort by date (newest first)
      const combined = [...sessions, ...seminars, ...competitions].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setAllActivities(combined);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setAllActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await apiClient.get('/tags');
      setAllTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useFocusEffect(
    React.useCallback(() => {
      fetchAllActivities();
      fetchTags();
    }, [debouncedSearchQuery, selectedTags])
  );

  useEffect(() => {
    fetchAllActivities();
  }, [debouncedSearchQuery, selectedTags]);

  // Using shared activity helper functions from utils

  const handleActivityPress = useCallback((activity) => {
    const route = getActivityRoute(activity);
    if (route) {
      router.push(`/${route}?id=${activity._id}`);
    }
  }, [router]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleActivityPress(item)} style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <View style={[styles.activityTypeLabel, { backgroundColor: getActivityTypeColor(item) }]}>
          <Text style={styles.activityTypeText}>{getActivityTypeLabel(item)}</Text>
        </View>
      </View>
      <Text style={styles.activitySubtitle}>{getActivitySubtitle(item)}</Text>
      <Text style={styles.activityNotes}>{getNotesExcerpt(item)}</Text>
      {item.tags && item.tags.length > 0 && (
        <View style={styles.activityTags}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.activityTag}>
              <Text style={styles.activityTagText}>{tag.name}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={styles.moreTags}>+{item.tags.length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ErrorBoundary fallbackMessage="Unable to load search functionality. Please try refreshing.">
      <View style={styles.container}>
      <FlatList
        data={allActivities}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.activityType}-${item._id}`}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.title}>Search & Filter</Text>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search activities..."
                placeholderTextColor={colors.mutedAccent}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                accessibilityRole="searchbox"
                accessibilityLabel="Search activities"
                accessibilityHint="Type to search through your training activities by notes or techniques"
              />
              {searchQuery !== debouncedSearchQuery && (
                <View style={styles.searchLoadingIndicator}>
                  <ActivityIndicator size="small" color={colors.accent} />
                </View>
              )}
            </View>
            
            <SearchableTagDropdown
              allTags={allTags}
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
              onTagDeleted={handleTagDeleted}
              placeholder="Filter by tags..."
            />
            
            <Text style={styles.activitiesTitle}>All Activities</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {(debouncedSearchQuery || selectedTags.length > 0) 
                  ? 'No activities match your search criteria'
                  : 'No activities found'
                }
              </Text>
              <Text style={styles.emptySubtext}>
                {(debouncedSearchQuery || selectedTags.length > 0)
                  ? 'Try adjusting your search or filters'
                  : 'Start logging your training sessions!'
                }
              </Text>
            </View>
          )
        }
        style={styles.list}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading activities...</Text>
        </View>
      )}
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  list: {
    backgroundColor: colors.primaryBackground,
  },
  listHeader: {
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
  activitiesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 10,
  },
  activityCard: {
    backgroundColor: colors.secondaryBackground,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 15,
    borderRadius: 12,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
  },
  activityTypeLabel: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  activityTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primaryText,
  },
  activitySubtitle: {
    fontSize: 14,
    color: colors.mutedAccent,
    marginBottom: 6,
  },
  activityNotes: {
    fontSize: 13,
    color: colors.primaryText,
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 18,
  },
  activityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  activityTag: {
    backgroundColor: colors.mutedAccent,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  activityTagText: {
    fontSize: 12,
    color: colors.white,
  },
  moreTags: {
    fontSize: 12,
    color: colors.mutedAccent,
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.mutedAccent,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.mutedAccent,
    textAlign: 'center',
  },
  searchLoadingIndicator: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -10,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(250, 250, 250, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    fontSize: 16,
    color: colors.mutedAccent,
    textAlign: 'center',
    marginTop: 12,
  },
});