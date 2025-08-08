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