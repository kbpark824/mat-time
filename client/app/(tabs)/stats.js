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

import React, { useState } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import AdvancedAnalytics from '../../components/AdvancedAnalytics';
import ProFeatureOverlay from '../../components/ProFeatureOverlay';
import Paywall from '../../components/Paywall';
import { useProStatus } from '../../hooks/useProStatus';
import colors from '../../constants/colors';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function StatsScreen() {
  const { isPro: isProUser } = useProStatus();
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <ErrorBoundary fallbackMessage="Unable to load stats screen. Please try refreshing.">
      <View style={styles.container}>
        {isProUser ? (
          <AdvancedAnalytics />
        ) : (
          <ProFeatureOverlay
            title="Advanced Analytics"
            description="Get detailed insights into your training progress, technique focus, and performance trends"
            onUpgrade={() => setShowPaywall(true)}
            onClose={() => {}} // No close action needed for this screen
          >
            <AdvancedAnalytics />
          </ProFeatureOverlay>
        )}

        <Modal
          visible={showPaywall}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPaywall(false)}
        >
          <Paywall onClose={() => setShowPaywall(false)} />
        </Modal>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
});