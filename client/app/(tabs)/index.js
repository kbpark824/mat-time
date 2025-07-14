import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../auth/context';
import apiClient from '../../api/client';
import Dashboard from '../../components/Dashboard';
import colors from '../../constants/colors';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchRecentActivities = async (force = false) => {
    // Only fetch if we haven't fetched in the last 30 seconds (unless forced)
    const now = Date.now();
    if (!force && lastFetch && (now - lastFetch) < 30000) {
      return;
    }
    
    try {
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
    }
  };

  const fetchStats = async (force = false) => {
    // Only fetch if we haven't fetched in the last 30 seconds (unless forced)
    const now = Date.now();
    if (!force && lastFetch && (now - lastFetch) < 30000) {
      return;
    }
    
    try {
      const response = await apiClient.get('/stats/summary');
      setStats(response.data);
      setLastFetch(now);
    } catch (error) {
      console.error('Failed to fetch stats', error);
      // If it's a rate limit error, wait a bit longer before next attempt
      if (error.response?.status === 429) {
        setLastFetch(now + 60000); // Wait extra minute on rate limit
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
      fetchRecentActivities();
    }, [])
  );

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

  const renderRecentActivity = ({ item }) => (
    <TouchableOpacity onPress={() => handleActivityPress(item)} style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <View style={[styles.activityTypeLabel, { backgroundColor: getActivityTypeColor(item) }]}>
          <Text style={styles.activityTypeText}>{getActivityTypeLabel(item)}</Text>
        </View>
      </View>
      <Text style={styles.activitySubtitle}>{getActivitySubtitle(item)}</Text>
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
              <Dashboard stats={stats} />
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recent activities</Text>
            <Text style={styles.emptySubtext}>Start logging your training sessions!</Text>
          </View>
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