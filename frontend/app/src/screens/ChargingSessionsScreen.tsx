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
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { flexiEVAPI, ChargingSession, Vehicle, BatteryTelemetry } from '../api/flexiEVApi';

const ChargingSessionsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [chargingSessions, setChargingSessions] = useState<ChargingSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChargingSession | null>(null);
  const [batteryData, setBatteryData] = useState<{[vehicleId: string]: BatteryTelemetry | null}>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [endSessionData, setEndSessionData] = useState({
    kwhDelivered: '',
    duration: '',
    cost: '',
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (vehicles.length > 0) {
      loadBatteryData();
    }
  }, [vehicles]);

  useEffect(() => {
    if (selectedVehicle) {
      loadChargingSessions();
    }
  }, [selectedVehicle]);

  const loadVehicles = async () => {
    try {
      const data = await flexiEVAPI.getVehicles();
      setVehicles(data);
      if (data.length > 0 && !selectedVehicle) {
        setSelectedVehicle(data[0]._id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load vehicles');
      console.error(error);
    }
  };

  const loadBatteryData = async () => {
    try {
      const batteryDataMap: {[vehicleId: string]: BatteryTelemetry | null} = {};
      
      // Load battery data for all vehicles
      for (const vehicle of vehicles) {
        try {
          const latestBattery = await flexiEVAPI.getLatestBatteryData(vehicle._id);
          batteryDataMap[vehicle._id] = latestBattery;
        } catch (error) {
          console.log(`No battery data found for vehicle ${vehicle._id}`);
          batteryDataMap[vehicle._id] = null;
        }
      }
      
      setBatteryData(batteryDataMap);
    } catch (error) {
      console.error('Error loading battery data:', error);
    }
  };

  const loadChargingSessions = async () => {
    try {
      setLoading(true);
      const sessions = await flexiEVAPI.getChargingHistory(selectedVehicle);
      setChargingSessions(sessions);
      // Find active session (no end time)
      const active = sessions.find(s => !s.endTime);
      setActiveSession(active || null);
    } catch (error) {
      Alert.alert('Error', 'Failed to load charging sessions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadBatteryData(),
      selectedVehicle ? loadChargingSessions() : Promise.resolve()
    ]);
    setRefreshing(false);
  };



  const handleEndSession = async () => {
    try {
      if (!selectedVehicle || !activeSession) {
        Alert.alert('Error', 'No active session found');
        return;
      }

      const sessionData = {
        energyDelivered: parseFloat(endSessionData.kwhDelivered),
        cost: parseFloat(endSessionData.cost),
      };

      if (Object.values(sessionData).some(v => isNaN(v))) {
        Alert.alert('Error', 'Please enter valid numeric values');
        return;
      }

      await flexiEVAPI.endChargingSession(selectedVehicle, sessionData);
      setActiveSession(null);
      setEndSessionData({ kwhDelivered: '', duration: '', cost: '' });
      setShowEndModal(false);
      await loadChargingSessions();
      Alert.alert('Success', 'Charging session ended');
    } catch (error) {
      Alert.alert('Error', 'Failed to end charging session');
      console.error(error);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getSessionStatus = (session: ChargingSession) => {
    return session.endTime ? 'Completed' : 'Active';
  };

  const getSessionStatusColor = (session: ChargingSession) => {
    return session.endTime ? '#22c55e' : '#f59e0b';
  };

  const getBatteryLevelColor = (level: number) => {
    if (level > 80) return '#22c55e';
    if (level > 20) return '#f59e0b';
    return '#ef4444';
  };

  const getBatteryHealthColor = (health: number) => {
    if (health > 80) return '#22c55e';
    if (health > 60) return '#f59e0b';
    return '#ef4444';
  };

  const BatteryStatusCard = ({ vehicle, battery }: { vehicle: Vehicle, battery: BatteryTelemetry | null }) => (
    <View style={[styles.batteryCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.batteryHeader}>
        <Text style={[styles.vehicleName, { color: theme.colors.text }]}>
          {vehicle.brand} {vehicle.vehicleModel}
        </Text>
        <Text style={[styles.vehicleVin, { color: theme.colors.textSecondary }]}>
          VIN: {vehicle.vin}
        </Text>
      </View>
      
      {battery ? (
        <View style={styles.batteryStats}>
          <View style={styles.batteryRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Battery Level
              </Text>
              <Text style={[styles.statValue, { color: getBatteryLevelColor(battery.batteryLevel) }]}>
                {battery.batteryLevel}%
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Health
              </Text>
              <Text style={[styles.statValue, { color: getBatteryHealthColor(battery.health) }]}>
                {battery.health}%
              </Text>
            </View>
          </View>
          
          <View style={styles.batteryRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Temperature
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {battery.temperature}°C
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Cycle Count
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {battery.cycleCount}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.lastUpdate, { color: theme.colors.textSecondary }]}>
            Last updated: {new Date(battery.createdAt).toLocaleString()}
          </Text>
        </View>
      ) : (
        <View style={styles.noBatteryData}>
          <Text style={[styles.noBatteryText, { color: theme.colors.textSecondary }]}>
            No battery data available
          </Text>
        </View>
      )}
    </View>
  );

  const BatteryStatusSection = () => (
    <View style={styles.batterySection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Battery Status
      </Text>
      {vehicles.length > 0 ? (
        vehicles.map(vehicle => (
          <BatteryStatusCard
            key={vehicle._id}
            vehicle={vehicle}
            battery={batteryData[vehicle._id] || null}
          />
        ))
      ) : (
        <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
          No vehicles found
        </Text>
      )}
    </View>
  );

  const ChargingSessionCard = ({ item }: { item: ChargingSession }) => (
    <View style={[styles.sessionCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={[styles.location, { color: theme.colors.text }]}>
            {item.location}
          </Text>
          <Text style={[styles.chargerId, { color: theme.colors.textSecondary }]}>
            Charger: {item.chargerId}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getSessionStatusColor(item) }
        ]}>
          <Text style={styles.statusText}>{getSessionStatus(item)}</Text>
        </View>
      </View>

      <View style={styles.sessionDetails}>
        <View style={styles.timeInfo}>
          <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
            Started: {new Date(item.startTime).toLocaleString()}
          </Text>
          {item.endTime && (
            <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
              Ended: {new Date(item.endTime).toLocaleString()}
            </Text>
          )}
        </View>

        {item.endTime && (
          <View style={styles.sessionStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Energy
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {item.energyDelivered || 0} kWh
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Duration
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {item.endTime ? formatDuration(Math.floor((new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / 60000)) : 'N/A'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Cost
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                ${item.cost?.toFixed(2)}
              </Text>
            </View>
          </View>
        )}


      </View>
    </View>
  );

  const ActiveSessionSummary = () => {
    if (!activeSession) return null;

    const duration = Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 60000);

    return (
      <View style={[styles.activeSessionCard, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.activeSessionTitle}>Active Charging Session</Text>
        <Text style={styles.activeSessionLocation}>{activeSession.location}</Text>
        <Text style={styles.activeSessionDetails}>
          Charger: {activeSession.chargerId} • Duration: {formatDuration(duration)}
        </Text>
        <TouchableOpacity
          style={[styles.endButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
          onPress={() => setShowEndModal(true)}
        >
          <Text style={styles.endButtonText}>End Session</Text>
        </TouchableOpacity>
      </View>
    );
  };



  const EndSessionModal = () => (
    <Modal visible={showEndModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            End Charging Session
          </Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Energy Delivered (kWh)"
            placeholderTextColor={theme.colors.textSecondary}
            value={endSessionData.kwhDelivered}
            onChangeText={(text) => setEndSessionData({ ...endSessionData, kwhDelivered: text })}
            keyboardType="numeric"
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Duration (minutes)"
            placeholderTextColor={theme.colors.textSecondary}
            value={endSessionData.duration}
            onChangeText={(text) => setEndSessionData({ ...endSessionData, duration: text })}
            keyboardType="numeric"
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Total Cost ($)"
            placeholderTextColor={theme.colors.textSecondary}
            value={endSessionData.cost}
            onChangeText={(text) => setEndSessionData({ ...endSessionData, cost: text })}
            keyboardType="numeric"
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowEndModal(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={handleEndSession}
            >
              <Text style={styles.buttonText}>End Session</Text>
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
          Charging Sessions
        </Text>
      </View>

      <View style={styles.vehicleSelector}>
        <Text style={[styles.selectorLabel, { color: theme.colors.text }]}>Vehicle:</Text>
        <View style={styles.vehicleButtons}>
          {vehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle._id}
              style={[
                styles.vehicleButton,
                selectedVehicle === vehicle._id && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setSelectedVehicle(vehicle._id)}
            >
              <Text style={[
                styles.vehicleButtonText,
                selectedVehicle === vehicle._id ? { color: 'white' } : { color: theme.colors.text }
              ]}>
                {vehicle.brand} {vehicle.vehicleModel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <BatteryStatusSection />

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading charging sessions...
          </Text>
        </View>
      ) : (
        <>
          <ActiveSessionSummary />
          
          <FlatList
            data={chargingSessions}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <ChargingSessionCard item={item} />}
            style={styles.sessionsList}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.centerContent}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No charging sessions found
                </Text>
              </View>
            }
          />
        </>
      )}

      <EndSessionModal />
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
  activeSessionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  activeSessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  activeSessionLocation: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
  activeSessionDetails: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  endButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  endButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sessionsList: {
    flex: 1,
  },
  sessionCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  location: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chargerId: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sessionDetails: {
    gap: 8,
  },
  timeInfo: {
    gap: 2,
  },
  timestamp: {
    fontSize: 12,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  txId: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 4,
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
  // Battery Status Styles
  batterySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  batteryCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  batteryHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  vehicleVin: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  batteryStats: {
    gap: 12,
  },
  batteryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lastUpdate: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  noBatteryData: {
    padding: 20,
    alignItems: 'center',
  },
  noBatteryText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  noDataText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ChargingSessionsScreen;
