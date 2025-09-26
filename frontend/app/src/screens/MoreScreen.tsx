import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type MoreScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const isSmallScreen = width < 400;
const cardWidth = isSmallScreen ? width - 32 : (width - 48) / 2; // Single column on small screens

interface FeatureCard {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: string;
  color: string;
}

const features: FeatureCard[] = [
  {
    title: 'Blockchain Explorer',
    subtitle: 'View transactions',
    icon: 'link',
    screen: 'BlockchainExplorer',
    color: '#059669', // Teal Green
  },
  {
    title: 'Analytics',
    subtitle: 'Insights & reports',
    icon: 'analytics',
    screen: 'Analytics',
    color: '#10B981', // Emerald Green
  },
  {
    title: 'Fleet Management',
    subtitle: 'Manage fleet alerts',
    icon: 'business',
    screen: 'FleetManagement',
    color: '#16A34A', // Forest Green
  },
  {
    title: 'System Info',
    subtitle: 'API health & status',
    icon: 'information-circle',
    screen: 'SystemInfo',
    color: '#22C55E', // Bright Green
  },
  {
    title: 'Integration Status',
    subtitle: 'Backend connectivity',
    icon: 'link',
    screen: 'IntegrationStatus',
    color: '#059669', // Teal
  },
  {
    title: 'Blockchain Ledger',
    subtitle: 'Transaction ledger',
    icon: 'receipt',
    screen: 'Ledger',
    color: '#15803D', // Dark Forest Green
  },
  {
    title: 'Settings',
    subtitle: 'App preferences',
    icon: 'settings',
    screen: 'Settings',
    color: '#34D399', // Light Green
  },
];

const MoreScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, logout, isLoading } = useAuth();
  const navigation = useNavigation<MoreScreenNavigationProp>();
  const [loggingOut, setLoggingOut] = useState(false);

  // Test function to verify logout works (can be called from console)
  const testLogout = async () => {
    console.log('MoreScreen - Test logout called directly');
    try {
      setLoggingOut(true);
      console.log('MoreScreen - Test logout starting...');
      await logout();
      console.log('MoreScreen - Test logout successful');
      
      // Use same navigation logic as main logout
      await new Promise(resolve => setTimeout(resolve, 200));
      try {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
        console.log('MoreScreen - Test logout navigation completed');
      } catch (navError) {
        console.log('MoreScreen - Test logout navigation failed, relying on AppNavigator:', navError);
      }
    } catch (error) {
      console.error('MoreScreen - Test logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  // Make testLogout available globally for debugging
  (global as any).testLogout = testLogout;

  const renderFeatureCard = (feature: FeatureCard) => (
    <TouchableOpacity
      key={feature.screen}
      style={[
        styles.featureCard,
        { 
          backgroundColor: theme.colors.surface,
        },
      ]}
      onPress={() => navigation.navigate(feature.screen as keyof RootStackParamList)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
        <Ionicons name={feature.icon} size={isSmallScreen ? 24 : 28} color="white" />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          {feature.title}
        </Text>
        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
          {feature.subtitle}
        </Text>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={isSmallScreen ? 16 : 20} 
        color={theme.colors.textSecondary} 
        style={styles.chevron}
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.profileIcon, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="person" size={isSmallScreen ? 28 : 32} color="white" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.text, fontSize: isSmallScreen ? 16 : 18 }]}>
                {user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'Loading...'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.textSecondary, fontSize: isSmallScreen ? 13 : 14 }]} numberOfLines={1} ellipsizeMode="tail">
                {user?.email || ''}
              </Text>
              <Text style={[styles.profileRole, { color: theme.colors.primary, fontSize: isSmallScreen ? 11 : 12 }]}>
                {user?.role?.toUpperCase() || ''}
              </Text>
            </View>
          </View>
          
          {/* Direct Logout Button */}
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: '#ef4444', paddingVertical: isSmallScreen ? 10 : 12 }]}
            onPress={testLogout}
            disabled={loggingOut}
            activeOpacity={0.7}
            testID="logout-button"
          >
            {loggingOut ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={18} color="white" />
                <Text style={[styles.logoutText, { fontSize: isSmallScreen ? 14 : 16 }]}>Logout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statItem}>
            <Ionicons name="car-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Vehicles
            </Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Ionicons name="flash-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>47</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Sessions
            </Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Ionicons name="cube-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>234</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Transactions
            </Text>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: isSmallScreen ? 16 : 20 }]}>
            Advanced Features
          </Text>
          
          <View style={styles.featuresGrid}>
            {features.map(renderFeatureCard)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: isSmallScreen ? 18 : 20 }]}>
            Quick Actions
          </Text>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.primary, paddingVertical: isSmallScreen ? 14 : 16 }]}
            onPress={() => navigation.navigate('VehicleManagement')}
          >
            <Ionicons name="add-circle" size={isSmallScreen ? 20 : 24} color="white" />
            <Text style={[styles.quickActionText, { fontSize: isSmallScreen ? 14 : 16 }]}>Add New Vehicle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#10B981', paddingVertical: isSmallScreen ? 14 : 16 }]}
            onPress={() => navigation.navigate('ChargingSessions')}
          >
            <Ionicons name="flash" size={isSmallScreen ? 20 : 24} color="white" />
            <Text style={[styles.quickActionText, { fontSize: isSmallScreen ? 14 : 16 }]}>View Charging Sessions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#F59E0B', paddingVertical: isSmallScreen ? 14 : 16 }]}
            onPress={() => navigation.navigate('FleetManagement')}
          >
            <Ionicons name="warning" size={isSmallScreen ? 20 : 24} color="white" />
            <Text style={[styles.quickActionText, { fontSize: isSmallScreen ? 14 : 16 }]}>View Fleet Alerts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: width < 400 ? 16 : 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }),
  } as any,
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  featuresContainer: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 16 : 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'column',
    gap: isSmallScreen ? 8 : 12,
  },
  featureCard: {
    borderRadius: isSmallScreen ? 10 : 12,
    padding: isSmallScreen ? 12 : 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: isSmallScreen ? 8 : 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: isSmallScreen ? 60 : 80,
    width: '100%',
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }),
  } as any,
  iconContainer: {
    width: isSmallScreen ? 36 : 48,
    height: isSmallScreen ? 36 : 48,
    borderRadius: isSmallScreen ? 18 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallScreen ? 12 : 16,
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    paddingRight: isSmallScreen ? 8 : 12,
  },
  cardTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
    marginBottom: isSmallScreen ? 2 : 4,
    lineHeight: isSmallScreen ? 18 : 20,
  },
  cardSubtitle: {
    fontSize: isSmallScreen ? 11 : 14,
    lineHeight: isSmallScreen ? 14 : 18,
    opacity: 0.8,
  },
  chevron: {
    marginLeft: 8,
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }),
  } as any,
  quickActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: width < 400 ? 16 : 20,
    marginBottom: 24,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }),
  } as any,
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileIcon: {
    width: width < 400 ? 50 : 60,
    height: width < 400 ? 50 : 60,
    borderRadius: width < 400 ? 25 : 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width < 400 ? 12 : 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MoreScreen;
