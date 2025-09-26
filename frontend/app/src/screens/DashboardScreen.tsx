import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/contexts/ThemeContext';
import { useVehicle } from '@/contexts/VehicleContext';
import { createStyles } from '@/theme/styles';
import { RootStackParamList } from '@/navigation/AppNavigator';
import DashboardCard from '@/components/DashboardCard';
import Gauge from '@/components/Gauge';
import BatteryChart from '@/components/BatteryChart';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const { vehicleState, isConnected } = useVehicle();
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const styles = createStyles(theme);
  
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const mockBatteryData = [65, 70, 68, 72, 75, 78, 76];
  const mockBatteryLabels = ['6h', '5h', '4h', '3h', '2h', '1h', 'Now'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={screenStyles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Connection Status */}
        <View style={[screenStyles.statusCard, { 
          backgroundColor: isConnected ? theme.colors.success + '20' : theme.colors.error + '20' 
        }]}>
          <Text style={[styles.body, { 
            color: isConnected ? theme.colors.success : theme.colors.error 
          }]}>
            {isConnected ? '🟢 Vehicle Connected' : '🔴 Vehicle Disconnected'}
          </Text>
        </View>

        {/* Main Gauges */}
        <View style={screenStyles.gaugeContainer}>
          <Gauge
            value={vehicleState.batteryLevel}
            maxValue={100}
            title="Battery Level"
            unit="%"
            color={theme.colors.success}
          />
          <Gauge
            value={vehicleState.speed}
            maxValue={160}
            title="Speed"
            unit=" km/h"
            color={theme.colors.primary}
          />
        </View>

        {/* Quick Stats */}
        <View style={screenStyles.statsGrid}>
          <DashboardCard
            title="Range"
            value={vehicleState.range}
            unit="km"
            subtitle="Estimated remaining"
            style={screenStyles.statCard}
          />
          <DashboardCard
            title="Battery Temp"
            value={Math.round(vehicleState.batteryTemp)}
            unit="°C"
            subtitle={vehicleState.batteryTemp > 35 ? 'High' : 'Normal'}
            style={screenStyles.statCard}
          />
        </View>

        <View style={screenStyles.statsGrid}>
          <DashboardCard
            title="Efficiency"
            value={vehicleState.efficiency.toFixed(1)}
            unit="kWh/100km"
            subtitle="Current trip"
            style={screenStyles.statCard}
          />
          <DashboardCard
            title="Odometer"
            value={(vehicleState.odometer / 1000).toFixed(1)}
            unit="k km"
            subtitle="Total distance"
            style={screenStyles.statCard}
          />
        </View>

        {/* Charging Status */}
        {vehicleState.isCharging && (
          <DashboardCard
            title="Charging"
            value={vehicleState.chargingRate.toFixed(1)}
            unit="kW"
            subtitle="Currently charging"
            style={[screenStyles.chargingCard, { borderColor: theme.colors.success }]}
          />
        )}

        {/* Battery Chart */}
        <BatteryChart
          data={mockBatteryData}
          labels={mockBatteryLabels}
          title="Battery Level History"
        />

        {/* FlexiEVChain API Navigation */}
        <View style={screenStyles.actionsContainer}>
          <Text style={[styles.h3, screenStyles.actionsTitle]}>
            FlexiEVChain APIs
          </Text>
          
          <View style={screenStyles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.card, screenStyles.actionCard]}
              onPress={() => navigation.navigate('VehicleManagement')}
            >
              <Text style={screenStyles.actionIcon}>🚗</Text>
              <Text style={[styles.body, screenStyles.actionText]}>
                Vehicle Management
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.card, screenStyles.actionCard]}
              onPress={() => navigation.navigate('BatteryManagement')}
            >
              <Text style={screenStyles.actionIcon}>🔋</Text>
              <Text style={[styles.body, screenStyles.actionText]}>
                Battery Management
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.card, screenStyles.actionCard]}
              onPress={() => navigation.navigate('ChargingSessions')}
            >
              <Text style={screenStyles.actionIcon}>⚡</Text>
              <Text style={[styles.body, screenStyles.actionText]}>
                Charging Sessions
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.card, screenStyles.actionCard]}
              onPress={() => navigation.navigate('BlockchainExplorer')}
            >
              <Text style={screenStyles.actionIcon}>⛓️</Text>
              <Text style={[styles.body, screenStyles.actionText]}>
                Blockchain Explorer
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.card, screenStyles.actionCard]}
              onPress={() => navigation.navigate('Analytics')}
            >
              <Text style={screenStyles.actionIcon}>📊</Text>
              <Text style={[styles.body, screenStyles.actionText]}>
                Analytics & Insights
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.card, screenStyles.actionCard]}
              onPress={() => navigation.navigate('FleetManagement')}
            >
              <Text style={screenStyles.actionIcon}>🚛</Text>
              <Text style={[styles.body, screenStyles.actionText]}>
                Fleet Management
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.card, screenStyles.actionCard]}
              onPress={() => navigation.navigate('Ledger')}
            >
              <Text style={screenStyles.actionIcon}>�</Text>
              <Text style={[styles.body, screenStyles.actionText]}>
                Blockchain Ledger
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.card, screenStyles.actionCard]}
              onPress={() => navigation.navigate('SystemInfo')}
            >
              <Text style={screenStyles.actionIcon}>🔧</Text>
              <Text style={[styles.body, screenStyles.actionText]}>
                System Information
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.card, screenStyles.actionCard]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={screenStyles.actionIcon}>⚙️</Text>
              <Text style={[styles.body, screenStyles.actionText]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  gaugeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  chargingCard: {
    borderWidth: 2,
    marginBottom: 16,
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  actionsTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default DashboardScreen;
