import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function MedalStatistics({ analytics, styles }) {
  const medals = analytics?.medals || {
    total: 0,
    totalGold: 0,
    totalSilver: 0,
    totalBronze: 0,
    division: { total: 0, gold: 0, silver: 0, bronze: 0 },
    openClass: { total: 0, gold: 0, silver: 0, bronze: 0 }
  };

  const MedalCard = ({ title, count, emoji = '🏅', subtitle = null }) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, marginRight: 8 }}>{emoji}</Text>
        <Text style={styles.metricValue}>{count}</Text>
      </View>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const MedalBreakdownCard = ({ title, goldCount, silverCount, bronzeCount }) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', flex: 1 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24 }}>🥇</Text>
          <Text style={[styles.metricValue, { fontSize: 20 }]}>{goldCount}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24 }}>🥈</Text>
          <Text style={[styles.metricValue, { fontSize: 20 }]}>{silverCount}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24 }}>🥉</Text>
          <Text style={[styles.metricValue, { fontSize: 20 }]}>{bronzeCount}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Medal Statistics</Text>
      
      {/* Total medals row */}
      <View style={styles.metricsRow}>
        <MedalCard 
          title="TOTAL MEDALS" 
          count={medals.total} 
          emoji="🏅"
          subtitle="All competitions"
        />
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>MEDAL BREAKDOWN</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 5 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16 }}>🥇</Text>
              <Text style={[styles.metricValue, { fontSize: 18 }]}>{medals.totalGold}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16 }}>🥈</Text>
              <Text style={[styles.metricValue, { fontSize: 18 }]}>{medals.totalSilver}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16 }}>🥉</Text>
              <Text style={[styles.metricValue, { fontSize: 18 }]}>{medals.totalBronze}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Division medals row */}
      <View style={styles.metricsRow}>
        <MedalBreakdownCard 
          title="DIVISION MEDALS" 
          goldCount={medals.division.gold}
          silverCount={medals.division.silver}
          bronzeCount={medals.division.bronze}
        />
        <MedalBreakdownCard 
          title="OPEN CLASS MEDALS" 
          goldCount={medals.openClass.gold}
          silverCount={medals.openClass.silver}
          bronzeCount={medals.openClass.bronze}
        />
      </View>
    </View>
  );
}