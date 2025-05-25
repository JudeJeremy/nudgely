import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
  type: 'task' | 'habit' | 'both';
  isDefault: boolean;
  createdAt: string;
  usageCount: number;
}

interface CategoryState {
  categories: Category[];
}

// Default categories with enhanced metadata
const defaultCategories: Category[] = [
  // Task categories
  {
    id: 'task-personal',
    name: 'Personal',
    color: '#4e73df',
    description: 'Personal tasks and activities',
    type: 'task',
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'task-work',
    name: 'Work',
    color: '#1cc88a',
    description: 'Work-related tasks and projects',
    type: 'task',
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'task-shopping',
    name: 'Shopping',
    color: '#6f42c1',
    description: 'Shopping lists and errands',
    type: 'task',
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'task-health',
    name: 'Health',
    color: '#e74a3b',
    description: 'Health and medical tasks',
    type: 'task',
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'task-other',
    name: 'Other',
    color: '#858796',
    description: 'Miscellaneous tasks',
    type: 'task',
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  // Habit categories
  {
    id: 'habit-morning',
    name: 'Morning',
    color: '#f6c23e',
    description: 'Morning routines and habits',
    type: 'habit',
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'habit-health',
    name: 'Health',
    color: '#e74a3b',
    description: 'Health and wellness habits',
    type: 'habit',
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'habit-fitness',
    name: 'Fitness',
    color: '#1cc88a',
    description: 'Exercise and fitness habits',
    type: 'habit',
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'habit-learning',
    name: 'Learning',
    color: '#4e73df',
    description: 'Learning and education habits',
    type: 'habit',
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'habit-mindfulness',
    name: 'Mindfulness',
    color: '#6f42c1',
    description: 'Meditation and mindfulness practices',
    type: 'habit',
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'habit-other',
    name: 'Other',
    color: '#858796',
    description: 'Other habits',
    type: 'habit',
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
];

const initialState: CategoryState = {
  categories: defaultCategories,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory: (state, action: PayloadAction<Omit<Category, 'id' | 'createdAt' | 'usageCount'>>) => {
      const newCategory: Category = {
        ...action.payload,
        id: `custom-${Date.now()}`,
        createdAt: new Date().toISOString(),
        usageCount: 0,
      };
      state.categories.push(newCategory);
    },
    updateCategory: (state, action: PayloadAction<Partial<Category> & { id: string }>) => {
      const index = state.categories.findIndex((category) => category.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = { ...state.categories[index], ...action.payload };
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      const category = state.categories.find((cat) => cat.id === action.payload);
      // Prevent deletion of default categories
      if (category && !category.isDefault) {
        state.categories = state.categories.filter((category) => category.id !== action.payload);
      }
    },
    incrementCategoryUsage: (state, action: PayloadAction<string>) => {
      const category = state.categories.find((cat) => cat.id === action.payload);
      if (category) {
        category.usageCount += 1;
      }
    },
    decrementCategoryUsage: (state, action: PayloadAction<string>) => {
      const category = state.categories.find((cat) => cat.id === action.payload);
      if (category && category.usageCount > 0) {
        category.usageCount -= 1;
      }
    },
    reorderCategories: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedCategory] = state.categories.splice(fromIndex, 1);
      state.categories.splice(toIndex, 0, movedCategory);
    },
    resetCategories: (state) => {
      state.categories = defaultCategories;
    },
  },
});

export const {
  addCategory,
  updateCategory,
  deleteCategory,
  incrementCategoryUsage,
  decrementCategoryUsage,
  reorderCategories,
  resetCategories,
} = categorySlice.actions;

export default categorySlice.reducer;
