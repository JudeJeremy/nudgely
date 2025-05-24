import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  scheduleTaskReminder,
  scheduleHabitReminder,
  scheduleDailySummaryNotification,
  scheduleMotivationalNotification,
  cancelAllNotifications,
  getAllScheduledNotifications,
} from '../../utils/notifications';

export const NotificationTestScreen: React.FC = () => {
  const theme = useTheme();
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [scheduledNotifications, setScheduledNotifications] = useState<Notifications.NotificationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Check permission status on mount
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  // Check notification permission status
  const checkPermissionStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      Alert.alert('Error', 'Failed to check notification permissions');
    }
  };

  // Request notification permissions
  const requestPermissions = async () => {
    try {
      setLoading(true);
      const granted = await requestNotificationPermissions();
      setPermissionStatus(granted ? 'granted' : 'denied');
      Alert.alert(
        'Permission Status',
        granted ? 'Notification permissions granted!' : 'Notification permissions denied'
      );
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      Alert.alert('Error', 'Failed to request notification permissions');
    } finally {
      setLoading(false);
    }
  };

  // Send an immediate test notification
  const sendImmediateNotification = async () => {
    try {
      setLoading(true);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification from Nudgely',
          data: { type: 'test' },
        },
        trigger: null, // null means send immediately
      });
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  // Schedule a notification for 5 seconds in the future
  const scheduleDelayedNotification = async () => {
    try {
      setLoading(true);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Delayed Notification',
          body: 'This notification was scheduled to appear 5 seconds after you pressed the button',
          data: { type: 'delayed' },
        },
        trigger: {
          seconds: 5,
        },
      });
      Alert.alert('Success', `Delayed notification scheduled! ID: ${id}`);
      refreshScheduledNotifications();
    } catch (error) {
      console.error('Error scheduling delayed notification:', error);
      Alert.alert('Error', 'Failed to schedule delayed notification');
    } finally {
      setLoading(false);
    }
  };

  // Test task reminder notification
  const testTaskReminder = async () => {
    try {
      setLoading(true);
      // Create a mock task with a due date 1 minute in the future
      const dueDate = new Date(Date.now() + 60000);
      const mockTask = {
        id: 'test-task-' + Date.now(),
        title: 'Test Task',
        description: 'This is a test task',
        completed: false,
        dueDate: dueDate.toISOString(),
        category: 'Other',
        starred: false,
        createdAt: new Date().toISOString(),
      };

      const id = await scheduleTaskReminder(mockTask, 0.5); // 30 seconds before due date
      Alert.alert('Success', `Task reminder scheduled! ID: ${id}`);
      refreshScheduledNotifications();
    } catch (error) {
      console.error('Error scheduling task reminder:', error);
      Alert.alert('Error', 'Failed to schedule task reminder');
    } finally {
      setLoading(false);
    }
  };

  // Test habit reminder notification
  const testHabitReminder = async () => {
    try {
      setLoading(true);
      // Create a mock habit
      const mockHabit = {
        id: 'test-habit-' + Date.now(),
        title: 'Test Habit',
        description: 'This is a test habit',
        category: 'Health',
        frequency: {
          type: 'daily' as const,
          times: {
            morning: true,
            afternoon: false,
            evening: false
          }
        },
        color: '#28a745',
        createdAt: new Date().toISOString(),
        completions: [],
        currentStreak: 0,
        bestStreak: 0
      };

      // Get current time plus 1 minute
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1);
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const id = await scheduleHabitReminder(mockHabit, timeString);
      Alert.alert('Success', `Habit reminder scheduled! ID: ${id}`);
      refreshScheduledNotifications();
    } catch (error) {
      console.error('Error scheduling habit reminder:', error);
      Alert.alert('Error', 'Failed to schedule habit reminder');
    } finally {
      setLoading(false);
    }
  };

  // Test daily summary notification
  const testDailySummary = async () => {
    try {
      setLoading(true);
      // Schedule for 1 minute from now
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1);
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const id = await scheduleDailySummaryNotification(timeString);
      Alert.alert('Success', `Daily summary scheduled! ID: ${id}`);
      refreshScheduledNotifications();
    } catch (error) {
      console.error('Error scheduling daily summary:', error);
      Alert.alert('Error', 'Failed to schedule daily summary');
    } finally {
      setLoading(false);
    }
  };

  // Test motivational notification
  const testMotivational = async () => {
    try {
      setLoading(true);
      const id = await scheduleMotivationalNotification();
      Alert.alert('Success', `Motivational notification scheduled! ID: ${id}`);
      refreshScheduledNotifications();
    } catch (error) {
      console.error('Error scheduling motivational notification:', error);
      Alert.alert('Error', 'Failed to schedule motivational notification');
    } finally {
      setLoading(false);
    }
  };

  // Cancel all scheduled notifications
  const cancelAllScheduledNotifications = async () => {
    try {
      setLoading(true);
      await cancelAllNotifications();
      Alert.alert('Success', 'All scheduled notifications cancelled');
      refreshScheduledNotifications();
    } catch (error) {
      console.error('Error cancelling notifications:', error);
      Alert.alert('Error', 'Failed to cancel notifications');
    } finally {
      setLoading(false);
    }
  };

  // Refresh the list of scheduled notifications
  const refreshScheduledNotifications = async () => {
    try {
      setLoading(true);
      const notifications = await getAllScheduledNotifications();
      setScheduledNotifications(notifications);
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      Alert.alert('Error', 'Failed to get scheduled notifications');
    } finally {
      setLoading(false);
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
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
    buttonContainer: {
      marginBottom: theme.spacing.md,
    },
    statusText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    statusValue: {
      fontWeight: 'bold',
      color: 
        permissionStatus === 'granted' 
          ? theme.colors_extended.success[theme.dark ? 'dark' : 'light']
          : permissionStatus === 'denied'
          ? theme.colors_extended.danger[theme.dark ? 'dark' : 'light']
          : theme.colors_extended.warning[theme.dark ? 'dark' : 'light'],
    },
    notificationItem: {
      padding: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    notificationTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    notificationBody: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      opacity: 0.7,
    },
    notificationId: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.5,
    },
    emptyText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      opacity: 0.7,
      textAlign: 'center',
      padding: theme.spacing.lg,
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header 
        title="Notification Testing" 
        subtitle="Test notifications in Expo Go"
        showBackButton
      />
      <ScrollView style={dynamicStyles.container}>
        {/* Permission Status */}
        <Text style={dynamicStyles.sectionTitle}>Notification Permissions</Text>
        <Card style={dynamicStyles.card}>
          <Text style={dynamicStyles.statusText}>
            Current Status: <Text style={dynamicStyles.statusValue}>{permissionStatus}</Text>
          </Text>
          <View style={dynamicStyles.buttonContainer}>
            <Button 
              title="Check Permission Status" 
              onPress={checkPermissionStatus} 
              variant="outline"
              loading={loading}
            />
          </View>
          <Button 
            title="Request Permissions" 
            onPress={requestPermissions} 
            variant="primary"
            loading={loading}
          />
        </Card>

        {/* Test Notifications */}
        <Text style={dynamicStyles.sectionTitle}>Test Notifications</Text>
        <Card style={dynamicStyles.card}>
          <View style={dynamicStyles.buttonContainer}>
            <Button 
              title="Send Immediate Notification" 
              onPress={sendImmediateNotification} 
              variant="primary"
              loading={loading}
            />
          </View>
          <View style={dynamicStyles.buttonContainer}>
            <Button 
              title="Schedule Notification (5 sec)" 
              onPress={scheduleDelayedNotification} 
              variant="primary"
              loading={loading}
            />
          </View>
        </Card>

        {/* Test App-Specific Notifications */}
        <Text style={dynamicStyles.sectionTitle}>App-Specific Notifications</Text>
        <Card style={dynamicStyles.card}>
          <View style={dynamicStyles.buttonContainer}>
            <Button 
              title="Test Task Reminder" 
              onPress={testTaskReminder} 
              variant="primary"
              loading={loading}
            />
          </View>
          <View style={dynamicStyles.buttonContainer}>
            <Button 
              title="Test Habit Reminder" 
              onPress={testHabitReminder} 
              variant="primary"
              loading={loading}
            />
          </View>
          <View style={dynamicStyles.buttonContainer}>
            <Button 
              title="Test Daily Summary" 
              onPress={testDailySummary} 
              variant="primary"
              loading={loading}
            />
          </View>
          <View style={dynamicStyles.buttonContainer}>
            <Button 
              title="Test Motivational Message" 
              onPress={testMotivational} 
              variant="primary"
              loading={loading}
            />
          </View>
        </Card>

        {/* Manage Notifications */}
        <Text style={dynamicStyles.sectionTitle}>Manage Notifications</Text>
        <Card style={dynamicStyles.card}>
          <View style={dynamicStyles.buttonContainer}>
            <Button 
              title="Refresh Scheduled Notifications" 
              onPress={refreshScheduledNotifications} 
              variant="outline"
              loading={loading}
            />
          </View>
          <Button 
            title="Cancel All Notifications" 
            onPress={cancelAllScheduledNotifications} 
            variant="danger"
            loading={loading}
          />
        </Card>

        {/* Scheduled Notifications List */}
        <Text style={dynamicStyles.sectionTitle}>
          Scheduled Notifications ({scheduledNotifications.length})
        </Text>
        <Card style={dynamicStyles.card}>
          {scheduledNotifications.length > 0 ? (
            scheduledNotifications.map((notification) => (
              <View key={notification.identifier} style={dynamicStyles.notificationItem}>
                <Text style={dynamicStyles.notificationTitle}>
                  {notification.content.title || 'No Title'}
                </Text>
                <Text style={dynamicStyles.notificationBody}>
                  {notification.content.body || 'No Body'}
                </Text>
                <Text style={dynamicStyles.notificationId}>
                  ID: {notification.identifier}
                </Text>
                <Text style={dynamicStyles.notificationId}>
                  Trigger: {JSON.stringify(notification.trigger)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={dynamicStyles.emptyText}>
              No scheduled notifications
            </Text>
          )}
        </Card>

        {/* Platform-Specific Notes */}
        <Text style={dynamicStyles.sectionTitle}>Notes</Text>
        <Card style={dynamicStyles.card}>
          <Text style={dynamicStyles.statusText}>
            • Notifications in Expo Go have some limitations compared to standalone apps.
          </Text>
          <Text style={dynamicStyles.statusText}>
            • Local notifications should work fine in Expo Go.
          </Text>
          <Text style={dynamicStyles.statusText}>
            • Push notifications require additional setup and an Expo account.
          </Text>
          <Text style={dynamicStyles.statusText}>
            • On iOS, notifications won't appear if the app is in the foreground unless you configure foreground presentation options.
          </Text>
          <Text style={dynamicStyles.statusText}>
            • On Android, you may need to restart the app after granting permissions.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};
