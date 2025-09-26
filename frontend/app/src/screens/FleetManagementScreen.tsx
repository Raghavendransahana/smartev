import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../contexts/ThemeContext';
import { flexiEVAPI, FleetSummary, Alert as EVAlert, Vehicle } from '../api/flexiEVApi';

const { width } = Dimensions.get('window');

const FleetManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const [fleetSummary, setFleetSummary] = useState<FleetSummary | null>(null);
  const [alerts, setAlerts] = useState<EVAlert[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [newAlert, setNewAlert] = useState({
    type: 'battery_degradation' as EVAlert['type'],
    severity: 'medium' as EVAlert['severity'],
    message: '',
  });

  const alertTypes = [
    { key: 'battery_degradation', label: 'Battery Degradation' },
    { key: 'abnormal_charging', label: 'Abnormal Charging' },
    { key: 'maintenance_required', label: 'Maintenance Required' },
  ];

  const severityLevels = [
    { key: 'low', label: 'Low', color: '#22c55e' },
    { key: 'medium', label: 'Medium', color: '#f59e0b' },
    { key: 'high', label: 'High', color: '#f97316' },
    { key: 'critical', label: 'Critical', color: '#ef4444' },
  ];

  useEffect(() => {
    loadFleetData();
  }, []);

  const loadFleetData = async () => {
    try {
      setLoading(true);
      const [summary, vehicleList] = await Promise.all([
        flexiEVAPI.getFleetSummary(),
        flexiEVAPI.getVehicles(),
      ]);
      setFleetSummary(summary);
      setVehicles(vehicleList);
      
      // Mock alerts data since it's not in the API yet
      const mockAlerts: EVAlert[] = [
        {
          id: '1',
          vehicleId: vehicleList[0]?.id || 'vehicle-1',
          type: 'battery_degradation',
          severity: 'high',
          message: 'Battery health below 70%',
          timestamp: new Date().toISOString(),
          resolved: false,
        },
        {
          id: '2',
          vehicleId: vehicleList[1]?.id || 'vehicle-2',
          type: 'abnormal_charging',
          severity: 'medium',
          message: 'Charging efficiency decreased by 15%',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          resolved: false,
        },
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load fleet data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFleetData();
    setRefreshing(false);
  };

  const handleRaiseAlert = async () => {
    try {
      if (!selectedVehicle) {
        Alert.alert('Error', 'Please select a vehicle');
        return;
      }

      if (!newAlert.message.trim()) {
        Alert.alert('Error', 'Please enter an alert message');
        return;
      }

      await flexiEVAPI.raiseAlert(selectedVehicle, newAlert);
      setNewAlert({
        type: 'battery_degradation',
        severity: 'medium',
        message: '',
      });
      setSelectedVehicle('');
      setShowAlertModal(false);
      await loadFleetData();
      Alert.alert('Success', 'Alert raised successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to raise alert');
      console.error(error);
    }
  };

  const getSeverityColor = (severity: EVAlert['severity']) => {
    return severityLevels.find(s => s.key === severity)?.color || '#666';
  };

  const getAlertIcon = (type: EVAlert['type']) => {
    switch (type) {
      case 'battery_degradation':
        return '🔋';
      case 'abnormal_charging':
        return '⚡';
      case 'maintenance_required':
        return '🔧';
      default:
        return '⚠️';
    }
  };

  const FleetSummaryCard = () => {
    if (!fleetSummary) return null;

    const vehicleStatusData = [
      {
        name: 'Active',
        population: fleetSummary.activeVehicles,
        color: '#22c55e',
        legendFontColor: theme.colors.text,
        legendFontSize: 14,
      },
      {
        name: 'Inactive',
        population: fleetSummary.totalVehicles - fleetSummary.activeVehicles,
        color: '#ef4444',
        legendFontColor: theme.colors.text,
        legendFontSize: 14,
      },
    ];

    const chartConfig = {
      backgroundColor: theme.colors.surface,
      backgroundGradientFrom: theme.colors.surface,
      backgroundGradientTo: theme.colors.surface,
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    };

    return (
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
          Fleet Overview
        </Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
              {fleetSummary.totalVehicles}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Total Vehicles
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#22c55e' }]}>
              {fleetSummary.activeVehicles}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Active
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {fleetSummary.averageBatteryHealth}%
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Avg Battery Health
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>
              {fleetSummary.alerts}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Active Alerts
            </Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            Vehicle Status Distribution
          </Text>
          <PieChart
            data={vehicleStatusData}
            width={width - 64}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </View>
    );
  };

  const AlertCard = ({ item }: { item: EVAlert }) => {
    const vehicle = vehicles.find(v => v.id === item.vehicleId);
    
    return (
      <View style={[styles.alertCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.alertHeader}>
          <View style={styles.alertInfo}>
            <View style={styles.alertTypeContainer}>
              <Text style={styles.alertIcon}>{getAlertIcon(item.type)}</Text>
              <Text style={[styles.alertType, { color: theme.colors.text }]}>
                {alertTypes.find(t => t.key === item.type)?.label}
              </Text>
            </View>
            <Text style={[styles.vehicleInfo, { color: theme.colors.textSecondary }]}>
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : item.vehicleId}
            </Text>
          </View>
          <View style={[
            styles.severityBadge,
            { backgroundColor: getSeverityColor(item.severity) }
          ]}>
            <Text style={styles.severityText}>
              {item.severity.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={[styles.alertMessage, { color: theme.colors.text }]}>
          {item.message}
        </Text>

        <View style={styles.alertFooter}>
          <Text style={[styles.alertTimestamp, { color: theme.colors.textSecondary }]}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
          {!item.resolved && (
            <TouchableOpacity
              style={[styles.resolveButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                // Mock resolve action
                const updatedAlerts = alerts.map(a =>
                  a.id === item.id ? { ...a, resolved: true } : a
                );
                setAlerts(updatedAlerts);
              }}
            >
              <Text style={styles.resolveButtonText}>Resolve</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const RaiseAlertModal = () => (
    <Modal visible={showAlertModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Raise New Alert
          </Text>
          
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Vehicle:</Text>
          <View style={styles.vehicleSelector}>
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleOption,
                  selectedVehicle === vehicle.id && { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setSelectedVehicle(vehicle.id)}
              >
                <Text style={[
                  styles.vehicleOptionText,
                  selectedVehicle === vehicle.id ? { color: 'white' } : { color: theme.colors.text }
                ]}>
                  {vehicle.brand} {vehicle.model}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Alert Type:</Text>
          <View style={styles.typeSelector}>
            {alertTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.typeOption,
                  newAlert.type === type.key && { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setNewAlert({ ...newAlert, type: type.key as EVAlert['type'] })}
              >
                <Text style={[
                  styles.typeOptionText,
                  newAlert.type === type.key ? { color: 'white' } : { color: theme.colors.text }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Severity:</Text>
          <View style={styles.severitySelector}>
            {severityLevels.map((severity) => (
              <TouchableOpacity
                key={severity.key}
                style={[
                  styles.severityOption,
                  { borderColor: severity.color },
                  newAlert.severity === severity.key && { backgroundColor: severity.color },
                ]}
                onPress={() => setNewAlert({ ...newAlert, severity: severity.key as EVAlert['severity'] })}
              >
                <Text style={[
                  styles.severityOptionText,
                  newAlert.severity === severity.key ? { color: 'white' } : { color: severity.color }
                ]}>
                  {severity.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={[styles.messageInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Alert message"
            placeholderTextColor={theme.colors.textSecondary}
            value={newAlert.message}
            onChangeText={(text) => setNewAlert({ ...newAlert, message: text })}
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowAlertModal(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={handleRaiseAlert}
            >
              <Text style={styles.buttonText}>Raise Alert</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const activeAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Fleet Management
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAlertModal(true)}
        >
          <Text style={styles.buttonText}>+ Raise Alert</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading fleet data...
          </Text>
        </View>
      ) : (
        <>
          <FleetSummaryCard />
          
          <View style={styles.alertsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Active Alerts ({activeAlerts.length})
            </Text>
            <FlatList
              data={activeAlerts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <AlertCard item={item} />}
              style={styles.alertsList}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              ListEmptyComponent={
                <View style={styles.centerContent}>
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    No active alerts
                  </Text>
                </View>
              }
            />
          </View>
        </>
      )}

      <RaiseAlertModal />
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
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }),
  } as any,
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  alertsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  alertsList: {
    flex: 1,
  },
  alertCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }),
  } as any,
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertInfo: {
    flex: 1,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  alertType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  vehicleInfo: {
    fontSize: 14,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertMessage: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTimestamp: {
    fontSize: 12,
  },
  resolveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  resolveButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  vehicleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  vehicleOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  vehicleOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  typeSelector: {
    gap: 4,
    marginBottom: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  severitySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  severityOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
  },
  severityOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  messageInput: {
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default FleetManagementScreen;
