import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import BottomTabNavigator from './BottomTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LedgerScreen from '@/screens/LedgerScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import BlockchainExplorerScreen from '@/screens/BlockchainExplorerScreen';
import FleetManagementScreen from '@/screens/FleetManagementScreen';
import SystemInfoScreen from '@/screens/SystemInfoScreen';
import IntegrationStatusScreen from '@/screens/IntegrationStatusScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
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
  IntegrationStatus: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Debug logging for authentication state
  console.log('AppNavigator - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      key={isAuthenticated ? "authenticated" : "unauthenticated"}
      initialRouteName={isAuthenticated ? "Main" : "Login"}
      screenOptions={{
        headerShown: false, // Hide headers for tab screens, show for modal screens
      }}
    >
      {!isAuthenticated ? (
        <>
          {/* Authentication screens */}
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
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
        name="IntegrationStatus" 
        component={IntegrationStatusScreen}
        options={{ 
          headerShown: true,
          title: 'Integration Status',
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
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
