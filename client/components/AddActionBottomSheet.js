import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

const { height: screenHeight } = Dimensions.get('window');

export default function AddActionBottomSheet({ visible, onClose, onSelectOption, isPro = false }) {
  const translateY = React.useRef(new Animated.Value(screenHeight)).current;
  const [modalVisible, setModalVisible] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setModalVisible(true);
      // Small delay to ensure modal is rendered before animation
      requestAnimationFrame(() => {
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    } else {
      // When parent wants to close, just animate out
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible]);

  const handleOptionPress = (option) => {
    onSelectOption(option);
    closeWithAnimation();
  };

  const handleBackdropPress = () => {
    closeWithAnimation();
  };

  const closeWithAnimation = () => {
    Animated.timing(translateY, {
      toValue: screenHeight,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setModalVisible(false);
      // Reset for next time
      translateY.setValue(screenHeight);
      onClose();
    });
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to downward swipes that are more vertical than horizontal
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 5;
      },
      onPanResponderGrant: () => {
        // Stop any running animations and set offset
        translateY.stopAnimation((value) => {
          translateY.setOffset(value);
          translateY.setValue(0);
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        // Allow smooth dragging - follow finger exactly
        translateY.setValue(Math.max(0, gestureState.dy));
      },
      onPanResponderRelease: (evt, gestureState) => {
        translateY.flattenOffset();
        
        const shouldClose = gestureState.dy > 100 || gestureState.vy > 0.8;
        
        if (shouldClose) {
          closeWithAnimation();
        } else {
          // Smooth snap back animation
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: false,
            tension: 300,
            friction: 30,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        // Handle termination gracefully
        translateY.flattenOffset();
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: false,
          tension: 300,
          friction: 30,
        }).start();
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      onRequestClose={closeWithAnimation}
      accessibilityViewIsModal={true}
    >
      {/* Backdrop */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={handleBackdropPress}
        accessibilityRole="button"
        accessibilityLabel="Close action menu"
        accessibilityHint="Tap to dismiss the action menu"
      >
        {/* Bottom Sheet */}
        <Animated.View 
          style={[
            styles.bottomSheet,
            {
              transform: [
                { translateY: translateY }
              ]
            }
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle Bar */}
          <View 
            style={styles.handleBar} 
            accessibilityRole="none"
            accessibilityLabel="Drag handle"
            accessibilityHint="Swipe down to close menu"
          />
          
          {/* Title */}
          <Text 
            style={styles.title}
            accessibilityRole="header"
            accessibilityLevel={2}
          >
            What would you like to add?
          </Text>
          
          {/* Options */}
          <View style={styles.optionsContainer}>
            
            {/* Log New Session */}
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => handleOptionPress('session')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Log new training session"
              accessibilityHint="Opens form to record your training session details, duration, and techniques"
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="fitness" size={24} color={colors.accent} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Log New Session</Text>
                <Text style={styles.optionSubtitle}>Record your training session</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedAccent} />
            </TouchableOpacity>

            {/* Log New Seminar */}
            <TouchableOpacity 
              style={[styles.optionButton, !isPro && styles.proOptionButton]}
              onPress={() => handleOptionPress('seminar')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={isPro ? "Log new seminar" : "Log new seminar - Pro feature"}
              accessibilityHint={isPro ? "Opens form to record seminar or workshop details" : "Upgrade to Pro to log seminars and workshops"}
              accessibilityState={{ disabled: !isPro }}
            >
              <View style={[styles.optionIconContainer, !isPro && styles.proIconContainer]}>
                <Ionicons name="school" size={24} color={!isPro ? colors.mutedAccent : colors.accent} />
              </View>
              <View style={styles.optionTextContainer}>
                <View style={styles.optionTitleRow}>
                  <Text style={[styles.optionTitle, !isPro && styles.proOptionTitle]}>Log New Seminar</Text>
                  {!isPro && <Text style={styles.proLabel}>PRO</Text>}
                </View>
                <Text style={[styles.optionSubtitle, !isPro && styles.proOptionSubtitle]}>Record seminar or workshop</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedAccent} />
            </TouchableOpacity>

            {/* Log New Competition */}
            <TouchableOpacity 
              style={[styles.optionButton, !isPro && styles.proOptionButton]}
              onPress={() => handleOptionPress('competition')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={isPro ? "Log new competition" : "Log new competition - Pro feature"}
              accessibilityHint={isPro ? "Opens form to record competition or tournament results" : "Upgrade to Pro to log competitions and tournaments"}
              accessibilityState={{ disabled: !isPro }}
            >
              <View style={[styles.optionIconContainer, !isPro && styles.proIconContainer]}>
                <Ionicons name="trophy" size={24} color={!isPro ? colors.mutedAccent : colors.accent} />
              </View>
              <View style={styles.optionTextContainer}>
                <View style={styles.optionTitleRow}>
                  <Text style={[styles.optionTitle, !isPro && styles.proOptionTitle]}>Log New Competition</Text>
                  {!isPro && <Text style={styles.proLabel}>PRO</Text>}
                </View>
                <Text style={[styles.optionSubtitle, !isPro && styles.proOptionSubtitle]}>Record competition or tournament</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedAccent} />
            </TouchableOpacity>

          </View>

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
    backgroundColor: colors.primaryBackground,
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
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
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
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 0,
  },
  optionSubtitle: {
    fontSize: 14,
    color: colors.mutedAccent,
  },
  proOptionButton: {
    backgroundColor: colors.lightBackground,
    opacity: 0.6,
  },
  proIconContainer: {
    backgroundColor: colors.lightBackground,
  },
  proOptionTitle: {
    color: colors.mutedAccent,
  },
  proOptionSubtitle: {
    color: colors.mutedAccent,
    opacity: 0.7,
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
});