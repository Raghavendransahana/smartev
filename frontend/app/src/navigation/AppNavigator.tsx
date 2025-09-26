import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import LedgerScreen from '@/screens/LedgerScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import BlockchainExplorerScreen from '@/screens/BlockchainExplorerScreen';
import AnalyticsScreen from '@/screens/AnalyticsScreen';
import FleetManagementScreen from '@/screens/FleetManagementScreen';
import SystemInfoScreen from '@/screens/SystemInfoScreen';

export type RootStackParamList = {
  Main: undefined;
  Dashboard: undefined;
  Ledger: undefined;
  Settings: undefined;
  VehicleManagement: undefined;
  BatteryManagement: undefined;
  ChargingSessions: undefined;
  BlockchainExplorer: undefined;
  Analytics: undefined;
  FleetManagement: undefined;
  SystemInfo: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false, // Hide headers for tab screens, show for modal screens
      }}
    >
      {/* Main app with bottom tabs */}
      <Stack.Screen 
        name="Main" 
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Modal/Detail screens that open on top of tabs */}
      <Stack.Screen 
        name="BlockchainExplorer" 
        component={BlockchainExplorerScreen}
        options={{ 
          headerShown: true,
          title: 'Blockchain Explorer',
          headerStyle: { backgroundColor: '#1976D2' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{ 
          headerShown: true,
          title: 'Analytics & Insights',
          headerStyle: { backgroundColor: '#1976D2' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="FleetManagement" 
        component={FleetManagementScreen}
        options={{ 
          headerShown: true,
          title: 'Fleet Management',
          headerStyle: { backgroundColor: '#1976D2' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="SystemInfo" 
        component={SystemInfoScreen}
        options={{ 
          headerShown: true,
          title: 'System Information',
          headerStyle: { backgroundColor: '#1976D2' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="Ledger" 
        component={LedgerScreen}
        options={{ 
          headerShown: true,
          title: 'Blockchain Ledger',
          headerStyle: { backgroundColor: '#1976D2' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          headerShown: true,
          title: 'Settings',
          headerStyle: { backgroundColor: '#1976D2' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
