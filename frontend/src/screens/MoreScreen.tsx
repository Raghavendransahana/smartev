import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type MoreScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 cards per row with margins

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
    color: '#8B5CF6',
  },
  {
    title: 'Analytics',
    subtitle: 'Insights & reports',
    icon: 'analytics',
    screen: 'Analytics',
    color: '#06B6D4',
  },
  {
    title: 'Fleet Management',
    subtitle: 'Manage fleet alerts',
    icon: 'business',
    screen: 'FleetManagement',
    color: '#F59E0B',
  },
  {
    title: 'System Info',
    subtitle: 'API health & status',
    icon: 'information-circle',
    screen: 'SystemInfo',
    color: '#10B981',
  },
  {
    title: 'Blockchain Ledger',
    subtitle: 'Transaction ledger',
    icon: 'receipt',
    screen: 'Ledger',
    color: '#EF4444',
  },
  {
    title: 'Settings',
    subtitle: 'App preferences',
    icon: 'settings',
    screen: 'Settings',
    color: '#6B7280',
  },
];

const MoreScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<MoreScreenNavigationProp>();

  const renderFeatureCard = (feature: FeatureCard) => (
    <TouchableOpacity
      key={feature.screen}
      style={[
        styles.featureCard,
        { 
          backgroundColor: theme.colors.surface,
          width: cardWidth,
        },
      ]}
      onPress={() => navigation.navigate(feature.screen as keyof RootStackParamList)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
        <Ionicons name={feature.icon} size={28} color="white" />
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
        size={20} 
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
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            More Features
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Explore additional FlexiEVChain capabilities
          </Text>
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
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Advanced Features
          </Text>
          
          <View style={styles.featuresGrid}>
            {features.map(renderFeatureCard)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('VehicleManagement')}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.quickActionText}>Add New Vehicle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#10B981' }]}
            onPress={() => navigation.navigate('ChargingSessions')}
          >
            <Ionicons name="flash" size={24} color="white" />
            <Text style={styles.quickActionText}>Start Charging Session</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#F59E0B' }]}
            onPress={() => navigation.navigate('FleetManagement')}
          >
            <Ionicons name="warning" size={24} color="white" />
            <Text style={styles.quickActionText}>View Fleet Alerts</Text>
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
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
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
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
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
  },
  quickActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

export default MoreScreen;
