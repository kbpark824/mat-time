import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActionSheetIOS, Platform, Alert, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import colors from '../../constants/colors';

export default function TabLayout() {
  const router = useRouter();

  const showActionSheet = () => {
    // Haptic feedback for better UX
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const options = [
      'Log New Session',
      'Log New Seminar', 
      'Log New Competition',
      'Cancel'
    ];

    const destructiveButtonIndex = -1; // No destructive options
    const cancelButtonIndex = 3;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
          title: 'What would you like to add?',
          message: 'Choose an option to log your martial arts activity',
          userInterfaceStyle: 'dark', // Match app theme
        },
        (buttonIndex) => {
          handleActionSheetResponse(buttonIndex);
        }
      );
    } else {
      // Android fallback using Alert
      Alert.alert(
        'What would you like to add?',
        'Choose an option to log your martial arts activity',
        [
          { text: 'Log New Session', onPress: () => handleActionSheetResponse(0) },
          { text: 'Log New Seminar', onPress: () => handleActionSheetResponse(1) },
          { text: 'Log New Competition', onPress: () => handleActionSheetResponse(2) },
          { text: 'Cancel', onPress: () => handleActionSheetResponse(3), style: 'cancel' },
        ]
      );
    }
  };

  const handleActionSheetResponse = (buttonIndex) => {
    switch (buttonIndex) {
      case 0:
        // Navigate to existing session logging modal
        router.push('/logSession');
        break;
      case 1:
        // Placeholder for seminar logging (future feature)
        Alert.alert(
          'Coming Soon',
          'Seminar logging will be available in a future update!',
          [{ text: 'OK' }]
        );
        break;
      case 2:
        // Placeholder for competition logging (future feature)
        Alert.alert(
          'Coming Soon', 
          'Competition logging will be available in a future update!',
          [{ text: 'OK' }]
        );
        break;
      case 3:
      default:
        // Cancel - do nothing
        break;
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.mutedAccent,
        tabBarStyle: {
          backgroundColor: colors.primaryBackground,
          borderTopColor: colors.mutedAccent,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: colors.primaryBackground,
        },
        headerTintColor: colors.primaryText,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              width: size + 2,
              height: size + 2,
              backgroundColor: 'transparent',
              borderWidth: 2.5,
              borderColor: focused ? colors.primaryText : colors.mutedAccent,
              borderRadius: 6,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons 
                name="add" 
                size={size - 3} 
                color={focused ? colors.primaryText : colors.mutedAccent} 
              />
            </View>
          ),
          tabBarLabel: () => null, // Hide the label
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default navigation
            e.preventDefault();
            // Show action sheet instead
            showActionSheet();
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}