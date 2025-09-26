import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../contexts/ThemeContext';
import { flexiEVAPI, Vehicle, Analytics } from '../api/flexiEVApi';

const { width } = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [batteryAnalytics, setBatteryAnalytics] = useState<Analytics | null>(null);
  const [chargingAnalytics, setChargingAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'battery' | 'charging'>('battery');

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      loadAnalytics();
    }
  }, [selectedVehicle]);

  const loadVehicles = async () => {
    try {
      const data = await flexiEVAPI.getVehicles();
      setVehicles(data);
      if (data.length > 0 && !selectedVehicle) {
        setSelectedVehicle(data[0].id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load vehicles');
      console.error(error);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [battery, charging] = await Promise.all([
        flexiEVAPI.getBatteryAnalytics(selectedVehicle),
        flexiEVAPI.getChargingAnalytics(selectedVehicle),
      ]);
      setBatteryAnalytics(battery);
      setChargingAnalytics(charging);
    } catch (error) {
      Alert.alert('Error', 'Failed to load analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedVehicle) return;
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const getBatteryHealthColor = (remainingLife: number) => {
    if (remainingLife > 80) return '#22c55e';
    if (remainingLife > 60) return '#f59e0b';
    if (remainingLife > 40) return '#f97316';
    return '#ef4444';
  };

  const getWarrantyStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'valid':
        return '#22c55e';
      case 'expiring':
        return '#f59e0b';
      case 'expired':
        return '#ef4444';
      default:
        return '#666';
    }
  };

  const BatteryAnalyticsTab = () => {
    if (!batteryAnalytics) return null;

    const healthData = {
      labels: ['Remaining', 'Degraded'],
      datasets: [{
        data: [batteryAnalytics.remainingLife, 100 - batteryAnalytics.remainingLife],
      }],
    };

    const healthChartConfig = {
      backgroundColor: theme.colors.surface,
      backgroundGradientFrom: theme.colors.surface,
      backgroundGradientTo: theme.colors.surface,
      color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
      strokeWidth: 2,
    };

    return (
      <ScrollView style={styles.tabContent}>
        {/* Battery Health Overview */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Battery Health Overview
          </Text>
          <View style={styles.healthOverview}>
            <View style={styles.healthItem}>
              <Text style={[styles.healthLabel, { color: theme.colors.textSecondary }]}>
                Remaining Life
              </Text>
              <Text style={[
                styles.healthValue,
                { color: getBatteryHealthColor(batteryAnalytics.remainingLife) }
              ]}>
                {batteryAnalytics.remainingLife}%
              </Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={[styles.healthLabel, { color: theme.colors.textSecondary }]}>
                Warranty Status
              </Text>
              <Text style={[
                styles.healthValue,
                { color: getWarrantyStatusColor(batteryAnalytics.warrantyStatus) }
              ]}>
                {batteryAnalytics.warrantyStatus}
              </Text>
            </View>
          </View>
          
          {batteryAnalytics.predictedFailureDate && (
            <View style={styles.predictionContainer}>
              <Text style={[styles.predictionLabel, { color: theme.colors.textSecondary }]}>
                Predicted Failure Date:
              </Text>
              <Text style={[styles.predictionDate, { color: theme.colors.text }]}>
                {new Date(batteryAnalytics.predictedFailureDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Battery Health Chart */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Battery Health Distribution
          </Text>
          <PieChart
            data={[
              {
                name: 'Healthy',
                population: batteryAnalytics.remainingLife,
                color: '#22c55e',
                legendFontColor: theme.colors.text,
                legendFontSize: 14,
              },
              {
                name: 'Degraded',
                population: 100 - batteryAnalytics.remainingLife,
                color: '#ef4444',
                legendFontColor: theme.colors.text,
                legendFontSize: 14,
              },
            ]}
            width={width - 32}
            height={220}
            chartConfig={healthChartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        {/* Recommended Actions */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Recommended Actions
          </Text>
          <View style={styles.actionsList}>
            {batteryAnalytics.recommendedActions.map((action, index) => (
              <View key={index} style={styles.actionItem}>
                <Text style={styles.actionBullet}>•</Text>
                <Text style={[styles.actionText, { color: theme.colors.text }]}>
                  {action}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  const ChargingAnalyticsTab = () => {
    if (!chargingAnalytics) return null;

    const efficiencyData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [85, 87, 84, 89, 91, chargingAnalytics.chargingEfficiency || 88],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      }],
    };

    const chartConfig = {
      backgroundColor: theme.colors.surface,
      backgroundGradientFrom: theme.colors.surface,
      backgroundGradientTo: theme.colors.surface,
      decimalPlaces: 1,
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      labelColor: (opacity = 1) => theme.colors.text,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: '6',
        strokeWidth: '2',
      },
    };

    return (
      <ScrollView style={styles.tabContent}>
        {/* Charging Efficiency */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Charging Efficiency
          </Text>
          <View style={styles.efficiencyContainer}>
            <View style={styles.efficiencyItem}>
              <Text style={[styles.efficiencyLabel, { color: theme.colors.textSecondary }]}>
                Current Efficiency
              </Text>
              <Text style={[styles.efficiencyValue, { color: theme.colors.primary }]}>
                {chargingAnalytics.chargingEfficiency}%
              </Text>
            </View>
          </View>
          
          <LineChart
            data={efficiencyData}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Cost Optimization */}
        {chargingAnalytics.costOptimization && (
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Cost Optimization
            </Text>
            <View style={styles.costGrid}>
              <View style={styles.costItem}>
                <Text style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
                  Current Cost
                </Text>
                <Text style={[styles.costValue, { color: theme.colors.text }]}>
                  ${chargingAnalytics.costOptimization.currentCost.toFixed(2)}
                </Text>
              </View>
              <View style={styles.costItem}>
                <Text style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
                  Optimized Cost
                </Text>
                <Text style={[styles.costValue, { color: theme.colors.primary }]}>
                  ${chargingAnalytics.costOptimization.optimizedCost.toFixed(2)}
                </Text>
              </View>
              <View style={styles.costItem}>
                <Text style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
                  Potential Savings
                </Text>
                <Text style={[styles.costValue, { color: '#22c55e' }]}>
                  ${chargingAnalytics.costOptimization.savings.toFixed(2)}
                </Text>
              </View>
            </View>
            
            <View style={styles.savingsBar}>
              <View style={[
                styles.savingsProgress,
                {
                  backgroundColor: '#22c55e',
                  width: `${(chargingAnalytics.costOptimization.savings / chargingAnalytics.costOptimization.currentCost) * 100}%`
                }
              ]} />
            </View>
          </View>
        )}

        {/* Charging Recommendations */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Charging Recommendations
          </Text>
          <View style={styles.actionsList}>
            {chargingAnalytics.recommendedActions.map((action, index) => (
              <View key={index} style={styles.actionItem}>
                <Text style={styles.actionBullet}>•</Text>
                <Text style={[styles.actionText, { color: theme.colors.text }]}>
                  {action}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Analytics & Insights
        </Text>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleRefresh}
        >
          <Text style={styles.buttonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.vehicleSelector}>
        <Text style={[styles.selectorLabel, { color: theme.colors.text }]}>Vehicle:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleList}>
          {vehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.vehicleButton,
                selectedVehicle === vehicle.id && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setSelectedVehicle(vehicle.id)}
            >
              <Text style={[
                styles.vehicleButtonText,
                selectedVehicle === vehicle.id ? { color: 'white' } : { color: theme.colors.text }
              ]}>
                {vehicle.brand} {vehicle.model}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'battery' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('battery')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'battery' ? { color: 'white' } : { color: theme.colors.text }
          ]}>
            🔋 Battery Analytics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'charging' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('charging')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'charging' ? { color: 'white' } : { color: theme.colors.text }
          ]}>
            ⚡ Charging Analytics
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading analytics...
          </Text>
        </View>
      ) : (
        <>
          {activeTab === 'battery' ? <BatteryAnalyticsTab /> : <ChargingAnalyticsTab />}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  vehicleSelector: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  vehicleList: {
    flexDirection: 'row',
  },
  vehicleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  vehicleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  healthOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  healthItem: {
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  healthValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  predictionContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  predictionLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  predictionDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  actionsList: {
    gap: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionBullet: {
    fontSize: 16,
    marginRight: 8,
    color: '#666',
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  efficiencyContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  efficiencyItem: {
    alignItems: 'center',
  },
  efficiencyLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  efficiencyValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  costGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  costItem: {
    alignItems: 'center',
    flex: 1,
  },
  costLabel: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  costValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  savingsBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  savingsProgress: {
    height: '100%',
    borderRadius: 3,
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
});

export default AnalyticsScreen;
