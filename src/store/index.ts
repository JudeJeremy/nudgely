import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';

import taskReducer from './slices/taskSlice';
import habitReducer from './slices/habitSlice';
import settingsReducer from './slices/settingsSlice';

// Configure persistence
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['tasks', 'habits', 'settings'], // We don't persist timer state
};

const rootReducer = combineReducers({
  tasks: taskReducer,
  habits: habitReducer,
  settings: settingsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
