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

import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '../constants/colors';
import { 
  getActivityTypeLabel, 
  getActivityTypeColor, 
  getActivitySubtitle, 
  getNotesExcerpt,
  getActivityRoute 
} from '../utils/activityHelpers';

export default function SearchResults({ 
  activities, 
  hasSearchCriteria,
  keyboardShouldPersistTaps = "handled" 
}) {
  const router = useRouter();

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

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {hasSearchCriteria
          ? 'No activities match your search criteria'
          : 'No activities found'
        }
      </Text>
      <Text style={styles.emptySubtext}>
        {hasSearchCriteria
          ? 'Try adjusting your search or filters'
          : 'Start logging your training sessions!'
        }
      </Text>
    </View>
  );

  return (
    <FlatList
      data={activities}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.activityType}-${item._id}`}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      ListEmptyComponent={renderEmptyComponent}
      style={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.primaryBackground,
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
});