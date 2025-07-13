import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, TextInput, TouchableOpacity, Modal } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../auth/context';
import apiClient from '../../api/client';
import Dashboard from '../../components/Dashboard';
import colors from '../../constants/colors';
import Paywall from '../../components/Paywall';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const isPro = user?.isPro || false;

  const [searchQuery, setSearchQuery] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [stats, setStats] = useState(null);

  const toggleTag = (tagName) => {
    if (!isPro) {
      return;
    }
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName) 
        : [...prev, tagName]
    );
  };

  const fetchAllActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('keyword', searchQuery);
      }
      if (selectedTags.length > 0 && isPro) {
        params.append('tags', selectedTags.join(','));
      }
      
      // Fetch all three types of activities in parallel with error handling
      const requests = [
        apiClient.get(`/sessions?${params.toString()}`).catch(() => ({ data: [] })),
        apiClient.get(`/seminars?${params.toString()}`).catch(() => ({ data: [] })),
        apiClient.get(`/competitions?${params.toString()}`).catch(() => ({ data: [] }))
      ];
      
      const [sessionsResponse, seminarsResponse, competitionsResponse] = await Promise.all(requests);

      // Add activity type to each item and combine
      const sessions = sessionsResponse.data.map(item => ({ ...item, activityType: 'session' }));
      const seminars = seminarsResponse.data.map(item => ({ ...item, activityType: 'seminar' }));
      const competitions = competitionsResponse.data.map(item => ({ ...item, activityType: 'competition' }));

      // Combine and sort by date (newest first)
      const combined = [...sessions, ...seminars, ...competitions];
      combined.sort((a, b) => new Date(b.date) - new Date(a.date));

      setAllActivities(combined);
    } catch (error) {
      console.error('Failed to fetch activities', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
        const response = await apiClient.get('/tags');
        setAllTags(response.data);
    } catch (error) {
        console.error('Failed to fetch tags', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/stats/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTags();
      fetchStats();
      fetchAllActivities();
    }, [])
  );

  useEffect(() => {
    const handler = setTimeout(() => {
        fetchAllActivities();
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, selectedTags, isPro]);

  const getActivityDetails = (item) => {
    switch (item.activityType) {
      case 'session':
        return {
          pathname: '/logSession',
          params: { id: item._id, session: JSON.stringify(item) },
          subtitle: `${item.type} - ${item.duration}h`,
          notes: item.techniqueNotes || "No technique notes.",
          typeLabel: 'Training Session'
        };
      case 'seminar':
        return {
          pathname: '/logSeminar',
          params: { id: item._id, seminar: JSON.stringify(item) },
          subtitle: `${item.type} - ${item.professorName}`,
          notes: item.techniqueNotes || "No technique notes.",
          typeLabel: 'Seminar'
        };
      case 'competition':
        return {
          pathname: '/logCompetition',
          params: { id: item._id, competition: JSON.stringify(item) },
          subtitle: `${item.type} - ${item.organization}`,
          notes: item.generalNotes || "No notes.",
          typeLabel: 'Competition'
        };
      default:
        return {
          pathname: '/logSession',
          params: { id: item._id, session: JSON.stringify(item) },
          subtitle: item.type,
          notes: "No notes.",
          typeLabel: 'Activity'
        };
    }
  };

  const renderItem = ({ item }) => {
    const details = getActivityDetails(item);
    
    return (
      <Pressable onPress={() => router.push(details)}>
          <View style={styles.itemContainer}>
              <View style={styles.itemHeader}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{new Date(item.date).toLocaleDateString()}</Text>
                    <View style={[styles.activityTypeLabel, 
                      item.activityType === 'session' ? styles.sessionTypeLabel :
                      item.activityType === 'seminar' ? styles.seminarTypeLabel :
                      styles.competitionTypeLabel
                    ]}>
                      <Text style={styles.activityTypeLabelText}>{details.typeLabel}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemSubtitle}>{details.subtitle}</Text>
              </View>
              <Text style={styles.notes} numberOfLines={2}>
                {details.notes}
              </Text>
              <View style={styles.tagRow}>
                  {item.tags.map(tag => (
                      <View key={tag._id} style={styles.tag}>
                          <Text style={styles.tagText}>{tag.name}</Text>
                      </View>
                  ))}
              </View>
          </View>
      </Pressable>
    );
  };

  const [showPaywall, setShowPaywall] = useState(false);

  const handlePurchase = () => {
    // This will be handled by the paywall component
    setShowPaywall(false);
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={allActivities}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <Dashboard stats={stats} />

            <View style={styles.listHeader}>
              <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search activities..."
                    placeholderTextColor={colors.mutedAccent}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
              </View>
              <Pressable onPress={() => !isPro && setShowPaywall(true)}>
                <View>
                  <View style={styles.filterTitleRow}>
                    <Text style={styles.filterTitle}>Filter by Tag</Text>
                    {!isPro && <Text style={styles.proLabel}>PRO</Text>}
                  </View>
                  <FlatList
                      data={allTags}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item) => item._id}
                      renderItem={({ item }) => {
                          const isSelected = selectedTags.includes(item.name);
                          return (
                              <TouchableOpacity onPress={() => toggleTag(item.name)} disabled={!isPro}>
                                  <View style={[styles.tag, isSelected && styles.tagSelected, !isPro && styles.disabledTag]}>
                                      <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{item.name}</Text>
                                  </View>
                              </TouchableOpacity>
                          );
                      }}
                      ListEmptyComponent={<Text style={styles.noTagsText}>No tags created yet.</Text>}
                  />
                </View>
              </Pressable>
              <Text style={styles.sessionsTitle}>Recent Activities</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View>
            <Text style={styles.emptyText}>No activities found.</Text>
          </View>
        }
        style={{ backgroundColor: colors.primaryBackground }} 
      />
      {loading && <ActivityIndicator size="large" color={colors.primaryText} style={StyleSheet.absoluteFill} />}
      
      {/* Paywall Modal */}
      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handlePaywallClose}
      >
        <Paywall
          onPurchaseCompleted={handlePurchase}
          onClose={handlePaywallClose}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBackground },
    itemContainer: { 
        padding: 15, 
        backgroundColor: colors.white, 
        marginBottom: 10, 
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemTitle: { fontSize: 16, fontWeight: 'bold', color: colors.primaryText },
    itemSubtitle: { fontSize: 14, color: colors.mutedAccent },
    notes: { fontStyle: 'italic', color: colors.primaryText, marginBottom: 10 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: colors.mutedAccent, paddingBottom: 200 },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: colors.lightBackground,
        borderRadius: 15,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginRight: 5,
        marginBottom: 5,
    },
    tagText: {
        color: colors.primaryText,
        fontSize: 12,
    },
    searchContainer: {
      paddingHorizontal: 0,
      marginBottom: 10,
    },
    searchInput: {
      height: 40,
      borderColor: colors.lightBackground,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      backgroundColor: colors.white,
      color: colors.primaryText,
    },
    filterTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    filterTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginHorizontal: 0,
      color: colors.primaryText,
    },
    proLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.white,
      backgroundColor: colors.mutedAccent,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      marginLeft: 8,
      textAlign: 'center',
      overflow: 'hidden',
    },
    tagSelected: {
      backgroundColor: colors.primaryText,
    },
    tagTextSelected: {
      color: colors.white,
    },
    noTagsText: {
      paddingHorizontal: 10,
      color: colors.mutedAccent,
      fontStyle: 'italic',
    },
    listHeader: {
      padding: 10,
      backgroundColor: colors.primaryBackground,
    },
    sessionsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
      paddingHorizontal: 5,
      color: colors.primaryText,
    },
    disabledTag: {
      backgroundColor: colors.lightBackground,
      opacity: 0.5,
    },
    itemTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    activityTypeLabel: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 60,
      alignItems: 'center',
    },
    sessionTypeLabel: {
      backgroundColor: '#E3F2FD', // Light blue
    },
    seminarTypeLabel: {
      backgroundColor: '#E8F5E8', // Light green
    },
    competitionTypeLabel: {
      backgroundColor: '#FFF3E0', // Light orange
    },
    activityTypeLabelText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.primaryText,
    },
});