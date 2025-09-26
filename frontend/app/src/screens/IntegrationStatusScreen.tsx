import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { flexiEVAPI, SystemInfo, Vehicle } from '../api/flexiEVApi';

const IntegrationStatusScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  const checkIntegrationStatus = async () => {
    try {
      setLoading(true);
      setApiStatus('checking');

      // Test API connectivity
      const healthCheck = await flexiEVAPI.checkHealth();
      const info = await flexiEVAPI.getSystemInfo();
      
      setSystemInfo(info);
      setApiStatus('connected');

      // Load user vehicles if authenticated
      if (isAuthenticated) {
        try {
          const userVehicles = await flexiEVAPI.getVehicles();
          setVehicles(userVehicles);
        } catch (error) {
          console.log('Could not load vehicles:', error);
        }
      }
    } catch (error) {
      console.error('API connection failed:', error);
      setApiStatus('disconnected');
      Alert.alert(
        'Connection Error', 
        'Could not connect to the backend API. Please check if the server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkIntegrationStatus();
    setRefreshing(false);
  };

  const StatusCard = ({ title, status, description, icon }: {
    title: string;
    status: 'success' | 'error' | 'warning';
    description: string;
    icon: string;
  }) => {
    const statusColor = status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : '#f59e0b';
    
    return (
      <View style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusIcon, { backgroundColor: statusColor }]}>
            <Ionicons name={icon as any} size={24} color="white" />
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.statusDescription, { color: theme.colors.textSecondary }]}>
              {description}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusBadgeText}>
            {status === 'success' ? 'Connected' : status === 'error' ? 'Failed' : 'Warning'}
          </Text>
        </View>
      </View>
    );
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Checking integration status...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Integration Status
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Backend API connection and data status
          </Text>
        </View>

        {/* API Status */}
        <StatusCard
          title="Backend API"
          status={apiStatus === 'connected' ? 'success' : 'error'}
          description={apiStatus === 'connected' ? 'Successfully connected to backend' : 'Connection failed'}
          icon={apiStatus === 'connected' ? 'checkmark-circle' : 'close-circle'}
        />

        {/* Authentication Status */}
        <StatusCard
          title="Authentication"
          status={isAuthenticated ? 'success' : 'warning'}
          description={isAuthenticated ? `Logged in as ${user?.email}` : 'Not authenticated'}
          icon={isAuthenticated ? 'person-circle' : 'person-circle-outline'}
        />

        {/* System Information */}
        {systemInfo && (
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>System Information</Text>
            <InfoRow label="Version" value={systemInfo.version || 'N/A'} />
            <InfoRow label="Environment" value={systemInfo.environment || 'N/A'} />
            <InfoRow label="Database Status" value={systemInfo.database?.status || 'N/A'} />
            <InfoRow label="Database Name" value={systemInfo.database?.name || 'N/A'} />
            <InfoRow label="Uptime" value={`${Math.round((systemInfo.uptime || 0) / 3600)} hours`} />
          </View>
        )}

        {/* User Data */}
        {isAuthenticated && user && (
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>User Information</Text>
            <InfoRow label="Name" value={`${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Role" value={user.role.toUpperCase()} />
            <InfoRow label="Member Since" value={new Date(user.createdAt).toLocaleDateString()} />
          </View>
        )}

        {/* Vehicle Data */}
        {vehicles.length > 0 && (
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Vehicles ({vehicles.length})</Text>
            {vehicles.map((vehicle, index) => (
              <View key={vehicle._id} style={styles.vehicleItem}>
                <Text style={[styles.vehicleName, { color: theme.colors.text }]}>
                  {vehicle.brand} {vehicle.vehicleModel}
                </Text>
                <Text style={[styles.vehicleDetails, { color: theme.colors.textSecondary }]}>
                  VIN: {vehicle.vin} • Status: {vehicle.status}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Integration Features */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Integrated Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text style={[styles.featureText, { color: theme.colors.text }]}>User Authentication</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text style={[styles.featureText, { color: theme.colors.text }]}>Vehicle Management</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text style={[styles.featureText, { color: theme.colors.text }]}>Battery Monitoring</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text style={[styles.featureText, { color: theme.colors.text }]}>System Information</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text style={[styles.featureText, { color: theme.colors.text }]}>Real-time Data Display</Text>
            </View>
          </View>
        </View>

        {/* Connection Test Button */}
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: theme.colors.primary }]}
          onPress={checkIntegrationStatus}
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.testButtonText}>Test Connection</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }),
  } as any,
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }),
  } as any,
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  vehicleItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IntegrationStatusScreen;
