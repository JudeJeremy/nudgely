import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../store/slices/taskSlice';
import { Habit } from '../store/slices/habitSlice';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 * @returns Whether permissions were granted
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Only ask if permissions have not already been determined
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // Return true if permission was granted
    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Notification permissions not available in this environment:', error);
    return false;
  }
};

/**
 * Schedule a task reminder notification
 * @param task Task to remind about
 * @param minutesBefore Minutes before due date to send notification
 * @returns Notification ID
 */
export const scheduleTaskReminder = async (
  task: Task,
  minutesBefore: number = 30
): Promise<string> => {
  if (!task.dueDate) {
    throw new Error('Task has no due date');
  }
  
  const dueDate = new Date(task.dueDate);
  const notificationDate = new Date(dueDate.getTime() - minutesBefore * 60000);
  
  // Don't schedule if the notification time is in the past
  if (notificationDate.getTime() <= Date.now()) {
    throw new Error('Notification time is in the past');
  }
  
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task Reminder',
      body: `"${task.title}" is due in ${minutesBefore} minutes`,
      data: { taskId: task.id },
    },
    trigger: notificationDate as any,
  });
};

/**
 * Schedule a habit reminder notification
 * @param habit Habit to remind about
 * @param time Time of day to send notification (HH:MM format)
 * @returns Notification ID
 */
export const scheduleHabitReminder = async (
  habit: Habit,
  time: string = '09:00'
): Promise<string> => {
  const [hours, minutes] = time.split(':').map(Number);
  
  // Create a trigger for the specified time
  const trigger: any = {
    hour: hours,
    minute: minutes,
    repeats: true,
  };
  
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Habit Reminder',
      body: `Don't forget to "${habit.title}" today`,
      data: { habitId: habit.id },
    },
    trigger,
  });
};

/**
 * Schedule a daily summary notification
 * @param time Time of day to send notification (HH:MM format)
 * @returns Notification ID
 */
export const scheduleDailySummaryNotification = async (
  time: string = '20:00'
): Promise<string> => {
  const [hours, minutes] = time.split(':').map(Number);
  
  // Create a trigger for the specified time
  const trigger: any = {
    hour: hours,
    minute: minutes,
    repeats: true,
  };
  
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Summary',
      body: 'Check your progress and plan for tomorrow',
      data: { type: 'dailySummary' },
    },
    trigger,
  });
};

/**
 * Schedule a motivational notification
 * @returns Notification ID
 */
export const scheduleMotivationalNotification = async (): Promise<string> => {
  const motivationalMessages = [
    "You're doing great! Keep up the good work!",
    "Small steps lead to big changes. Keep going!",
    "Consistency is key to building good habits.",
    "Every task you complete brings you closer to your goals.",
    "Take a moment to celebrate your progress today!",
    "Remember why you started. You've got this!",
    "Focus on progress, not perfection.",
    "Your future self will thank you for the habits you're building today.",
  ];
  
  const randomMessage =
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  
  // Schedule for a random time tomorrow between 9 AM and 6 PM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0);
  
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nudgely',
      body: randomMessage,
      data: { type: 'motivational' },
    },
    trigger: tomorrow as any,
  });
};

/**
 * Cancel a scheduled notification
 * @param notificationId ID of the notification to cancel
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Get all scheduled notifications
 * @returns Array of scheduled notifications
 */
export const getAllScheduledNotifications = async (): Promise<
  Notifications.NotificationRequest[]
> => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

/**
 * Set up notification categories and actions
 * This is used for interactive notifications
 */
export const setUpNotificationCategories = async (): Promise<void> => {
  if (Platform.OS === 'ios') {
    await Notifications.setNotificationCategoryAsync('task', [
      {
        identifier: 'complete',
        buttonTitle: 'Mark as Complete',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
      {
        identifier: 'snooze',
        buttonTitle: 'Snooze',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
    ]);
    
    await Notifications.setNotificationCategoryAsync('habit', [
      {
        identifier: 'complete',
        buttonTitle: 'Mark as Complete',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
      {
        identifier: 'remind-later',
        buttonTitle: 'Remind Later',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
    ]);
  }
};
