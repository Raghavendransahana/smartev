import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import DashboardScreen from '../screens/DashboardScreen';
import VehicleManagementScreen from '../screens/VehicleManagementScreen';
import BatteryManagementScreen from '../screens/BatteryManagementScreen';
import ChargingSessionsScreen from '../screens/ChargingSessionsScreen';
import MoreScreen from '@/screens/MoreScreen';

export type BottomTabParamList = {
  Dashboard: undefined;
  Vehicles: undefined;
  Battery: undefined;
  Charging: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Vehicles':
              iconName = focused ? 'car' : 'car-outline';
              break;
            case 'Battery':
              iconName = focused ? 'battery-charging' : 'battery-charging-outline';
              break;
            case 'Charging':
              iconName = focused ? 'flash' : 'flash-outline';
              break;
            case 'More':
              iconName = focused ? 'menu' : 'menu-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border || '#e0e0e0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerTitle: 'FlexiEV Dashboard',
        }}
      />
      <Tab.Screen 
        name="Vehicles" 
        component={VehicleManagementScreen}
        options={{
          title: 'Vehicles',
          headerTitle: 'Vehicle Management',
        }}
      />
      <Tab.Screen 
        name="Battery" 
        component={BatteryManagementScreen}
        options={{
          title: 'Battery',
          headerTitle: 'Battery Management',
        }}
      />
      <Tab.Screen 
        name="Charging" 
        component={ChargingSessionsScreen}
        options={{
          title: 'Charging',
          headerTitle: 'Charging Sessions',
        }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreScreen}
        options={{
          title: 'More',
          headerTitle: 'More Features',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
