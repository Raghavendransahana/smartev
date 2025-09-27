import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface CarDetails {
  manufacturer: string;
  city: string;
  address: string;
  batteryOwnerStatus: string;
  stateOfCharge: number;
  stateOfHealth: number;
  serviceStatus: 'up-to-date' | 'pending';
  cyclesCompleted: number;
  warrantyStatus: 'active' | 'expired';
}

const BatteryDashboard: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(90);
  const [stateOfCharge, setStateOfCharge] = useState(90);
  const [stateOfHealth, setStateOfHealth] = useState(94);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const batteryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Battery level animation
    Animated.timing(batteryAnim, {
      toValue: batteryLevel / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [batteryLevel]);

  // Generate random values for SOC and SOH (73-97%)
  const generateRandomBatteryValue = () => Math.floor(Math.random() * (97 - 73 + 1)) + 73;

  // Update SOC and SOH every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newSOC = generateRandomBatteryValue();
      const newSOH = generateRandomBatteryValue();
      
      setStateOfCharge(newSOC);
      setStateOfHealth(newSOH);
      setBatteryLevel(newSOC); // Update battery level for animation
    }, 2000);

    return () => clearInterval(interval);
  }, []);
  
  // Mock data
  const vehicleData = {
    carName: "Tata Punch EV",
    vehicleId: "TN43-EV-2024-7892",
    batteryPercentage: stateOfCharge, // Use dynamic SOC value
    kmsDriven: 4330,
    weeklyKms: 340,
    isCharging: false,
  };

  const carDetails: CarDetails = {
    manufacturer: "Tata Motors",
    city: "Coimbatore",
    address: "KPR Institute of Engineering, Arasur",
    batteryOwnerStatus: "Owned",
    stateOfCharge: stateOfCharge, // Use dynamic SOC
    stateOfHealth: stateOfHealth, // Use dynamic SOH
    serviceStatus: "up-to-date",
    cyclesCompleted: 847,
    warrantyStatus: "active",
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setRefreshing(false);
  };

  const BatteryIndicator: React.FC<{ percentage: number; isCharging: boolean }> = ({ 
    percentage, 
    isCharging 
  }) => (
    <View style={styles.batteryContainer}>
      <View style={styles.batteryBody}>
        <Animated.View 
          style={[
            styles.batteryFill,
            {
              width: batteryAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: percentage > 50 ? '#22C55E' : percentage > 20 ? '#F59E0B' : '#EF4444',
            }
          ]} 
        />
      </View>
      <View style={styles.batteryTip} />
      {isCharging && (
        <View style={styles.chargingIcon}>
          <MaterialIcons name="bolt" size={16} color="#22C55E" />
        </View>
      )}
    </View>
  );

  const StatCard: React.FC<{ 
    title: string;
    value: string;
    subtitle?: string;
    icon: string;
    delay?: number;
  }> = ({ title, value, subtitle, icon, delay = 0 }) => {
    const cardScale = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
      Animated.spring(cardScale, {
        toValue: 1,
        delay: delay * 100,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View style={[styles.statCard, { transform: [{ scale: cardScale }] }]}>
        <View style={styles.statHeader}>
          <MaterialIcons name={icon as any} size={24} color="#3B82F6" />
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </Animated.View>
    );
  };

  const DetailRow: React.FC<{ label: string; value: string; status?: 'good' | 'warning' | 'error' }> = ({ 
    label, 
    value, 
    status 
  }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[
        styles.detailValue, 
        status === 'good' && styles.statusGood,
        status === 'warning' && styles.statusWarning,
        status === 'error' && styles.statusError,
      ]}>
        {value}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.6}>
              <Ionicons name="arrow-back" size={22} color="#1F2937" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Battery Manager</Text>
            </View>
            <TouchableOpacity style={styles.menuButton} activeOpacity={0.6}>
              <Ionicons name="notifications-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Vehicle Info Card */}
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <View style={styles.vehicleInfo}>
                <Text style={styles.carName}>{vehicleData.carName}</Text>
                <Text style={styles.vehicleId}>ID: {vehicleData.vehicleId}</Text>
              </View>
              <View style={styles.carImageContainer}>
                <View style={styles.carImagePlaceholder}>
                  <MaterialIcons name="directions-car" size={48} color="#3B82F6" />
                </View>
              </View>
            </View>
          </View>

          {/* Battery & Driving Stats */}
          <View style={styles.statsSection}>
            <View style={styles.batteryCard}>
              <View style={styles.batteryHeader}>
                <View style={styles.batteryInfo}>
                  <Text style={styles.batteryTitle}>Battery Level</Text>
                  <Text style={styles.batteryPercentage}>{vehicleData.batteryPercentage}%</Text>
                  {vehicleData.isCharging && (
                    <View style={styles.chargingStatus}>
                      <View style={styles.chargingDot} />
                      <Text style={styles.chargingText}>Charging</Text>
                    </View>
                  )}
                </View>
                <BatteryIndicator 
                  percentage={vehicleData.batteryPercentage} 
                  isCharging={vehicleData.isCharging} 
                />
              </View>
            </View>

            <StatCard
              title="Distance Traveled"
              value={`${vehicleData.kmsDriven.toLocaleString()} km`}
              subtitle={`${vehicleData.weeklyKms} km last week`}
              icon="route"
              delay={1}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.7}>
              <MaterialIcons name="location-on" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Navigate to Station</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
              <MaterialIcons name="analytics" size={20} color="#3B82F6" />
              <Text style={styles.secondaryButtonText}>View Analytics</Text>
            </TouchableOpacity>
          </View>

          {/* Car Details Panel */}
          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <MaterialIcons name="info" size={24} color="#3B82F6" />
              <Text style={styles.detailsTitle}>Vehicle Details</Text>
            </View>

            <View style={styles.detailsContent}>
              <DetailRow label="Manufacturer" value={carDetails.manufacturer} />
              <DetailRow label="Location" value={`${carDetails.city}, ${carDetails.address}`} />
              <DetailRow label="Battery Owner" value={carDetails.batteryOwnerStatus} />
              <DetailRow 
                label="State of Charge" 
                value={`${carDetails.stateOfCharge}%`} 
                status="good" 
              />
              <DetailRow 
                label="State of Health" 
                value={`${carDetails.stateOfHealth}%`} 
                status={carDetails.stateOfHealth > 90 ? "good" : "warning"} 
              />
              <DetailRow 
                label="Service Status" 
                value={carDetails.serviceStatus === 'up-to-date' ? 'Up to Date' : 'Pending'} 
                status={carDetails.serviceStatus === 'up-to-date' ? "good" : "warning"} 
              />
              <DetailRow 
                label="Cycles Completed" 
                value={carDetails.cyclesCompleted.toLocaleString()} 
              />
              <DetailRow 
                label="Warranty" 
                value={carDetails.warrantyStatus === 'active' ? 'Active' : 'Expired'} 
                status={carDetails.warrantyStatus === 'active' ? "good" : "error"} 
              />
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: -0.2,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleCard: {
    backgroundColor: '#FAFBFC',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  vehicleId: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  carImageContainer: {
    marginLeft: 16,
  },
  carImagePlaceholder: {
    width: 80,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    marginBottom: 24,
  },
  batteryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  batteryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  batteryInfo: {
    flex: 1,
  },
  batteryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  batteryPercentage: {
    fontSize: 32,
    fontWeight: '800',
    color: '#22C55E',
    marginBottom: 8,
  },
  chargingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chargingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  chargingText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  batteryBody: {
    width: 60,
    height: 28,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 2,
  },
  batteryTip: {
    width: 4,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginLeft: 2,
  },
  chargingIcon: {
    position: 'absolute',
    left: 26,
    top: 6,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionButtons: {
    marginBottom: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 3px rgba(59, 130, 246, 0.3)',
    } : {
      shadowColor: '#3B82F6',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 3,
    }),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  detailsContent: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  statusGood: {
    color: '#22C55E',
  },
  statusWarning: {
    color: '#F59E0B',
  },
  statusError: {
    color: '#EF4444',
  },
});

// Ensure proper export for React Navigation
const BatteryDashboardComponent = BatteryDashboard;
export { BatteryDashboardComponent };
export default BatteryDashboard;