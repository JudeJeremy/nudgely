import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';

// Import screens
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { HabitsScreen } from '../screens/habits/HabitsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { NotificationTestScreen } from '../screens/settings/NotificationTestScreen';
import { TodayScreen } from '../screens/today/TodayScreen';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each tab
const TasksStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TasksList" component={TasksScreen} />
    </Stack.Navigator>
  );
};

const HabitsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HabitsList" component={HabitsScreen} />
    </Stack.Navigator>
  );
};

const TodayStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TodayMain" component={TodayScreen} />
    </Stack.Navigator>
  );
};

const SettingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="NotificationTest" component={NotificationTestScreen} />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors_extended.secondary[theme.dark ? 'dark' : 'light'],
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8, // Use safe area or fallback
          paddingTop: 8,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0), // Adjust height based on safe area
          borderTopWidth: 1,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Today') {
            iconName = focused ? 'today' : 'today-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Habits') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayStack} />
      <Tab.Screen name="Tasks" component={TasksStack} />
      <Tab.Screen name="Habits" component={HabitsStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: theme.colors.background,
      paddingTop: insets.top, // Handle status bar area
    }}>
      <NavigationContainer theme={theme}>
        <TabNavigator />
      </NavigationContainer>
      {/* Fill bottom safe area with tab bar background color */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: insets.bottom,
        backgroundColor: theme.colors.card,
      }} />
    </View>
  );
};
