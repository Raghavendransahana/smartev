import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useVehicle } from '@/contexts/VehicleContext';
import { createStyles } from '@/theme/styles';
import { dashboardPalette, shadowStyles } from '@/theme/dashboardPalette';

const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const { vehicleState, isConnected } = useVehicle();
  const styles = createStyles(theme);
  
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const vehicleImage = 'https://images.pexels.com/photos/4517067/pexels-photo-4517067.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260';

  const detailRows = [
    { label: 'Manufacturer', value: 'Tata Motors' },
    { label: 'City and address', value: 'Coimbatore, Tamil Nadu' },
    { label: 'Battery owner status', value: vehicleState.isCharging ? 'Charging' : 'Idle' },
    { label: 'State of Charge', value: `${vehicleState.batteryLevel}%` },
    { label: 'State of Health', value: '96%' },
    { label: 'Cycles Completed', value: '142' },
    { label: 'Warranty Status', value: 'Active - 1y remaining' },
  ];

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
              <Text style={screenStyles.vehicleTitle}>Tata Punch EV</Text>
              <View style={screenStyles.vehicleIdPill}>
                <Text style={screenStyles.vehicleIdText}>345678123ALPHA</Text>
              </View>
            </View>
            <View style={[screenStyles.connectionPill, { backgroundColor: isConnected ? '#22c55e33' : '#ef444433' }]}>
              <Text style={[screenStyles.connectionText, { color: isConnected ? '#22c55e' : '#ef4444' }]}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>

          <Image source={{ uri: vehicleImage }} style={screenStyles.vehicleImage} />

          <View style={screenStyles.statusRow}>
            <View style={screenStyles.infoCard}>
              <Text style={screenStyles.cardLabel}>🔋 Battery</Text>
              <Text style={screenStyles.cardSubtext}>Battery is {vehicleState.isCharging ? 'charging' : 'idle'}</Text>
              <Text style={screenStyles.cardValue}>{vehicleState.batteryLevel}%</Text>
              <Text style={screenStyles.cardFooter}>Charging complete</Text>
            </View>
            <View style={screenStyles.infoCard}>
              <Text style={screenStyles.cardLabel}>🚗 Driven</Text>
              <Text style={screenStyles.cardSubtext}>This week</Text>
              <Text style={screenStyles.cardValue}>{Math.round(vehicleState.odometer ?? 4330)}</Text>
              <Text style={screenStyles.cardFooter}>Kilometers completed</Text>
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
