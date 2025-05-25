import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  starred: boolean;
  dueDate?: string;
  startTime?: string; // HH:MM format (e.g., "09:00")
  endTime?: string;   // HH:MM format (e.g., "10:00")
  isAllDay?: boolean; // If true, ignore startTime/endTime
  createdAt: string;
}

interface TaskState {
  tasks: Task[];
  categories: string[];
}

const initialState: TaskState = {
  tasks: [],
  categories: ['Personal', 'Work', 'Shopping', 'Health', 'Other'],
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Omit<Task, 'id' | 'createdAt'>>) => {
      const newTask: Task = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        // Default to all-day if no time specified
        isAllDay: action.payload.isAllDay ?? (!action.payload.startTime && !action.payload.endTime),
      };
      state.tasks.push(newTask);
    },
    updateTask: (state, action: PayloadAction<Partial<Task> & { id: string }>) => {
      const index = state.tasks.findIndex((task) => task.id === action.payload.id);
      if (index !== -1) {
        const updatedTask = { ...state.tasks[index], ...action.payload };
        // Auto-update isAllDay based on time fields
        if (action.payload.startTime !== undefined || action.payload.endTime !== undefined) {
          updatedTask.isAllDay = !updatedTask.startTime && !updatedTask.endTime;
        }
        state.tasks[index] = updatedTask;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
    toggleTaskCompletion: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((task) => task.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },
    toggleTaskStar: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((task) => task.id === action.payload);
      if (task) {
        task.starred = !task.starred;
      }
    },
    updateTaskTime: (state, action: PayloadAction<{ 
      id: string; 
      startTime?: string; 
      endTime?: string; 
      isAllDay?: boolean; 
    }>) => {
      const task = state.tasks.find((task) => task.id === action.payload.id);
      if (task) {
        task.startTime = action.payload.startTime;
        task.endTime = action.payload.endTime;
        task.isAllDay = action.payload.isAllDay ?? (!action.payload.startTime && !action.payload.endTime);
      }
    },
    addCategory: (state, action: PayloadAction<string>) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter((category) => category !== action.payload);
    },
  },
});

export const { 
  addTask, 
  updateTask, 
  deleteTask, 
  toggleTaskCompletion,
  toggleTaskStar,
  updateTaskTime,
  addCategory,
  deleteCategory
} = taskSlice.actions;

export default taskSlice.reducer;
