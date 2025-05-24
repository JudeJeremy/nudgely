import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TimerSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  taskId?: string; // optional associated task
  completed: boolean;
  notes?: string;
}

export interface TimerSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

interface TimerState {
  isRunning: boolean;
  currentSession: TimerSession | null;
  sessionHistory: TimerSession[];
  settings: TimerSettings;
  currentSessionType: 'focus' | 'shortBreak' | 'longBreak';
  completedFocusSessions: number;
}

const initialState: TimerState = {
  isRunning: false,
  currentSession: null,
  sessionHistory: [],
  settings: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
  },
  currentSessionType: 'focus',
  completedFocusSessions: 0,
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    startTimer: (state, action: PayloadAction<{ taskId?: string }>) => {
      const now = new Date().toISOString();
      let duration = 0;
      
      if (state.currentSessionType === 'focus') {
        duration = state.settings.focusDuration;
      } else if (state.currentSessionType === 'shortBreak') {
        duration = state.settings.shortBreakDuration;
      } else {
        duration = state.settings.longBreakDuration;
      }
      
      state.currentSession = {
        id: Date.now().toString(),
        startTime: now,
        duration,
        taskId: action.payload.taskId,
        completed: false,
      };
      
      state.isRunning = true;
    },
    
    pauseTimer: (state) => {
      state.isRunning = false;
    },
    
    resumeTimer: (state) => {
      state.isRunning = true;
    },
    
    stopTimer: (state) => {
      state.isRunning = false;
      state.currentSession = null;
    },
    
    completeSession: (state, action: PayloadAction<{ notes?: string }>) => {
      if (state.currentSession) {
        const completedSession: TimerSession = {
          ...state.currentSession,
          endTime: new Date().toISOString(),
          completed: true,
          notes: action.payload.notes,
        };
        
        state.sessionHistory.push(completedSession);
        state.currentSession = null;
        state.isRunning = false;
        
        // Update session counters and type
        if (state.currentSessionType === 'focus') {
          state.completedFocusSessions += 1;
          
          // Determine next session type
          if (state.completedFocusSessions % state.settings.sessionsBeforeLongBreak === 0) {
            state.currentSessionType = 'longBreak';
          } else {
            state.currentSessionType = 'shortBreak';
          }
        } else {
          // After any break, go back to focus mode
          state.currentSessionType = 'focus';
        }
      }
    },
    
    updateTimerSettings: (state, action: PayloadAction<Partial<TimerSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    resetSessionCounter: (state) => {
      state.completedFocusSessions = 0;
      state.currentSessionType = 'focus';
    },
    
    addFiveMinutes: (state) => {
      if (state.currentSession) {
        state.currentSession.duration += 5;
      }
    },
  },
});

export const {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  completeSession,
  updateTimerSettings,
  resetSessionCounter,
  addFiveMinutes,
} = timerSlice.actions;

export default timerSlice.reducer;
