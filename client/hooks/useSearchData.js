import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import apiClient from '../api/client';

export default function useSearchData() {
  const [allActivities, setAllActivities] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const fetchAllActivities = useCallback(async () => {
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
  }, [debouncedSearchQuery, selectedTags]);

  const fetchTags = useCallback(async () => {
    try {
      const response = await apiClient.get('/tags');
      setAllTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, []);

  const handleTagsChange = useCallback((newSelectedTags) => {
    setSelectedTags(newSelectedTags);
  }, []);

  const handleTagDeleted = useCallback((deletedTagId) => {
    // Remove the deleted tag from the allTags list
    setAllTags(prevTags => prevTags.filter(tag => tag._id !== deletedTagId));
  }, []);

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchAllActivities();
      fetchTags();
    }, [fetchAllActivities, fetchTags])
  );

  // Refetch data when search criteria changes
  useEffect(() => {
    fetchAllActivities();
  }, [fetchAllActivities]);

  const hasSearchCriteria = debouncedSearchQuery || selectedTags.length > 0;
  const isSearching = searchQuery !== debouncedSearchQuery;

  return {
    // Data
    allActivities,
    allTags,
    loading,
    
    // Search state
    searchQuery,
    selectedTags,
    hasSearchCriteria,
    isSearching,
    
    // Actions
    setSearchQuery,
    handleTagsChange,
    handleTagDeleted,
    
    // Methods
    refetch: fetchAllActivities
  };
}