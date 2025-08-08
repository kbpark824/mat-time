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

import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import apiClient from '../api/client';

export default function useHomeData() {
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchRecentActivities = useCallback(async (force = false) => {
    // Only fetch if we haven't fetched in the last 30 seconds (unless forced)
    const now = Date.now();
    if (!force && lastFetch && (now - lastFetch) < 30000) {
      return;
    }
    
    try {
      setLoadingActivities(true);
      // Fetch recent activities from all three types
      const requests = [
        apiClient.get('/sessions?limit=3').catch(() => ({ data: [] })),
        apiClient.get('/seminars?limit=3').catch(() => ({ data: [] })),
        apiClient.get('/competitions?limit=3').catch(() => ({ data: [] }))
      ];

      const [sessionsResponse, seminarsResponse, competitionsResponse] = await Promise.all(requests);

      // Tag each activity with its type
      const sessions = (sessionsResponse.data || []).map(session => ({ ...session, activityType: 'session' }));
      const seminars = (seminarsResponse.data || []).map(seminar => ({ ...seminar, activityType: 'seminar' }));
      const competitions = (competitionsResponse.data || []).map(competition => ({ ...competition, activityType: 'competition' }));

      // Combine and sort by date, limit to 5 most recent
      const combined = [...sessions, ...seminars, ...competitions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      setRecentActivities(combined);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  }, [lastFetch]);

  const fetchStats = useCallback(async (force = false) => {
    // Only fetch if we haven't fetched in the last 30 seconds (unless forced)
    const now = Date.now();
    if (!force && lastFetch && (now - lastFetch) < 30000) {
      return;
    }
    
    try {
      setLoadingStats(true);
      const response = await apiClient.get('/stats/summary');
      setStats(response.data);
      setLastFetch(now);
    } catch (error) {
      console.error('Failed to fetch stats', error);
      // If it's a rate limit error, wait a bit longer before next attempt
      if (error.response?.status === 429) {
        setLastFetch(now + 60000); // Wait extra minute on rate limit
      }
    } finally {
      setLoadingStats(false);
    }
  }, [lastFetch]);

  const refreshData = useCallback(() => {
    fetchStats(true);
    fetchRecentActivities(true);
  }, [fetchStats, fetchRecentActivities]);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
      fetchRecentActivities();
    }, [fetchStats, fetchRecentActivities])
  );

  return {
    // Data
    recentActivities,
    stats,
    
    // Loading states
    loadingActivities,
    loadingStats,
    
    // Actions
    refreshData,
  };
}