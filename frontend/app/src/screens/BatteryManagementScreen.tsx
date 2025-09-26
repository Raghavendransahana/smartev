import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { flexiEVAPI, BatteryTelemetry, Vehicle } from '../api/flexiEVApi';

const { width } = Dimensions.get('window');

interface VehicleBatteryData {
  vehicle: Vehicle;
  latestBatteryData: BatteryTelemetry | null;
  batteryHistory: BatteryTelemetry[];
}

const BatteryManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [vehicleBatteryData, setVehicleBatteryData] = useState<VehicleBatteryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllVehicleBatteryData();
  }, []);

  const loadAllVehicleBatteryData = async () => {
    try {
      setLoading(true);
      console.log('Loading vehicles and battery data for user...');
      
      // Get user's vehicles (backend already filters by owner)
      const vehicles = await flexiEVAPI.getVehicles();
      console.log('Loaded vehicles:', vehicles.length);

      // Load battery data for each vehicle
      const vehicleBatteryPromises = vehicles.map(async (vehicle) => {
        try {
          const [latestBatteryData, batteryHistory] = await Promise.all([
            flexiEVAPI.getLatestBatteryData(vehicle._id).catch(() => null),
            flexiEVAPI.getBatteryHistory(vehicle._id).catch(() => []),
          ]);
          
          return {
            vehicle,
            latestBatteryData,
            batteryHistory,
          } as VehicleBatteryData;
        } catch (error) {
          console.error(`Error loading battery data for vehicle ${vehicle._id}:`, error);
          return {
            vehicle,
            latestBatteryData: null,
            batteryHistory: [],
          } as VehicleBatteryData;
        }
      });

      const vehicleBatteryResults = await Promise.all(vehicleBatteryPromises);
      setVehicleBatteryData(vehicleBatteryResults);
      console.log('Loaded battery data for', vehicleBatteryResults.length, 'vehicles');
    } catch (error) {
      Alert.alert('Error', 'Failed to load battery data');
      console.error('Error loading vehicle battery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllVehicleBatteryData();
    setRefreshing(false);
  };

  const getChartDataForVehicle = (batteryHistory: BatteryTelemetry[]) => {
    const recentData = batteryHistory.slice(-10);
    if (recentData.length === 0) return null;
    
    return {
      labels: recentData.map((_, index) => `${index + 1}`),
      datasets: [
        {
          data: recentData.map(d => d.batteryLevel),
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: recentData.map(d => d.health),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['Battery Level (%)', 'Health (%)'],
    };
  };



  const getSoCColor = (soc: number) => {
    if (soc > 80) return '#22c55e';
    if (soc > 20) return '#f59e0b';
    return '#ef4444';
  };

  const getSoHColor = (soh: number) => {
    if (soh > 80) return '#22c55e';
    if (soh > 60) return '#f59e0b';
    return '#ef4444';
  };

  const VehicleBatteryCard = ({ data }: { data: VehicleBatteryData }) => {
    const { vehicle, latestBatteryData, batteryHistory } = data;
    const chartData = getChartDataForVehicle(batteryHistory);

    return (
      <View style={[styles.vehicleCard, { backgroundColor: theme.colors.surface }]}>
        {/* Vehicle Header */}
        <View style={styles.vehicleHeader}>
          <Text style={[styles.vehicleTitle, { color: theme.colors.text }]}>
            {vehicle.brand} {vehicle.vehicleModel}
          </Text>
          <Text style={[styles.vehicleVin, { color: theme.colors.textSecondary }]}>
            VIN: {vehicle.vin}
          </Text>
        </View>

        {/* Latest Battery Data */}
        {latestBatteryData ? (
          <View style={styles.batteryDataContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Current Battery Status
            </Text>
            <View style={styles.batteryGrid}>
              <View style={styles.batteryItem}>
                <Text style={[styles.batteryLabel, { color: theme.colors.textSecondary }]}>
                  State of Charge
                </Text>
                <Text style={[styles.batteryValue, { color: getSoCColor(latestBatteryData.batteryLevel) }]}>
                  {latestBatteryData.batteryLevel}%
                </Text>
              </View>
              <View style={styles.batteryItem}>
                <Text style={[styles.batteryLabel, { color: theme.colors.textSecondary }]}>
                  State of Health
                </Text>
                <Text style={[styles.batteryValue, { color: getSoHColor(latestBatteryData.health) }]}>
                  {latestBatteryData.health}%
                </Text>
              </View>
              <View style={styles.batteryItem}>
                <Text style={[styles.batteryLabel, { color: theme.colors.textSecondary }]}>
                  Temperature
                </Text>
                <Text style={[styles.batteryValue, { color: theme.colors.text }]}>
                  {latestBatteryData.temperature}°C
                </Text>
              </View>
              <View style={styles.batteryItem}>
                <Text style={[styles.batteryLabel, { color: theme.colors.textSecondary }]}>
                  Cycle Count
                </Text>
                <Text style={[styles.batteryValue, { color: theme.colors.text }]}>
                  {latestBatteryData.cycleCount}
                </Text>
              </View>
            </View>
            
            {/* Battery Trends Chart */}
            {chartData && (
              <View style={styles.chartSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Battery Trends (Last 10 Records)
                </Text>
                <LineChart
                  data={chartData}
                  width={width - 64}
                  height={200}
                  chartConfig={{
                    backgroundColor: theme.colors.surface,
                    backgroundGradientFrom: theme.colors.surface,
                    backgroundGradientTo: theme.colors.surface,
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
                    labelColor: (opacity = 1) => theme.colors.textSecondary,
                    style: { borderRadius: 16 },
                  }}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 16 }}
                />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noBatteryData}>
            <Text style={[styles.noBatteryText, { color: theme.colors.textSecondary }]}>
              No battery data available for this vehicle
            </Text>
          </View>
        )}
      </View>
    );
  };



  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Battery Management
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading battery data...
          </Text>
        </View>
      ) : vehicleBatteryData.length > 0 ? (
        <FlatList
          data={vehicleBatteryData}
          keyExtractor={(item) => item.vehicle._id}
          renderItem={({ item }) => <VehicleBatteryCard data={item} />}
          style={styles.telemetryList}
          refreshing={refreshing}
          onRefresh={loadAllVehicleBatteryData}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.centerContent}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No vehicles or battery data found
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  telemetryList: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  // New vehicle card styles
  vehicleCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  vehicleHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 12,
    marginBottom: 16,
  },
  vehicleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vehicleVin: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  batteryDataContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  batteryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  batteryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  batteryLabel: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  batteryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartSection: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noBatteryData: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBatteryText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default BatteryManagementScreen;
