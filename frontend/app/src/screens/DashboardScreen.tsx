import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { createStyles } from '@/theme/styles';
import { dashboardPalette, shadowStyles } from '@/theme/dashboardPalette';
import { flexiEVAPI, Vehicle, BatteryTelemetry, Alert as ApiAlert } from '@/api/flexiEVApi';

const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const styles = createStyles(theme);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [batteryData, setBatteryData] = useState<BatteryTelemetry | null>(null);
  const [alerts, setAlerts] = useState<ApiAlert[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load vehicles
      const vehicleData = await flexiEVAPI.getVehicles();
      setVehicles(vehicleData);
      
      if (vehicleData.length > 0) {
        const firstVehicle = vehicleData[0];
        setSelectedVehicle(firstVehicle);
        
        // Load battery data for first vehicle
        try {
          const batteryHistory = await flexiEVAPI.getBatteryHistory(firstVehicle._id);
          if (batteryHistory.length > 0) {
            setBatteryData(batteryHistory[0]);
          }
        } catch (error) {
          console.log('No battery data available');
        }
        
        // Load alerts for first vehicle
        try {
          const alertData = await flexiEVAPI.getVehicleAlerts(firstVehicle._id);
          setAlerts(alertData);
        } catch (error) {
          console.log('No alerts available');
        }
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, []);

  const vehicleImage = 'https://images.pexels.com/photos/4517067/pexels-photo-4517067.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260';

  const detailRows = [
    { label: 'Manufacturer', value: selectedVehicle?.brand || 'N/A' },
    { label: 'Model', value: selectedVehicle?.vehicleModel || 'N/A' },
    { label: 'VIN', value: selectedVehicle?.vin || 'N/A' },
    { label: 'Status', value: selectedVehicle?.status === 'active' ? 'Active' : 'Inactive' },
    { label: 'State of Charge', value: batteryData ? `${batteryData.batteryLevel}%` : 'N/A' },
    { label: 'State of Health', value: batteryData ? `${batteryData.health}%` : 'N/A' },
    { label: 'Cycles Completed', value: batteryData ? `${batteryData.cycleCount}` : 'N/A' },
    { label: 'Temperature', value: batteryData ? `${batteryData.temperature}°C` : 'N/A' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[screenStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[screenStyles.detailValue, { marginTop: 16 }]}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedVehicle) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[screenStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={screenStyles.detailValue}>No vehicles found</Text>
          <Text style={screenStyles.detailLabel}>Please register a vehicle first</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={screenStyles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View
          style={screenStyles.heroCard}
        >
          <View style={screenStyles.heroHeader}>
            <View>
              <Text style={screenStyles.vehicleTitle}>{`${selectedVehicle.brand} ${selectedVehicle.vehicleModel}`}</Text>
              <View style={screenStyles.vehicleIdPill}>
                <Text style={screenStyles.vehicleIdText}>{selectedVehicle.vin}</Text>
              </View>
            </View>
            <View style={[screenStyles.connectionPill, { backgroundColor: selectedVehicle.status === 'active' ? '#22c55e33' : '#ef444433' }]}>
              <Text style={[screenStyles.connectionText, { color: selectedVehicle.status === 'active' ? '#22c55e' : '#ef4444' }]}>
                {selectedVehicle.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          <Image source={{ uri: vehicleImage }} style={screenStyles.vehicleImage} />

          <View style={screenStyles.statusRow}>
            <View style={screenStyles.infoCard}>
              <Text style={screenStyles.cardLabel}>🔋 Battery</Text>
              <Text style={screenStyles.cardSubtext}>Current status</Text>
              <Text style={screenStyles.cardValue}>{batteryData ? `${batteryData.batteryLevel}%` : 'N/A'}</Text>
              <Text style={screenStyles.cardFooter}>State of Charge</Text>
            </View>
            <View style={screenStyles.infoCard}>
              <Text style={screenStyles.cardLabel}>🌡️ Temperature</Text>
              <Text style={screenStyles.cardSubtext}>Battery temp</Text>
              <Text style={screenStyles.cardValue}>{batteryData ? `${batteryData.temperature}°C` : 'N/A'}</Text>
              <Text style={screenStyles.cardFooter}>Current reading</Text>
            </View>
          </View>
        </View>

        <View style={screenStyles.detailsContainer}>
          <View
            style={screenStyles.detailsHeader}
          >
            <Text style={screenStyles.detailsHeaderText}>Car Details</Text>
          </View>

          <View style={screenStyles.detailsCard}>
            {detailRows.map((row, index) => (
              <View key={row.label} style={screenStyles.detailRow}>
                <Text style={screenStyles.detailLabel}>{row.label}</Text>
                <Text style={screenStyles.detailValue}>{row.value}</Text>
                {index !== detailRows.length - 1 && <View style={screenStyles.detailDivider} />}
              </View>
            ))}
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
    backgroundColor: dashboardPalette.background,
  },
  heroCard: {
    backgroundColor: dashboardPalette.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
    ...shadowStyles,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleTitle: {
    color: dashboardPalette.textPrimary,
    fontSize: 26,
    fontWeight: '700',
  },
  vehicleIdPill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: dashboardPalette.accentPrimary + '20',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  vehicleIdText: {
    color: dashboardPalette.accentPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  connectionPill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  connectionText: {
    fontWeight: '600',
    fontSize: 12,
  },
  vehicleImage: {
    width: '100%',
    height: 180,
    marginVertical: 20,
    borderRadius: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: dashboardPalette.surfaceMuted,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: dashboardPalette.border,
  },
  cardLabel: {
    color: dashboardPalette.accentPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  cardSubtext: {
    color: dashboardPalette.textSecondary,
    marginTop: 6,
    marginBottom: 12,
  },
  cardValue: {
    color: dashboardPalette.textPrimary,
    fontSize: 36,
    fontWeight: '700',
  },
  cardFooter: {
    color: dashboardPalette.textSecondary,
    marginTop: 4,
  },
  detailsContainer: {
    marginBottom: 32,
  },
  detailsHeader: {
    backgroundColor: dashboardPalette.surfaceAlt,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: dashboardPalette.border,
  },
  detailsHeaderText: {
    color: dashboardPalette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: dashboardPalette.surface,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: dashboardPalette.border,
  },
  detailRow: {
    paddingVertical: 12,
  },
  detailLabel: {
    color: dashboardPalette.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    color: dashboardPalette.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: dashboardPalette.borderFaint,
    marginTop: 12,
  },
});

export default DashboardScreen;
