import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../auth/context';
import apiClient from '../../api/client';
import Dashboard from '../../components/Dashboard';
import ErrorBoundary from '../../components/ErrorBoundary';
import colors from '../../constants/colors';
import { 
  getActivityTypeLabel, 
  getActivityTypeColor, 
  getActivitySubtitle, 
  getNotesExcerpt,
  getActivityRoute 
} from '../../utils/activityHelpers';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchRecentActivities = async (force = false) => {
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
  };

  const fetchStats = async (force = false) => {
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
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
      fetchRecentActivities();
    }, [])
  );

  // Using shared activity helper functions from utils

  const handleActivityPress = useCallback((activity) => {
    const route = getActivityRoute(activity);
    if (route) {
      router.push(`/${route}?id=${activity._id}`);
    }
  }, [router]);

  const renderRecentActivity = ({ item }) => (
    <TouchableOpacity onPress={() => handleActivityPress(item)} style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <View style={[styles.activityTypeLabel, { backgroundColor: getActivityTypeColor(item) }]}>
          <Text style={styles.activityTypeText}>{getActivityTypeLabel(item)}</Text>
        </View>
      </View>
      <Text style={styles.activitySubtitle}>{getActivitySubtitle(item)}</Text>
      <Text style={styles.activityNotes}>{getNotesExcerpt(item)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={recentActivities}
        renderItem={renderRecentActivity}
        keyExtractor={(item) => `${item.activityType}-${item._id}`}
        ListHeaderComponent={
          <View>
            {/* Dashboard Section */}
            <View style={styles.dashboardSection}>
              <ErrorBoundary fallbackMessage="Unable to load dashboard. Please try refreshing.">
                {loadingStats ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={styles.loadingText}>Loading dashboard...</Text>
                  </View>
                ) : (
                  <Dashboard stats={stats} />
                )}
              </ErrorBoundary>
            </View>

            {/* Recent Activities Section */}
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recent Activities</Text>
                <TouchableOpacity 
                  onPress={() => router.push('/(tabs)/search')}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          loadingActivities ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Loading recent activities...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recent activities</Text>
              <Text style={styles.emptySubtext}>Start logging your training sessions!</Text>
            </View>
          )
        }
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  list: {
    flex: 1,
  },
  dashboardSection: {
    marginBottom: 20,
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryText,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent,
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.mutedAccent,
    textAlign: 'center',
    marginTop: 12,
  },
});