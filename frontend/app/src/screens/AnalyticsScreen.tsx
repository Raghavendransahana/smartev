import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import ScreenContainer from '@/components/layout/ScreenContainer';
import GlassCard from '@/components/layout/GlassCard';
import { dashboardPalette } from '@/theme/dashboardPalette';
import { useTheme } from '@/contexts/ThemeContext';
import { Analytics, Vehicle, flexiEVAPI } from '@/api/flexiEVApi';

const { width } = Dimensions.get('window');
const chartWidth = Math.max(Math.min(width - 64, 520), 280);

const gradientPresets = {
  base: ['rgba(255,255,255,0.95)', 'rgba(249,250,251,0.88)'] as [string, string],
  highlight: ['rgba(30,64,175,0.15)', 'rgba(30,64,175,0.08)'] as [string, string],
  accent: ['rgba(5,150,105,0.15)', 'rgba(5,150,105,0.08)'] as [string, string],
  cool: ['rgba(30,64,175,0.12)', 'rgba(30,64,175,0.06)'] as [string, string],
};

const pieChartConfig = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: dashboardPalette.surface,
  backgroundGradientTo: dashboardPalette.surface,
  color: (opacity = 1) => `rgba(30, 64, 175, ${opacity})`,
  labelColor: () => dashboardPalette.textPrimary,
};

