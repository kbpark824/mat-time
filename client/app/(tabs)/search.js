import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../auth/context';
import apiClient from '../../api/client';
import SearchableTagDropdown from '../../components/SearchableTagDropdown';
import colors from '../../constants/colors';

export default function SearchScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const handleTagsChange = (newSelectedTags) => {
    setSelectedTags(newSelectedTags);
  };

  const handleTagDeleted = (deletedTagId) => {
    // Remove the deleted tag from the allTags list
    setAllTags(prevTags => prevTags.filter(tag => tag._id !== deletedTagId));
  };

  const fetchAllActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('keyword', searchQuery);
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

  useFocusEffect(
    React.useCallback(() => {
      fetchAllActivities();
      fetchTags();
    }, [searchQuery, selectedTags])
  );

  useEffect(() => {
    fetchAllActivities();
  }, [searchQuery, selectedTags]);

  const getActivityTypeLabel = (activity) => {
    switch (activity.activityType) {
      case 'session':
        return 'Training Session';
      case 'seminar':
        return 'Seminar';
      case 'competition':
        return 'Competition';
      default:
        return 'Activity';
    }
  };

  const getActivityTypeColor = (activity) => {
    switch (activity.activityType) {
      case 'session':
        return '#E3F2FD'; // Light blue
      case 'seminar':
        return '#E8F5E8'; // Light green
      case 'competition':
        return '#FFF3E0'; // Light orange
      default:
        return colors.tertiaryBackground;
    }
  };

  const getActivitySubtitle = (activity) => {
    switch (activity.activityType) {
      case 'session':
        return `${activity.type} - ${activity.duration} min`;
      case 'seminar':
        return `${activity.type} - ${activity.professor}`;
      case 'competition':
        return `${activity.type} - ${activity.organization}`;
      default:
        return '';
    }
  };

  const handleActivityPress = (activity) => {
    const routeMap = {
      session: 'logSession',
      seminar: 'logSeminar', 
      competition: 'logCompetition'
    };
    
    const route = routeMap[activity.activityType];
    if (route) {
      router.push(`/${route}?id=${activity._id}&data=${encodeURIComponent(JSON.stringify(activity))}`);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleActivityPress(item)} style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <View style={[styles.activityTypeLabel, { backgroundColor: getActivityTypeColor(item) }]}>
          <Text style={styles.activityTypeText}>{getActivityTypeLabel(item)}</Text>
        </View>
      </View>
      <Text style={styles.activitySubtitle}>{getActivitySubtitle(item)}</Text>
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
              />
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No activities found.</Text>
            {(searchQuery || selectedTags.length > 0) && (
              <Text style={styles.emptySubtext}>Try adjusting your search or filters.</Text>
            )}
          </View>
        }
        style={styles.list}
      />
      {loading && <ActivityIndicator size="large" color={colors.primaryText} style={StyleSheet.absoluteFill} />}
    </View>
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
    borderWidth: 1,
    borderColor: colors.mutedAccent,
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mutedAccent,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    marginBottom: 8,
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
});