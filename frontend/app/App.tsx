import React from 'react';
import { StatusBar } from 'react-native';
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
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
            <AppNavigator />
          </NavigationContainer>
        </VehicleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
