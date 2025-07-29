import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import Tooltip from './Tooltip';

export default function HelpIcon({ title, content, size = 20 }) {
  return (
    <View style={styles.container}>
      <Tooltip title={title} content={content}>
        <Ionicons 
          name="help-circle-outline" 
          size={size} 
          color={colors.mutedAccent}
          style={styles.icon}
        />
      </Tooltip>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    opacity: 0.7,
  },
});