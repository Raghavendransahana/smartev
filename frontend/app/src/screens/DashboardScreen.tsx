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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ChargingSession {
  id: string;
  stationName: string;
  location: string;
  date: string;
  duration: string;
  energyAdded: number;
  cost: number;
}

const DashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [isChargingMode, setIsChargingMode] = useState(true);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    // Subtle entrance animation
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Clean mock data
  const totalEnergyThisWeek = 130.48;
  const totalCostThisWeek = 1248.5;
  const averageEfficiency = 4.2;
  const co2Saved = 65.2;
  
  const weeklyEnergyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [8, 12, 15, 18, 22, 28, 35],
    }]
  };

  const monthlyEnergyData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      data: [85, 120, 95, 130],
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    }]
  };
  
  const chargingHistory: ChargingSession[] = [
    {
      id: '1',
      stationName: 'KPR College Fast Charger',
      location: 'Coimbatore, Tamil Nadu',
      date: 'Today',
      duration: '45 min',
      energyAdded: 35.2,
      cost: 318.5
    },
    {
      id: '2',
      stationName: 'KPR College Fast Charger', 
      location: 'Coimbatore, Tamil Nadu',
      date: '2 days ago',
      duration: '52 min',
      energyAdded: 42.8,
      cost: 387.2
    },
    {
      id: '3',
      stationName: 'KPR College Fast Charger',
      location: 'Coimbatore, Tamil Nadu',
      date: '4 days ago',
      duration: '38 min',
      energyAdded: 28.5,
      cost: 257.8
    },
    {
      id: '4',
      stationName: 'KPR College Fast Charger',
      location: 'Coimbatore, Tamil Nadu',
      date: '1 week ago',
      duration: '41 min',
      energyAdded: 31.7,
      cost: 286.9
    }
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setRefreshing(false);
  };

  const StatCard: React.FC<{ 
    icon: string; 
    value: string; 
    label: string; 
    delay?: number;
  }> = ({ icon, value, label, delay = 0 }) => {
    const cardScale = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
      Animated.spring(cardScale, {
        toValue: 1,
        delay: delay * 80,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View style={[styles.statCard, { transform: [{ scale: cardScale }] }]}>
        <View style={styles.statContent}>
          <View style={styles.statIcon}>
            <MaterialIcons name={icon as any} size={22} color="#3B82F6" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
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
          {/* Clean Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.6}>
              <Ionicons name="arrow-back" size={22} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <TouchableOpacity style={styles.menuButton} activeOpacity={0.6}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Minimal Charging Status */}
          {isChargingMode && (
            <View style={styles.chargingStatus}>
              <View style={styles.chargingIndicator} />
              <Text style={styles.chargingText}>Currently charging</Text>
            </View>
          )}

          {/* Clean Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="flash-on"
              value={`${totalEnergyThisWeek} kWh`}
              label="This week"
              delay={0}
            />
            <StatCard
              icon="account-balance-wallet"
              value={`₹${totalCostThisWeek}`}
              label="Total cost"
              delay={1}
            />
            <StatCard
              icon="eco"
              value={`${co2Saved} kg`}
              label="CO₂ saved"
              delay={2}
            />
            <StatCard
              icon="speed"
              value={`${averageEfficiency} km/kWh`}
              label="Efficiency"
              delay={3}
            />
          </View>

          {/* Minimal Chart Card */}
          <Animated.View style={[styles.chartCard, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Energy Usage</Text>
              
              <View style={styles.viewToggle}>
                <TouchableOpacity 
                  style={[styles.viewButton, viewMode === 'weekly' && styles.viewButtonActive]}
                  onPress={() => setViewMode('weekly')}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.viewButtonText, viewMode === 'weekly' && styles.viewButtonTextActive]}>
                    Week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.viewButton, viewMode === 'monthly' && styles.viewButtonActive]}
                  onPress={() => setViewMode('monthly')}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.viewButtonText, viewMode === 'monthly' && styles.viewButtonTextActive]}>
                    Month
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {viewMode === 'weekly' ? (
              <BarChart
                data={weeklyEnergyData}
                width={width - 64}
                height={200}
                yAxisLabel=""
                yAxisSuffix=" kWh"
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                  style: { borderRadius: 0 },
                  propsForLabels: { fontSize: 12 },
                  propsForBackgroundLines: {
                    stroke: '#F3F4F6',
                    strokeWidth: 1,
                  },
                }}
                style={styles.chart}
                fromZero
                showValuesOnTopOfBars={false}
              />
            ) : (
              <LineChart
                data={monthlyEnergyData}
                width={width - 64}
                height={200}
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                  style: { borderRadius: 0 },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: '#3B82F6'
                  }
                }}
                bezier
                style={styles.chart}
              />
            )}
          </Animated.View>

          {/* Clean History List */}
          <Animated.View style={[styles.historyCard, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Recent Sessions</Text>
              <TouchableOpacity activeOpacity={0.6}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            
            {chargingHistory.map((session, index) => (
              <TouchableOpacity 
                key={session.id} 
                style={[
                  styles.sessionItem,
                  index === chargingHistory.length - 1 && styles.lastSessionItem
                ]} 
                activeOpacity={0.6}
              >
                <View style={styles.sessionIcon}>
                  <MaterialIcons name="ev-station" size={20} color="#3B82F6" />
                </View>
                
                <View style={styles.sessionContent}>
                  <View style={styles.sessionRow}>
                    <Text style={styles.sessionStation}>{session.stationName}</Text>
                    <Text style={styles.sessionCost}>₹{session.cost}</Text>
                  </View>
                  
                  <View style={styles.sessionRow}>
                    <Text style={styles.sessionDate}>{session.date}</Text>
                    <Text style={styles.sessionEnergy}>{session.energyAdded} kWh</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
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
  chargingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  chargingIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  chargingText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '500',
  },
  statsGrid: {
    marginBottom: 32,
  },
  statCard: {
    width: '100%',
    marginBottom: 16,
  },
  statContent: {
    backgroundColor: '#FAFBFC',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    minHeight: 100,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 3,
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 7,
    minWidth: 60,
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    }),
  },
  viewButtonText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  viewButtonTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  chart: {
    marginVertical: 12,
    borderRadius: 0,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewAllText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastSessionItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  sessionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sessionContent: {
    flex: 1,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionStation: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  sessionCost: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  sessionDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  sessionEnergy: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
});

// Ensure proper export for React Navigation
const DashboardScreenComponent = DashboardScreen;
export { DashboardScreenComponent };
export default DashboardScreen;