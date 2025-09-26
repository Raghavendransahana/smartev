import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { VehicleProvider } from './src/contexts/VehicleContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <VehicleProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </VehicleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