const lineChartConfig = {
  backgroundGradientFrom: dashboardPalette.surface,
  backgroundGradientTo: dashboardPalette.surfaceMuted,
  backgroundColor: 'transparent',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(30, 64, 175, ${opacity})`,
  labelColor: () => dashboardPalette.textPrimary,
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: dashboardPalette.accentPrimary,
  },
  propsForBackgroundLines: {
    stroke: dashboardPalette.border,
  },
  fillShadowGradient: dashboardPalette.accentPrimary,
  fillShadowGradientOpacity: 0.15,
};

const badgeSurfaceColor = dashboardPalette.accentPrimary + '20';

type AnalyticsTabId = 'battery' | 'charging';

interface AnalyticsTab {
  id: AnalyticsTabId;
  label: string;
  icon: string;
}

const tabs: AnalyticsTab[] = [
  { id: 'battery', label: 'Battery Analytics', icon: '🔋' },
  { id: 'charging', label: 'Charging Analytics', icon: '⚡' },
];

const getBatteryHealthColor = (value: number) => {
  if (value >= 80) return '#34d399';
  if (value >= 60) return '#38bdf8';
  if (value >= 40) return '#facc15';
  return '#f87171';
};

const getWarrantyStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return '#34d399';
    case 'expiring soon':
      return '#facc15';
    case 'expired':
      return '#f87171';
    default:
      return dashboardPalette.textSecondary;
  }
};

const formatDate = (date?: string) => {
  if (!date) {
    return null;
  }

  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    return date;
  }
};

const AnalyticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [batteryAnalytics, setBatteryAnalytics] = useState<Analytics | null>(null);
  const [chargingAnalytics, setChargingAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AnalyticsTabId>('battery');

  const fetchVehicles = useCallback(async () => {
    try {
      const data = await flexiEVAPI.getVehicles();
      setVehicles(data);
      if (data.length > 0) {
        setSelectedVehicle((previous) => previous ?? data[0].id);
      }
    } catch (error) {
      console.error('Failed to load vehicles', error);
      Alert.alert('Unable to load vehicles', 'Please try again later.');
    }
  }, []);

  const fetchAnalytics = useCallback(async (vehicleId: string) => {
    setLoading(true);
    try {
      const [battery, charging] = await Promise.all([
        flexiEVAPI.getBatteryAnalytics(vehicleId),
        flexiEVAPI.getChargingAnalytics(vehicleId),
      ]);

      setBatteryAnalytics(battery);
      setChargingAnalytics(charging);
    } catch (error) {
      console.error('Failed to load analytics', error);
      Alert.alert('Analytics unavailable', 'Unable to load analytics for the selected vehicle.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (selectedVehicle) {
      fetchAnalytics(selectedVehicle);
    }
  }, [selectedVehicle, fetchAnalytics]);

  const handleRefresh = useCallback(() => {
    if (selectedVehicle) {
      fetchAnalytics(selectedVehicle);
    } else {
      fetchVehicles();
    }
  }, [selectedVehicle, fetchAnalytics, fetchVehicles]);

  const BatteryAnalyticsTab = () => {
    if (!batteryAnalytics) {
      return null;
    }

    const distributionData = [
      {
        name: 'Healthy',
        population: batteryAnalytics.remainingLife,
        color: '#34d399',
        legendFontColor: theme.colors.text,
        legendFontSize: 13,
      },
      {
        name: 'Degraded',
        population: Math.max(0, 100 - batteryAnalytics.remainingLife),
        color: '#f97316',
        legendFontColor: theme.colors.text,
        legendFontSize: 13,
      },
    ];

    const predictedFailureCopy = formatDate(batteryAnalytics.predictedFailureDate);

    return (
      <View style={styles.sectionStack}>
        <GlassCard style={styles.cardSpacing}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Battery health</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Real-time lifetime intelligence</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: badgeSurfaceColor }]}>
              <Text style={[styles.badgeText, { color: '#38bdf8' }]}>Live</Text>
            </View>
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricCard}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Remaining life</Text>
              <Text style={[styles.metricValue, { color: getBatteryHealthColor(batteryAnalytics.remainingLife) }]}
              >
                {batteryAnalytics.remainingLife}%
              </Text>
              <Text style={[styles.metricCaption, { color: theme.colors.textSecondary }]}>Projected at current usage</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Warranty status</Text>
              <Text style={[styles.metricValue, { color: getWarrantyStatusColor(batteryAnalytics.warrantyStatus) }]}>
                {batteryAnalytics.warrantyStatus}
              </Text>
              <Text style={[styles.metricCaption, { color: theme.colors.textSecondary }]}>
                {predictedFailureCopy ? `Predicted failure ${predictedFailureCopy}` : 'No failure detected'}
              </Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard style={styles.cardSpacing}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Health distribution</Text>
            <Text style={[styles.cardHint, { color: theme.colors.textSecondary }]}>Last 6 months</Text>
          </View>
          <View style={styles.chartWrapper}>
            <PieChart
              data={distributionData}
              width={chartWidth}
              height={220}
              chartConfig={pieChartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="28"
            />
          </View>
        </GlassCard>

        {batteryAnalytics.recommendedActions.length > 0 && (
          <GlassCard style={styles.cardSpacing}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recommended actions</Text>
              <Text style={[styles.cardHint, { color: theme.colors.textSecondary }]}>AI generated</Text>
            </View>
            <View>
              {batteryAnalytics.recommendedActions.map((action, index) => (
                <View key={index} style={styles.actionRow}>
                  <View style={styles.actionBullet} />
                  <Text style={[styles.actionText, { color: theme.colors.text }]}>{action}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}
      </View>
    );
  };

  const ChargingAnalyticsTab = () => {
    if (!chargingAnalytics) {
      return null;
    }

    const efficiencyData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          data: [85, 87, 84, 89, 91, chargingAnalytics.chargingEfficiency ?? 88],
          color: (opacity = 1) => `rgba(94, 234, 212, ${opacity})`,
          strokeWidth: 3,
        },
      ],
      legend: ['Efficiency %'],
    };

    return (
      <View style={styles.sectionStack}>
        <GlassCard style={styles.cardSpacing}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Charging efficiency</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Optimisation insights</Text>
            </View>
            <TouchableOpacity onPress={handleRefresh} style={[styles.badge, { backgroundColor: badgeSurfaceColor }]}>
              <Text style={[styles.badgeText, { color: '#38bdf8' }]}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricCard}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Current efficiency</Text>
              <Text style={[styles.metricValue, { color: '#22d3ee' }]}>{chargingAnalytics.chargingEfficiency ?? '--'}%</Text>
              <Text style={[styles.metricCaption, { color: theme.colors.textSecondary }]}>Across connected chargers</Text>
            </View>
          </View>

          <View style={styles.chartWrapper}>
            <LineChart
              data={efficiencyData}
              width={chartWidth}
              height={220}
              chartConfig={lineChartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </GlassCard>

        {chargingAnalytics.costOptimization && (
          <GlassCard style={styles.cardSpacing}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Cost optimisation</Text>
              <Text style={[styles.cardHint, { color: theme.colors.textSecondary }]}>Monthly projection</Text>
            </View>

            <View style={styles.metricGrid}>
              <View style={styles.metricCard}>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Current cost</Text>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}
                >
                  ${chargingAnalytics.costOptimization.currentCost.toFixed(2)}
                </Text>
                <Text style={[styles.metricCaption, { color: theme.colors.textSecondary }]}>Before smart routing</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Optimised cost</Text>
                <Text style={[styles.metricValue, { color: '#2dd4bf' }]}
                >
                  ${chargingAnalytics.costOptimization.optimizedCost.toFixed(2)}
                </Text>
                <Text style={[styles.metricCaption, { color: theme.colors.textSecondary }]}>With preferred schedule</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Savings potential</Text>
                <Text style={[styles.metricValue, { color: '#34d399' }]}
                >
                  ${chargingAnalytics.costOptimization.savings.toFixed(2)}
                </Text>
                <Text style={[styles.metricCaption, { color: theme.colors.textSecondary }]}>≈{Math.round((chargingAnalytics.costOptimization.savings / chargingAnalytics.costOptimization.currentCost) * 100)}% reduction</Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, Math.round((chargingAnalytics.costOptimization.savings / chargingAnalytics.costOptimization.currentCost) * 100))}%`,
                  },
                ]}
              />
            </View>
          </GlassCard>
        )}

        {chargingAnalytics.recommendedActions.length > 0 && (
          <GlassCard style={styles.cardSpacing}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Charging playbook</Text>
              <Text style={[styles.cardHint, { color: theme.colors.textSecondary }]}>Tailored actions</Text>
            </View>
            <View>
              {chargingAnalytics.recommendedActions.map((action, index) => (
                <View key={index} style={styles.actionRow}>
                  <View style={styles.actionBullet} />
                  <Text style={[styles.actionText, { color: theme.colors.text }]}>{action}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}
      </View>
    );
  };

  if (!vehicles.length && !loading) {
    return (
      <ScreenContainer>
        <View style={styles.emptyState}>
          <Text style={[styles.screenTitle, { color: theme.colors.text }]}>No vehicles yet</Text>
          <Text style={[styles.screenSubtitle, { color: theme.colors.textSecondary }]}>Connect a vehicle to unlock analytics.</Text>
          <TouchableOpacity onPress={fetchVehicles} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.screenTitle, { color: theme.colors.text }]}>Analytics & Insights</Text>
          <Text style={[styles.screenSubtitle, { color: theme.colors.textSecondary }]}>Deep intelligence for your EV fleet</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.vehiclePicker}>
        <Text style={[styles.vehiclePickerLabel, { color: theme.colors.textSecondary }]}>Vehicle</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {vehicles.map((vehicle) => {
            const isSelected = vehicle.id === selectedVehicle;
            return (
              <TouchableOpacity
                key={vehicle.id}
                onPress={() => setSelectedVehicle(vehicle.id)}
                style={[
                  styles.vehicleChip,
                  isSelected && { backgroundColor: 'rgba(56,189,248,0.22)', borderColor: '#38bdf8' },
                ]}
              >
                <Text
                  style={[
                    styles.vehicleChipText,
                    { color: isSelected ? '#38bdf8' : theme.colors.text },
                  ]}
                >
                  {vehicle.brand} {vehicle.model}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.tabSelector}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isActive && styles.tabActive,
                isActive && { borderColor: '#38bdf8' },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? '#38bdf8' : theme.colors.textSecondary },
                ]}
              >
                {tab.icon} {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Crunching telemetry…</Text>
        </View>
      ) : (
        <>
          {activeTab === 'battery' && <BatteryAnalyticsTab />}
          {activeTab === 'charging' && <ChargingAnalyticsTab />}
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  screenSubtitle: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.85,
  },
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.65)',
  },
  refreshIcon: {
    fontSize: 20,
  },
  vehiclePicker: {
    marginBottom: 24,
  },
  vehiclePickerLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 1,
  },
  vehicleChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(15,23,42,0.6)',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
  },
  vehicleChipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  tabActive: {
    backgroundColor: 'rgba(8,47,73,0.35)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingState: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  sectionStack: {
    marginBottom: 24,
  },
  cardSpacing: {
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    marginTop: 6,
    fontSize: 13,
  },
  cardHint: {
    fontSize: 12,
    opacity: 0.8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.4)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricCard: {
    flexBasis: '48%',
    marginRight: '4%',
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 13,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  metricCaption: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.75,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  chart: {
    marginTop: 12,
    borderRadius: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  actionBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34d399',
    marginRight: 12,
    marginTop: 6,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(148,163,184,0.18)',
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#34d399',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  primaryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#38bdf8',
  },
  primaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
});

export default AnalyticsScreen;
