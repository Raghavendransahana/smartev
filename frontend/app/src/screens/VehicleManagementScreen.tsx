import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { flexiEVAPI, Vehicle } from '../api/flexiEVApi';

const VehicleManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [newVehicle, setNewVehicle] = useState({
    brand: '',
    model: '',
    vin: '',
    owner: '',
  });

  const brands = ['Tesla', 'BMW', 'Nissan', 'Chevrolet', 'Ford', 'Rivian', 'Lucid'];

  useEffect(() => {
    loadVehicles();
  }, [selectedBrand]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await flexiEVAPI.getVehicles(selectedBrand || undefined);
      setVehicles(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load vehicles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVehicles();
    setRefreshing(false);
  };

  const handleAddVehicle = async () => {
    try {
      if (!newVehicle.brand || !newVehicle.model || !newVehicle.vin || !newVehicle.owner) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const vehicle = await flexiEVAPI.registerVehicle(newVehicle);
      setVehicles([...vehicles, vehicle]);
      setNewVehicle({ brand: '', model: '', vin: '', owner: '' });
      setShowAddModal(false);
      Alert.alert('Success', 'Vehicle registered successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to register vehicle');
      console.error(error);
    }
  };

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
    <View style={[styles.vehicleCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.vehicleHeader}>
        <Text style={[styles.vehicleBrand, { color: theme.colors.primary }]}>
          {vehicle.brand}
        </Text>
        <Text style={[styles.vehicleModel, { color: theme.colors.text }]}>
          {vehicle.model}
        </Text>
      </View>
      <View style={styles.vehicleDetails}>
        <Text style={[styles.vehicleInfo, { color: theme.colors.textSecondary }]}>
          VIN: {vehicle.vin}
        </Text>
        <Text style={[styles.vehicleInfo, { color: theme.colors.textSecondary }]}>
          Owner: {vehicle.owner}
        </Text>
        <Text style={[styles.vehicleInfo, { color: theme.colors.textSecondary }]}>
          Registered: {new Date(vehicle.registrationDate).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const AddVehicleModal = () => (
    <Modal visible={showAddModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Register New Vehicle
          </Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Brand"
            placeholderTextColor={theme.colors.textSecondary}
            value={newVehicle.brand}
            onChangeText={(text) => setNewVehicle({ ...newVehicle, brand: text })}
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Model"
            placeholderTextColor={theme.colors.textSecondary}
            value={newVehicle.model}
            onChangeText={(text) => setNewVehicle({ ...newVehicle, model: text })}
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="VIN"
            placeholderTextColor={theme.colors.textSecondary}
            value={newVehicle.vin}
            onChangeText={(text) => setNewVehicle({ ...newVehicle, vin: text })}
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Owner"
            placeholderTextColor={theme.colors.textSecondary}
            value={newVehicle.owner}
            onChangeText={(text) => setNewVehicle({ ...newVehicle, owner: text })}
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
              onPress={handleAddVehicle}
            >
              <Text style={styles.buttonText}>Register</Text>
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
          Vehicle Management
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.buttonText}>+ Add Vehicle</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Filter by Brand:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandFilter}>
          <TouchableOpacity
            style={[
              styles.brandChip,
              selectedBrand === '' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setSelectedBrand('')}
          >
            <Text style={[
              styles.brandChipText,
              selectedBrand === '' ? { color: 'white' } : { color: theme.colors.text }
            ]}>All</Text>
          </TouchableOpacity>
          {brands.map((brand) => (
            <TouchableOpacity
              key={brand}
              style={[
                styles.brandChip,
                selectedBrand === brand && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setSelectedBrand(brand)}
            >
              <Text style={[
                styles.brandChipText,
                selectedBrand === brand ? { color: 'white' } : { color: theme.colors.text }
              ]}>{brand}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading vehicles...
          </Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <VehicleCard vehicle={item} />}
          style={styles.vehicleList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No vehicles found
              </Text>
            </View>
          }
        />
      )}

      <AddVehicleModal />
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
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  brandFilter: {
    flexDirection: 'row',
  },
  brandChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  brandChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  vehicleList: {
    flex: 1,
  },
  vehicleCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleBrand: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: '600',
  },
  vehicleDetails: {
    gap: 4,
  },
  vehicleInfo: {
    fontSize: 14,
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

export default VehicleManagementScreen;
