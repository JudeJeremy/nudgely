import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  habitReminders: boolean;
  dailySummary: boolean;
  dailySummaryTime: string; // HH:MM format
  motivationalMessages: boolean;
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
}

export interface CalendarSettings {
  syncEnabled: boolean;
  calendarId?: string;
  syncTasks: boolean;
  syncHabits: boolean;
  syncedEventIds: string[];
}

interface SettingsState {
  notifications: NotificationSettings;
  theme: ThemeSettings;
  calendar: CalendarSettings;
  firstLaunch: boolean;
  onboardingCompleted: boolean;
}

const initialState: SettingsState = {
  notifications: {
    enabled: true,
    taskReminders: true,
    habitReminders: true,
    dailySummary: true,
    dailySummaryTime: '20:00', // 8:00 PM
    motivationalMessages: true,
  },
  theme: {
    mode: 'system',
  },
  calendar: {
    syncEnabled: false,
    syncTasks: true,
    syncHabits: true,
    syncedEventIds: [],
  },
  firstLaunch: true,
  onboardingCompleted: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    
    updateThemeSettings: (state, action: PayloadAction<Partial<ThemeSettings>>) => {
      state.theme = { ...state.theme, ...action.payload };
    },
    
    updateCalendarSettings: (state, action: PayloadAction<Partial<CalendarSettings>>) => {
      state.calendar = { ...state.calendar, ...action.payload };
    },
    
    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.firstLaunch = action.payload;
    },
    
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.onboardingCompleted = action.payload;
    },
    
    resetSettings: (state) => {
      state.notifications = initialState.notifications;
      state.theme = initialState.theme;
      state.calendar = initialState.calendar;
    },
  },
});

export const {
  updateNotificationSettings,
  updateThemeSettings,
  updateCalendarSettings,
  setFirstLaunch,
  setOnboardingCompleted,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
