import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useAuth } from '../../auth/context';
import useHomeData from '../../hooks/useHomeData';
import HomeDashboardSection from '../../components/HomeDashboardSection';
import RecentActivitiesHeader from '../../components/RecentActivitiesHeader';
import RecentActivitiesEmptyState from '../../components/RecentActivitiesList';
import ActivityCard from '../../components/ActivityCard';
import colors from '../../constants/colors';

export default function HomeScreen() {
  const { user } = useAuth();
  const { recentActivities, stats, loadingActivities, loadingStats } = useHomeData();

  const renderActivity = ({ item }) => <ActivityCard activity={item} />;

  const renderHeader = () => (
    <View>
      <HomeDashboardSection stats={stats} loading={loadingStats} />
      <RecentActivitiesHeader />
    </View>
  );

  const renderEmpty = () => (
    <RecentActivitiesEmptyState loading={loadingActivities} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={recentActivities}
        renderItem={renderActivity}
        keyExtractor={(item) => `${item.activityType}-${item._id}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
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
});