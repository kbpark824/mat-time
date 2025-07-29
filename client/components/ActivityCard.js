import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '../constants/colors';
import { 
  getActivityTypeLabel, 
  getActivityTypeColor, 
  getActivitySubtitle, 
  getNotesExcerpt,
  getActivityRoute 
} from '../utils/activityHelpers';

export default function ActivityCard({ activity }) {
  const router = useRouter();

  const handlePress = useCallback(() => {
    const route = getActivityRoute(activity);
    if (route) {
      router.push(`/${route}?id=${activity._id}`);
    }
  }, [activity, router]);

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${getActivityTypeLabel(activity)} from ${new Date(activity.date).toLocaleDateString()}`}
      accessibilityHint="Tap to view and edit this activity"
    >
      <View style={styles.header}>
        <Text style={styles.date}>{new Date(activity.date).toLocaleDateString()}</Text>
        <View style={[styles.typeLabel, { backgroundColor: getActivityTypeColor(activity) }]}>
          <Text style={styles.typeText}>{getActivityTypeLabel(activity)}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>{getActivitySubtitle(activity)}</Text>
      <Text style={styles.notes}>{getNotesExcerpt(activity)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
  },
  typeLabel: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primaryText,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedAccent,
    marginBottom: 6,
  },
  notes: {
    fontSize: 13,
    color: colors.primaryText,
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 18,
  },
});