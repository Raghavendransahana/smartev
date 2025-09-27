import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { flexiEVAPI, SystemInfo } from '../api/flexiEVApi';

const SystemInfoScreen: React.FC = () => {
  const { theme } = useTheme();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const totalVehicles=22
  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      const [health, info] = await Promise.all([
        flexiEVAPI.checkHealth(),
        flexiEVAPI.getSystemInfo(),
      ]);
      setHealthStatus(health);
      setSystemInfo(info);
    } catch (error) {
      Alert.alert('Error', 'Failed to load system information');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSystemData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'ok':
      case 'healthy':
        return '#22c55e';
      case 'maintenance':
      case 'warning':
        return '#f59e0b';
      case 'offline':
      case 'error':
        return '#ef4444';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'ok':
      case 'healthy':
        return '✅';
      case 'maintenance':
      case 'warning':
        return '⚠️';
      case 'offline':
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const HealthCard = () => {
    if (!healthStatus) return null;

    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          API Health Status
        </Text>
        <View style={styles.healthContainer}>
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>
              {getStatusIcon(healthStatus.status)}
            </Text>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(healthStatus.status) }
            ]}>
              {healthStatus.status.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
            Last Check: {new Date(healthStatus.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  const SystemInfoCard = () => {
    if (!systemInfo) return null;

    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          System Information
        </Text>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Version
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {systemInfo.version}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Total Vehicles
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.primary }]}>
              {systemInfo.totalVehicles.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Total Transactions
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.primary }]}>
              {systemInfo.totalTransactions.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Blockchain Status
            </Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusIcon}>
                {getStatusIcon(systemInfo.blockchainStatus)}
              </Text>
              <Text style={[
                styles.infoValue,
                { color: getStatusColor(systemInfo.blockchainStatus) }
              ]}>
                {systemInfo.blockchainStatus.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const SupportedBrandsCard = () => {
    if (!systemInfo?.supportedBrands) return null;

    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Supported EV Brands ({systemInfo.supportedBrands.length})
        </Text>
        <View style={styles.brandsGrid}>
          {systemInfo.supportedBrands.map((brand, index) => (
            <View 
              key={index} 
              style={[styles.brandChip, { backgroundColor: theme.colors.background }]}
            >
              <Text style={[styles.brandText, { color: theme.colors.text }]}>
                {brand}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const SystemStatsCard = () => {
    if (!systemInfo) return null;

    const uptimePercentage = 99.5; // Mock uptime
    const avgResponseTime = 45; // Mock response time in ms
    const dailyTransactions = 1247; // Mock daily transactions

    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          System Performance
        </Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#22c55e' }]}>
              {uptimePercentage}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Uptime
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {avgResponseTime}ms
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Avg Response
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>
              {dailyTransactions}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Daily Txns
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          System Information
        </Text>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleRefresh}
        >
          <Text style={styles.buttonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading system information...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <HealthCard />
          <SystemInfoCard />
          <SupportedBrandsCard />
          <SystemStatsCard />
        </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
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
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }),
  } as any,
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  healthContainer: {
    alignItems: 'center',
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    fontSize: 24,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 14,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  brandChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  brandText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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

export default SystemInfoScreen;
