import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HabitCompletion {
  date: string; // ISO string
  completed: boolean;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  category: string;
  frequency: {
    type: 'daily' | 'weekly' | 'monthly';
    days?: number[]; // 0-6 for days of week (0 = Sunday)
    times?: {
      morning?: boolean;
      afternoon?: boolean;
      evening?: boolean;
    };
  };
  color: string;
  createdAt: string;
  completions: HabitCompletion[];
  currentStreak: number;
  bestStreak: number;
}

interface HabitState {
  habits: Habit[];
  categories: string[];
}

const initialState: HabitState = {
  habits: [],
  categories: ['Morning', 'Health', 'Fitness', 'Learning', 'Mindfulness', 'Other'],
};

const habitSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    addHabit: (state, action: PayloadAction<Omit<Habit, 'id' | 'createdAt' | 'completions' | 'currentStreak' | 'bestStreak'>>) => {
      const newHabit: Habit = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        completions: [],
        currentStreak: 0,
        bestStreak: 0,
      };
      state.habits.push(newHabit);
    },
    updateHabit: (state, action: PayloadAction<Partial<Habit> & { id: string }>) => {
      const index = state.habits.findIndex((habit) => habit.id === action.payload.id);
      if (index !== -1) {
        state.habits[index] = { ...state.habits[index], ...action.payload };
      }
    },
    deleteHabit: (state, action: PayloadAction<string>) => {
      state.habits = state.habits.filter((habit) => habit.id !== action.payload);
    },
    completeHabit: (state, action: PayloadAction<{ id: string; date: string; completed: boolean }>) => {
      const habit = state.habits.find((h) => h.id === action.payload.id);
      if (habit) {
        // Check if there's already a completion for this date
        const existingIndex = habit.completions.findIndex(
          (c) => c.date.split('T')[0] === action.payload.date.split('T')[0]
        );
        
        if (existingIndex !== -1) {
          // Update existing completion
          habit.completions[existingIndex].completed = action.payload.completed;
        } else {
          // Add new completion
          habit.completions.push({
            date: action.payload.date,
            completed: action.payload.completed,
          });
        }
        
        // Update streaks
        updateStreaks(habit);
      }
    },
    addHabitCategory: (state, action: PayloadAction<string>) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
    },
    deleteHabitCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter((category) => category !== action.payload);
    },
  },
});

// Helper function to update streaks
function updateStreaks(habit: Habit) {
  // Sort completions by date
  const sortedCompletions = [...habit.completions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .filter(c => c.completed);
  
  if (sortedCompletions.length === 0) {
    habit.currentStreak = 0;
    return;
  }
  
  // Calculate current streak
  let currentStreak = 1;
  let maxStreak = 1;
  
  for (let i = 1; i < sortedCompletions.length; i++) {
    const prevDate = new Date(sortedCompletions[i - 1].date);
    const currDate = new Date(sortedCompletions[i].date);
    
    // Check if dates are consecutive based on habit frequency
    const isConsecutive = isConsecutiveDate(prevDate, currDate, habit.frequency);
    
    if (isConsecutive) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  habit.currentStreak = currentStreak;
  habit.bestStreak = Math.max(habit.bestStreak, maxStreak);
}

// Helper function to check if two dates are consecutive based on habit frequency
function isConsecutiveDate(
  date1: Date,
  date2: Date,
  frequency: Habit['frequency']
): boolean {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (frequency.type === 'daily') {
    return diffDays === 1;
  } else if (frequency.type === 'weekly') {
    return diffDays <= 7;
  } else if (frequency.type === 'monthly') {
    // Simplified check for monthly
    return date1.getMonth() !== date2.getMonth() || diffDays <= 31;
  }
  
  return false;
}

export const {
  addHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  addHabitCategory,
  deleteHabitCategory,
} = habitSlice.actions;

export default habitSlice.reducer;
