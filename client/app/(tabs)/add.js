import React from 'react';
import { View } from 'react-native';
import colors from '../../constants/colors';

// This is a placeholder component that should never be visible
// The actual functionality is handled by the tabPress listener in _layout.js
export default function AddTab() {
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.primaryBackground 
    }} />
  );
}