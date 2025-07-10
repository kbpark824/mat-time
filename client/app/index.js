import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../auth/context';
import apiClient from '../api/client';
import Dashboard from '../components/Dashboard';
import colors from '../constants/colors';
import Paywall from '../components/Paywall';

export default function HomeScreen() {
  const { logout, user, setUser } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
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

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('keyword', searchQuery);
      }
      if (selectedTags.length > 0 && isPro) {
        params.append('tags', selectedTags.join(','));
      }
      const response = await apiClient.get(`/sessions?${params.toString()}`);
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
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
    }, [])
  );

  useEffect(() => {
    const handler = setTimeout(() => {
        fetchSessions();
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, selectedTags, isPro]);

  const renderItem = ({ item }) => (
    <Pressable onPress={() => router.push({ 
        pathname: '/logSession', 
        params: { id: item._id, session: JSON.stringify(item) } 
    })}>
        <View style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{new Date(item.date).toLocaleDateString()}</Text>
                <Text style={styles.itemSubtitle}>{item.type} - {item.duration}h</Text>
            </View>
            <Text style={styles.notes} numberOfLines={2}>
              {item.techniqueNotes || "No technique notes."}
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

  const [showPaywall, setShowPaywall] = useState(false);

  const handlePurchase = () => {
    // Update user's premium status in context
    setUser(prevUser => ({
      ...prevUser,
      isPro: true
    }));
    setShowPaywall(false);
  };

  if (showPaywall) {
    return <Paywall onPurchaseCompleted={handlePurchase} onClose={() => setShowPaywall(false)} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <Dashboard stats={stats} />

            <View style={styles.listHeader}>
              <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/logSession')}>
                  <Text style={styles.primaryButtonText}>Log New Session</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={logout}>
                  <Text style={styles.secondaryButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search notes..."
                    placeholderTextColor={colors.mutedAccent}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
              </View>
              <Pressable onPress={() => !isPro && setShowPaywall(true)}>
                <View>
                  <Text style={styles.filterTitle}>Filter by Tag (Premium)</Text>
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
              <Text style={styles.sessionsTitle}>Recent Sessions</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View>
            <Text style={styles.emptyText}>No sessions found.</Text>
          </View>
        }
        style={{ backgroundColor: colors.primaryBackground }} 
      />
      {loading && <ActivityIndicator size="large" color={colors.primaryText} style={StyleSheet.absoluteFill} />}
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBackground },
    headerButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, paddingHorizontal: 0 },
    primaryButton: {
      backgroundColor: colors.primaryText,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primaryText,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: colors.primaryText,
      fontSize: 16,
      fontWeight: 'bold',
    },
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
    filterTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginHorizontal: 0,
      marginBottom: 5,
      color: colors.primaryText,
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
});