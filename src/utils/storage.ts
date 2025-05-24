import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  TASKS: 'nudgely_tasks',
  HABITS: 'nudgely_habits',
  TIMER_SESSIONS: 'nudgely_timer_sessions',
  SETTINGS: 'nudgely_settings',
  FIRST_LAUNCH: 'nudgely_first_launch',
  ONBOARDING_COMPLETED: 'nudgely_onboarding_completed',
};

/**
 * Save data to AsyncStorage
 * @param key Storage key
 * @param value Data to store
 */
export const saveData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error saving data to AsyncStorage:', error);
    throw error;
  }
};

/**
 * Load data from AsyncStorage
 * @param key Storage key
 * @returns Stored data or null if not found
 */
export const loadData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error loading data from AsyncStorage:', error);
    throw error;
  }
};

/**
 * Remove data from AsyncStorage
 * @param key Storage key
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data from AsyncStorage:', error);
    throw error;
  }
};

/**
 * Clear all app data from AsyncStorage
 */
export const clearAllData = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error clearing all data from AsyncStorage:', error);
    throw error;
  }
};

/**
 * Initialize app data in AsyncStorage
 * This is called on first launch to set up default data
 */
export const initializeAppData = async (): Promise<void> => {
  try {
    // Check if this is the first launch
    const firstLaunch = await loadData<boolean>(STORAGE_KEYS.FIRST_LAUNCH);
    
    if (firstLaunch === null) {
      // This is the first launch, set up default data
      await saveData(STORAGE_KEYS.FIRST_LAUNCH, false);
      await saveData(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
      
      // Initialize with empty arrays for tasks and habits
      await saveData(STORAGE_KEYS.TASKS, { tasks: [], categories: ['Personal', 'Work', 'Shopping', 'Health', 'Other'] });
      await saveData(STORAGE_KEYS.HABITS, { habits: [], categories: ['Morning', 'Health', 'Fitness', 'Learning', 'Mindfulness', 'Other'] });
      await saveData(STORAGE_KEYS.TIMER_SESSIONS, { sessions: [] });
      
      // Default settings
      await saveData(STORAGE_KEYS.SETTINGS, {
        notifications: {
          enabled: true,
          taskReminders: true,
          habitReminders: true,
          focusSessionReminders: true,
          dailySummary: true,
          dailySummaryTime: '20:00', // 8:00 PM
          motivationalMessages: true,
        },
        theme: {
          mode: 'system',
          primaryColor: '#0a7ea4', // Default blue color
        },
        calendar: {
          syncEnabled: false,
          syncTasks: true,
          syncHabits: true,
        },
      });
    }
  } catch (error) {
    console.error('Error initializing app data:', error);
    throw error;
  }
};
