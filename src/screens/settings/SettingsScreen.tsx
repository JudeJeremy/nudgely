import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const navigation = useNavigation();
  
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
  
  // Request calendar permissions
  const requestCalendarPermissions = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Calendar permissions are required for calendar sync to work.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
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
      
      // Get available calendars
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find((cal) => cal.isPrimary) || calendars[0];
      
      if (defaultCalendar) {
        dispatch(
          updateCalendarSettings({
            syncEnabled: true,
            calendarId: defaultCalendar.id,
          })
        );
      } else {
        Alert.alert('No Calendars Found', 'No calendars were found on your device.');
      }
    } else {
      dispatch(updateCalendarSettings({ syncEnabled: false }));
    }
  };
  
  // Handle calendar sync setting toggle
  const handleCalendarSyncSettingToggle = (
    value: boolean,
    setting: 'syncTasks' | 'syncHabits'
  ) => {
    dispatch(updateCalendarSettings({ [setting]: value }));
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
      <ScrollView style={dynamicStyles.container}>
      
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
