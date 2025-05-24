import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeAppData } from './src/utils/storage';
import { requestNotificationPermissions, setUpNotificationCategories } from './src/utils/notifications';

export default function App() {
  // Initialize app data and request permissions on first launch
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize app data in AsyncStorage
        await initializeAppData();
        
        // Request notification permissions
        await requestNotificationPermissions();
        
        // Set up notification categories
        await setUpNotificationCategories();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initialize();
  }, []);
  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
