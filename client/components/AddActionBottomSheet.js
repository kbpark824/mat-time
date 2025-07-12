import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

const { height: screenHeight } = Dimensions.get('window');

export default function AddActionBottomSheet({ visible, onClose, onSelectOption }) {
  const slideAnim = React.useRef(new Animated.Value(screenHeight)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleOptionPress = (option) => {
    onSelectOption(option);
    onClose();
  };

  const handleBackdropPress = () => {
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={handleBackdropPress}
      >
        {/* Bottom Sheet */}
        <Animated.View 
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleBar} />
          
          {/* Title */}
          <Text style={styles.title}>What would you like to add?</Text>
          
          {/* Options */}
          <View style={styles.optionsContainer}>
            
            {/* Log New Session */}
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => handleOptionPress('session')}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="fitness" size={24} color={colors.primaryText} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Log New Session</Text>
                <Text style={styles.optionSubtitle}>Record your training session</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedAccent} />
            </TouchableOpacity>

            {/* Log New Seminar */}
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => handleOptionPress('seminar')}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="school" size={24} color={colors.primaryText} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Log New Seminar</Text>
                <Text style={styles.optionSubtitle}>Record seminar or workshop</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedAccent} />
            </TouchableOpacity>

            {/* Log New Competition */}
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => handleOptionPress('competition')}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="trophy" size={24} color={colors.primaryText} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Log New Competition</Text>
                <Text style={styles.optionSubtitle}>Record competition or tournament</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedAccent} />
            </TouchableOpacity>

          </View>

          {/* Cancel Button */}
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: screenHeight * 0.7,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.mutedAccent,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.primaryBackground,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: colors.mutedAccent,
  },
  cancelButton: {
    backgroundColor: colors.lightBackground,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
  },
});