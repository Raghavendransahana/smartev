import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../contexts/ThemeContext';
import { flexiEVAPI, BatteryTelemetry, Vehicle } from '../api/flexiEVApi';

const { width } = Dimensions.get('window');

const BatteryManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [batteryHistory, setBatteryHistory] = useState<BatteryTelemetry[]>([]);
  const [latestData, setLatestData] = useState<BatteryTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTelemetry, setNewTelemetry] = useState({
    soc: '',
    soh: '',
    temperature: '',
    cycleCount: '',
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      loadBatteryData();
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

  const loadBatteryData = async () => {
    try {
      setLoading(true);
      const [history, latest] = await Promise.all([
        flexiEVAPI.getBatteryHistory(selectedVehicle),
        flexiEVAPI.getLatestBatteryData(selectedVehicle),
      ]);
      setBatteryHistory(history);
      setLatestData(latest);
    } catch (error) {
      Alert.alert('Error', 'Failed to load battery data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedVehicle) return;
    setRefreshing(true);
    await loadBatteryData();
    setRefreshing(false);
  };

  const handleAddTelemetry = async () => {
    try {
      if (!selectedVehicle) {
        Alert.alert('Error', 'Please select a vehicle');
        return;
      }

      const telemetryData = {
        soc: parseFloat(newTelemetry.soc),
        soh: parseFloat(newTelemetry.soh),
        temperature: parseFloat(newTelemetry.temperature),
        cycleCount: parseInt(newTelemetry.cycleCount),
      };

      if (Object.values(telemetryData).some(v => isNaN(v))) {
        Alert.alert('Error', 'Please enter valid numeric values');
        return;
      }

      await flexiEVAPI.logBatteryTelemetry(selectedVehicle, telemetryData);
      setNewTelemetry({ soc: '', soh: '', temperature: '', cycleCount: '' });
      setShowAddModal(false);
      await loadBatteryData();
      Alert.alert('Success', 'Battery telemetry logged successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to log telemetry');
      console.error(error);
    }
  };

  const getChartData = () => {
    const recentData = batteryHistory.slice(-10);
    return {
      labels: recentData.map((_, index) => `${index + 1}`),
      datasets: [
        {
          data: recentData.map(d => d.soc),
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: recentData.map(d => d.soh),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['SoC (%)', 'SoH (%)'],
    };
  };

  const BatteryTelemetryCard = ({ item }: { item: BatteryTelemetry }) => (
    <View style={[styles.telemetryCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.telemetryHeader}>
        <Text style={[styles.timestamp, { color: theme.colors.text }]}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
        {item.blockchainTxId && (
          <Text style={[styles.txId, { color: theme.colors.primary }]}>
            TX: {item.blockchainTxId.substring(0, 8)}...
          </Text>
        )}
      </View>
      <View style={styles.telemetryData}>
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>SoC:</Text>
          <Text style={[styles.dataValue, { color: theme.colors.text }]}>{item.soc}%</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>SoH:</Text>
          <Text style={[styles.dataValue, { color: theme.colors.text }]}>{item.soh}%</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>Temp:</Text>
          <Text style={[styles.dataValue, { color: theme.colors.text }]}>{item.temperature}°C</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>Cycles:</Text>
          <Text style={[styles.dataValue, { color: theme.colors.text }]}>{item.cycleCount}</Text>
        </View>
      </View>
    </View>
  );

  const LatestDataSummary = () => {
    if (!latestData) return null;

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

    return (
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
          Latest Battery Status
        </Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              State of Charge
            </Text>
            <Text style={[styles.summaryValue, { color: getSoCColor(latestData.soc) }]}>
              {latestData.soc}%
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              State of Health
            </Text>
            <Text style={[styles.summaryValue, { color: getSoHColor(latestData.soh) }]}>
              {latestData.soh}%
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Temperature
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {latestData.temperature}°C
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Cycle Count
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {latestData.cycleCount}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const AddTelemetryModal = () => (
    <Modal visible={showAddModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Log Battery Telemetry
          </Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="State of Charge (%)"
            placeholderTextColor={theme.colors.textSecondary}
            value={newTelemetry.soc}
            onChangeText={(text) => setNewTelemetry({ ...newTelemetry, soc: text })}
            keyboardType="numeric"
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="State of Health (%)"
            placeholderTextColor={theme.colors.textSecondary}
            value={newTelemetry.soh}
            onChangeText={(text) => setNewTelemetry({ ...newTelemetry, soh: text })}
            keyboardType="numeric"
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Temperature (°C)"
            placeholderTextColor={theme.colors.textSecondary}
            value={newTelemetry.temperature}
            onChangeText={(text) => setNewTelemetry({ ...newTelemetry, temperature: text })}
            keyboardType="numeric"
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Cycle Count"
            placeholderTextColor={theme.colors.textSecondary}
            value={newTelemetry.cycleCount}
            onChangeText={(text) => setNewTelemetry({ ...newTelemetry, cycleCount: text })}
            keyboardType="numeric"
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddTelemetry}
            >
              <Text style={styles.buttonText}>Log Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Battery Management
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddModal(true)}
          disabled={!selectedVehicle}
        >
          <Text style={styles.buttonText}>+ Log Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.vehicleSelector}>
        <Text style={[styles.selectorLabel, { color: theme.colors.text }]}>Vehicle:</Text>
        <View style={styles.vehicleButtons}>
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
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading battery data...
          </Text>
        </View>
      ) : (
        <>
          <LatestDataSummary />
          
          {batteryHistory.length > 0 && (
            <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
                Battery Trends (Last 10 Records)
              </Text>
              <LineChart
                data={getChartData()}
                width={width - 32}
                height={220}
                chartConfig={{
                  backgroundColor: theme.colors.surface,
                  backgroundGradientFrom: theme.colors.surface,
                  backgroundGradientTo: theme.colors.surface,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => theme.colors.text,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>
          )}

          <FlatList
            data={batteryHistory}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <BatteryTelemetryCard item={item} />}
            style={styles.telemetryList}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.centerContent}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No battery data found
                </Text>
              </View>
            }
          />
        </>
      )}

      <AddTelemetryModal />
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
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  vehicleSelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  vehicleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vehicleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  vehicleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  telemetryList: {
    flex: 1,
  },
  telemetryCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  telemetryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 14,
    fontWeight: '600',
  },
  txId: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  telemetryData: {
    gap: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 14,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
});

export default BatteryManagementScreen;
