import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { flexiEVAPI, Vehicle } from '../api/flexiEVApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VehicleManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);



  const loadVehicles = async () => {
    try {
      setLoading(true);
      console.log('Loading vehicles for user...');
      const data = await flexiEVAPI.getVehicles();
      console.log('Loaded vehicles:', data?.length || 0, 'vehicles');
      setVehicles(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load vehicles');
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVehicles();
    setRefreshing(false);
  };



  const handleVehicleSelect = async (vehicle: Vehicle) => {
    try {
      // Store selected vehicle in AsyncStorage
      await AsyncStorage.setItem('selectedVehicle', JSON.stringify(vehicle));
      
      Alert.alert(
        'Vehicle Selected',
        `You selected ${vehicle.brand} ${vehicle.vehicleModel}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Go to Dashboard', 
            onPress: () => {
              // Navigate to main dashboard
              (navigation as any).navigate('Dashboard');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error storing selected vehicle:', error);
      Alert.alert('Error', 'Failed to select vehicle');
    }
  };

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
    <TouchableOpacity 
      style={[styles.vehicleCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleVehicleSelect(vehicle)}
      activeOpacity={0.7}
    >
      <View style={styles.vehicleHeader}>
        <Text style={[styles.vehicleBrand, { color: theme.colors.primary }]}>
          {vehicle.brand}
        </Text>
        <Text style={[styles.vehicleModel, { color: theme.colors.text }]}>
          {vehicle.vehicleModel}
        </Text>
      </View>
      <View style={styles.vehicleDetails}>
        <Text style={[styles.vehicleInfo, { color: theme.colors.textSecondary }]}>
          VIN: {vehicle.vin}
        </Text>
        <Text style={[styles.vehicleInfo, { color: theme.colors.textSecondary }]}>
          Status: {vehicle.status}
        </Text>
        <Text style={[styles.vehicleInfo, { color: theme.colors.textSecondary }]}>
          Registered: {new Date(vehicle.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.selectButton}>
        <Text style={[styles.selectButtonText, { color: theme.colors.primary }]}>
          Select Vehicle →
        </Text>
      </View>
    </TouchableOpacity>
  );



  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            My Vehicles
          </Text>
          {user && (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {user.profile?.firstName} {user.profile?.lastName}
            </Text>
          )}
        </View>
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
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <VehicleCard vehicle={item} />}
          style={styles.vehicleList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No vehicles registered yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary, marginTop: 8 }]}>
                Contact your administrator to register vehicles
              </Text>
            </View>
          }
        />
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
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
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
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }),
  } as any,
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
  selectButton: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  selectButtonText: {
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
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default VehicleManagementScreen;
