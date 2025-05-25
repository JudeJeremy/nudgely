import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  updateNotificationSettings,
  updateThemeSettings,
  updateCalendarSettings,
  resetSettings,
} from '../../store/slices/settingsSlice';
import { Card } from '../../components/common/Card';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';
import * as Notifications from 'expo-notifications';
import * as Calendar from 'expo-calendar';
import {
  requestCalendarPermissions,
  getOrCreateNudgelyCalendar,
  syncTasksToCalendar,
  syncHabitsToCalendar,
  deleteAllNudgelyEvents,
} from '../../utils/calendar';

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // Local state for time picker
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Request notification permissions
  const requestNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Notification permissions are required for reminders to work.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };
  
  
  // Handle notification toggle
  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) return;
    }
    
    dispatch(updateNotificationSettings({ enabled: value }));
  };
  
  // Handle notification setting toggle
  const handleNotificationSettingToggle = (
    value: boolean,
    setting: keyof typeof settings.notifications
  ) => {
    dispatch(updateNotificationSettings({ [setting]: value }));
  };
  
  // Handle theme mode change
  const handleThemeModeChange = (mode: 'light' | 'dark' | 'system') => {
    dispatch(updateThemeSettings({ mode }));
  };
  
  
  // Handle calendar sync toggle
  const handleCalendarSyncToggle = async (value: boolean) => {
    if (value) {
      const hasPermission = await requestCalendarPermissions();
      if (!hasPermission) return;
      
      // Get or create Nudgely calendar
      const calendarId = await getOrCreateNudgelyCalendar();
      
      if (calendarId) {
        dispatch(
          updateCalendarSettings({
            syncEnabled: true,
            calendarId: calendarId,
          })
        );
        
        // Check if we created a new calendar or are using an existing one
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const nudgelyCalendar = calendars.find(cal => cal.id === calendarId);
        const calendarName = nudgelyCalendar?.title || 'Unknown Calendar';
        
        if (calendarName === 'Nudgely') {
          Alert.alert(
            'Calendar Sync Enabled',
            'A "Nudgely" calendar has been created. Your tasks and habits will be synced to this calendar.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Calendar Sync Enabled',
            `Calendar sync is now enabled using your "${calendarName}" calendar. Your tasks and habits will be synced to this calendar.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert('Calendar Creation Failed', 'Unable to create or access calendar for syncing.');
      }
    } else {
      // When disabling sync, ask user what to do with existing events
      if (settings.calendar.syncedEventIds.length > 0) {
        Alert.alert(
          'Calendar Sync Disabled',
          'What would you like to do with existing Nudgely events in your calendar?',
          [
            {
              text: 'Keep Events',
              onPress: () => {
                dispatch(updateCalendarSettings({ syncEnabled: false }));
              },
            },
            {
              text: 'Remove Events',
              style: 'destructive',
              onPress: async () => {
                try {
                  const deletedCount = await deleteAllNudgelyEvents(settings.calendar.syncedEventIds);
                  dispatch(updateCalendarSettings({ 
                    syncEnabled: false,
                    syncedEventIds: []
                  }));
                  
                  Alert.alert(
                    'Events Removed',
                    `Successfully removed ${deletedCount} events from your calendar.`,
                    [{ text: 'OK' }]
                  );
                } catch (error) {
                  console.error('Error removing calendar events:', error);
                  Alert.alert('Cleanup Failed', 'Some events could not be removed from your calendar.');
                  dispatch(updateCalendarSettings({ syncEnabled: false }));
                }
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                // Don't change anything - user cancelled
              },
            },
          ]
        );
      } else {
        // No events to clean up, just disable sync
        dispatch(updateCalendarSettings({ syncEnabled: false }));
      }
    }
  };
  
  // Handle calendar sync setting toggle
  const handleCalendarSyncSettingToggle = (
    value: boolean,
    setting: 'syncTasks' | 'syncHabits'
  ) => {
    dispatch(updateCalendarSettings({ [setting]: value }));
  };
  
  // Handle test calendar sync
  const handleTestCalendarSync = async () => {
    if (!settings.calendar.calendarId) {
      Alert.alert('Error', 'No calendar ID found. Please disable and re-enable calendar sync.');
      return;
    }
    
    try {
      // Get current tasks and habits from the store
      const { getState } = require('../../store').store;
      const state = getState();
      const tasks = state.tasks.tasks;
      const habits = state.habits.habits;
      
      let syncedCount = 0;
      const allEventIds: string[] = [];
      
      if (settings.calendar.syncTasks) {
        const taskResult = await syncTasksToCalendar(tasks, settings.calendar.calendarId);
        syncedCount += taskResult.count;
        allEventIds.push(...taskResult.eventIds);
      }
      
      if (settings.calendar.syncHabits) {
        const habitResult = await syncHabitsToCalendar(habits, settings.calendar.calendarId);
        syncedCount += habitResult.count;
        allEventIds.push(...habitResult.eventIds);
      }
      
      // Store the event IDs for future cleanup
      dispatch(updateCalendarSettings({ 
        syncedEventIds: [...settings.calendar.syncedEventIds, ...allEventIds] 
      }));
      
      Alert.alert(
        'Calendar Sync Complete',
        `Successfully synced ${syncedCount} events to your Nudgely calendar. Check your device's calendar app to see the events.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error testing calendar sync:', error);
      Alert.alert('Sync Failed', 'Failed to sync events to calendar. Please try again.');
    }
  };
  
  // Handle reset settings
  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => dispatch(resetSettings()),
        },
      ]
    );
  };
  
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    card: {
      marginBottom: theme.spacing.md,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    settingLabel: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    settingDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      opacity: 0.7,
      marginTop: 2,
    },
    themeButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
    },
    themeButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginHorizontal: theme.spacing.xs,
      alignItems: 'center',
    },
    themeButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    themeButtonText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    themeButtonTextActive: {
      color: 'white',
    },
    resetButton: {
      marginTop: theme.spacing.lg,
      alignSelf: 'center',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.sm,
    },
    buttonContainer: {
      marginTop: theme.spacing.md,
    },
    versionText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      opacity: 0.5,
      textAlign: 'center',
      marginTop: theme.spacing.xl,
    },
  });
  
  // Render theme mode button
  const renderThemeModeButton = (mode: 'light' | 'dark' | 'system', label: string) => {
    const isActive = settings.theme.mode === mode;
    
    return (
      <TouchableOpacity
        style={[
          dynamicStyles.themeButton,
          isActive && dynamicStyles.themeButtonActive,
        ]}
        onPress={() => handleThemeModeChange(mode)}
      >
        <Text
          style={[
            dynamicStyles.themeButtonText,
            isActive && dynamicStyles.themeButtonTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header 
        title="Settings" 
        rightComponent={
          <TouchableOpacity onPress={handleResetSettings}>
            <Text style={{ color: theme.colors_extended.danger[theme.dark ? 'dark' : 'light'], fontSize: 16, fontWeight: '600' }}>
              Reset
            </Text>
          </TouchableOpacity>
        }
      />
      <ScrollView 
        style={dynamicStyles.container}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 80, 100), // Tab bar height + extra padding
        }}
        showsVerticalScrollIndicator={false}
      >
      
      {/* Appearance Settings */}
      <Text style={dynamicStyles.sectionTitle}>Appearance</Text>
      <Card style={dynamicStyles.card}>
        <View style={dynamicStyles.settingRow}>
          <View>
            <Text style={dynamicStyles.settingLabel}>Theme Mode</Text>
            <Text style={dynamicStyles.settingDescription}>
              Choose between light, dark, or system theme
            </Text>
          </View>
        </View>
        
        <View style={dynamicStyles.themeButtonContainer}>
          {renderThemeModeButton('light', 'Light')}
          {renderThemeModeButton('dark', 'Dark')}
          {renderThemeModeButton('system', 'System')}
        </View>
        
      </Card>
      
      {/* Notification Settings */}
      <Text style={dynamicStyles.sectionTitle}>Notifications</Text>
      <Card style={dynamicStyles.card}>
        <View style={dynamicStyles.settingRow}>
          <View>
            <Text style={dynamicStyles.settingLabel}>Enable Notifications</Text>
            <Text style={dynamicStyles.settingDescription}>
              Receive reminders and updates
            </Text>
          </View>
          <Switch
            value={settings.notifications.enabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={settings.notifications.enabled ? '#fff' : '#f4f3f4'}
          />
        </View>
        
        <View style={dynamicStyles.buttonContainer}>
          <Button
            title="Test Notifications"
            onPress={() => navigation.navigate('NotificationTest' as never)}
            variant="outline"
          />
        </View>
        
        {settings.notifications.enabled && (
          <>
            <View style={dynamicStyles.divider} />
            
            <View style={dynamicStyles.settingRow}>
              <Text style={dynamicStyles.settingLabel}>Task Reminders</Text>
              <Switch
                value={settings.notifications.taskReminders}
                onValueChange={(value) =>
                  handleNotificationSettingToggle(value, 'taskReminders')
                }
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.notifications.taskReminders ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={dynamicStyles.settingRow}>
              <Text style={dynamicStyles.settingLabel}>Habit Reminders</Text>
              <Switch
                value={settings.notifications.habitReminders}
                onValueChange={(value) =>
                  handleNotificationSettingToggle(value, 'habitReminders')
                }
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.notifications.habitReminders ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            
            <View style={dynamicStyles.settingRow}>
              <Text style={dynamicStyles.settingLabel}>Daily Summary</Text>
              <Switch
                value={settings.notifications.dailySummary}
                onValueChange={(value) =>
                  handleNotificationSettingToggle(value, 'dailySummary')
                }
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.notifications.dailySummary ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={dynamicStyles.settingRow}>
              <Text style={dynamicStyles.settingLabel}>Motivational Messages</Text>
              <Switch
                value={settings.notifications.motivationalMessages}
                onValueChange={(value) =>
                  handleNotificationSettingToggle(value, 'motivationalMessages')
                }
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.notifications.motivationalMessages ? '#fff' : '#f4f3f4'}
              />
            </View>
          </>
        )}
      </Card>
      
      {/* Categories */}
      <Text style={dynamicStyles.sectionTitle}>Categories</Text>
      <Card style={dynamicStyles.card}>
        <TouchableOpacity
          style={dynamicStyles.settingRow}
          onPress={() => navigation.navigate('Categories' as never)}
        >
          <View>
            <Text style={dynamicStyles.settingLabel}>Manage Categories</Text>
            <Text style={dynamicStyles.settingDescription}>
              Create and customize categories for tasks and habits
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </Card>
      
      {/* Calendar Integration */}
      <Text style={dynamicStyles.sectionTitle}>Calendar Integration</Text>
      <Card style={dynamicStyles.card}>
        <View style={dynamicStyles.settingRow}>
          <View>
            <Text style={dynamicStyles.settingLabel}>Sync with Calendar</Text>
            <Text style={dynamicStyles.settingDescription}>
              Add tasks and habits to your calendar
            </Text>
          </View>
          <Switch
            value={settings.calendar.syncEnabled}
            onValueChange={handleCalendarSyncToggle}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={settings.calendar.syncEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
        
        {settings.calendar.syncEnabled && (
          <>
            <View style={dynamicStyles.divider} />
            
            <View style={dynamicStyles.settingRow}>
              <Text style={dynamicStyles.settingLabel}>Sync Tasks</Text>
              <Switch
                value={settings.calendar.syncTasks}
                onValueChange={(value) =>
                  handleCalendarSyncSettingToggle(value, 'syncTasks')
                }
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.calendar.syncTasks ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={dynamicStyles.settingRow}>
              <Text style={dynamicStyles.settingLabel}>Sync Habits</Text>
              <Switch
                value={settings.calendar.syncHabits}
                onValueChange={(value) =>
                  handleCalendarSyncSettingToggle(value, 'syncHabits')
                }
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.calendar.syncHabits ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={dynamicStyles.buttonContainer}>
              <Button
                title="Test Calendar Sync"
                onPress={handleTestCalendarSync}
                variant="outline"
              />
            </View>
          </>
        )}
      </Card>
      
      {/* Reset Settings */}
      <Button
        title="Reset All Settings"
        onPress={handleResetSettings}
        variant="danger"
        style={dynamicStyles.resetButton}
      />
      
      {/* App Version */}
      <Text style={dynamicStyles.versionText}>Nudgely v1.0.0</Text>
      </ScrollView>
    </View>
  );
};
