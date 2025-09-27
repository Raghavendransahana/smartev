import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

/**
 * EVChargingScreen Component - React Native + TypeScript
 * 
 * A clean, light-themed EV charging status display screen that shows:
 * - Charging station information and notification settings
 * - Real-time battery percentage with animated circular progress
 * - Energy consumption tracking
 * - Charging session timing information
 * - Visual charging illustration with animated elements
 * 
 * Design follows modern mobile UI patterns with subtle shadows,
 * rounded corners, and a teal-to-green color scheme.
 * 
 * Built for React Native with TypeScript for type safety and performance.
 */

interface ChargingData {
  batteryPercentage: number;
  energyConsumed: number;
  startTime: string;
  endTime: string;
  stationName: string;
  location: string;
}

const { width } = Dimensions.get('window');

const EVChargingScreen: React.FC = () => {
  // Configuration data - typically would come from props or state management
  const chargingData: ChargingData = {
    batteryPercentage: 90, // Current battery charge level (0-100)
    energyConsumed: 34.45, // Total energy consumed in kWh
    startTime: "7:35 am", // When charging session began
    endTime: "7:50 am", // Estimated completion time
    stationName: "SRM Charging Station", // Charging station identifier
    location: "Coimbatore, Tamil Nadu", // Station location
  };

  // Circular progress ring calculations
  // Using SVG circle with stroke-dasharray for smooth animation
  const radius = 70; // Progress ring radius in pixels
  const circumference = 2 * Math.PI * radius; // Full circle circumference
  const strokeDasharray = circumference; // Total dash length
  const strokeDashoffset = circumference - (chargingData.batteryPercentage / 100) * circumference; // Progress offset

  /**
   * CircularProgress Component
   * Custom SVG-based circular progress indicator with gradient
   */
  const CircularProgress: React.FC<{ percentage: number }> = ({ percentage }) => (
    <View style={styles.progressContainer}>
      <Svg width={160} height={160} style={styles.progressSvg}>
        <Defs>
          {/* Linear gradient definition for progress ring */}
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#14B8A6" stopOpacity="1" />
            <Stop offset="100%" stopColor="#10B981" stopOpacity="1" /> 
          </LinearGradient>
        </Defs>
        
        <G rotation="-90" origin="80, 80">
          {/* Background circle (inactive state) */}
          <Circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#E5E7EB" /* Light gray background */
            strokeWidth="8"
            fill="none"
          />
          
          {/* Animated progress circle (active charging state) */}
          <Circle
            cx="80"
            cy="80"
            r={radius}
            stroke="url(#gradient)" /* References gradient definition above */
            strokeWidth="8"
            fill="none"
            strokeLinecap="round" /* Rounded ends for modern look */
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
          />
        </G>
      </Svg>
      
      {/* Center content overlay - battery info and charging indicator */}
      <View style={styles.progressCenter}>
        {/* Charging bolt icon */}
        <Ionicons name="flash" size={24} color="#14B8A6" style={styles.chargingIcon} />
        
        {/* Main battery percentage display */}
        <Text style={styles.percentageText}>{percentage}%</Text>
        
        {/* Energy consumed indicator */}
        <Text style={styles.energyText}>{chargingData.energyConsumed} kWh</Text>
      </View>
    </View>
  );

  /**
   * TimeCard Component
   * Reusable card component for displaying time information
   */
  const TimeCard: React.FC<{ label: string; time: string }> = ({ label, time }) => (
    <View style={styles.timeCard}>
      <Text style={styles.timeLabel}>{label}</Text>
      <Text style={styles.timeValue}>{time}</Text>
    </View>
  );

  /**
   * ChargingIllustration Component
   * Visual representation of EV connected to charging station
   */
  const ChargingIllustration: React.FC = () => (
    <View style={styles.illustrationContainer}>
      <View style={styles.illustrationContent}>
        {/* Electric Vehicle icon */}
        <View style={styles.carContainer}>
          <Ionicons name="car-sport" size={40} color="#14B8A6" />
        </View>
        
        {/* Animated charging cable connection */}
        <View style={styles.cableContainer}>
          <View style={styles.cable} />
          {/* Animated charging indicator dot */}
          <View style={styles.chargingDot} />
        </View>
        
        {/* Charging Station representation */}
        <View style={styles.stationContainer}>
          {/* Station display/indicator */}
          <View style={styles.stationDisplay} />
          {/* Station button/controls */}
          <View style={styles.stationButton1} />
          <View style={styles.stationButton2} />
        </View>
      </View>
      
      {/* Status text */}
      <Text style={styles.statusText}>Charging in progress...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 
          Header Section
          Contains station information, notification toggle, and user-friendly message
          Layout: Station info on left, controls on right
        */}
        <View style={styles.header}>
          {/* Station info and controls row */}
          <View style={styles.headerRow}>
            {/* Left side: Station identification */}
            <View style={styles.stationInfo}>
              <Text style={styles.stationName}>{chargingData.stationName}</Text>
              <Text style={styles.location}>{chargingData.location}</Text>
            </View>
            
            {/* Right side: Notification bell and toggle switch */}
            <View style={styles.headerControls}>
              {/* Notification bell icon */}
              <TouchableOpacity>
                <Ionicons name="notifications-outline" size={24} color="#9CA3AF" />
              </TouchableOpacity>
              
              {/* Custom toggle switch (ON state shown) */}
              <TouchableOpacity style={styles.toggle}>
                <View style={styles.toggleKnob} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Notification message card */}
          <View style={styles.notificationCard}>
            <Text style={styles.notificationText}>
              Don't worry, we will notify you once charged ;)
            </Text>
          </View>
        </View>

        {/* 
          Battery Status Section
          Large circular progress indicator with battery percentage, charging icon, and energy data
          Uses SVG for smooth animations and gradient coloring
        */}
        <View style={styles.batterySection}>
          <CircularProgress percentage={chargingData.batteryPercentage} />
        </View>

        {/* 
          Time Information Section
          Two-column layout showing charging session start and estimated completion times
          Uses card design with subtle shadows for visual hierarchy
        */}
        <View style={styles.timeSection}>
          <TimeCard label="Time Started" time={chargingData.startTime} />
          <TimeCard label="Estimated End Time" time={chargingData.endTime} />
        </View>

        {/* 
          Bottom Illustration Section
          Visual representation of charging process with EV, cable, and station
          Includes animated elements to show active charging state
        */}
        <ChargingIllustration />
      </View>
    </SafeAreaView>
  );
};

/**
 * StyleSheet - React Native styling with TypeScript support
 * Follows the design system with consistent spacing, colors, and typography
 */
const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Soft off-white background
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  // Header section styles
  header: {
    marginBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827', // Dark gray for primary text
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B7280', // Muted gray for secondary text
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Toggle switch styles
  toggle: {
    width: 48,
    height: 24,
    backgroundColor: '#14B8A6', // Teal background for ON state
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Notification card styles
  notificationCard: {
    backgroundColor: '#F0FDFA', // Light teal background
    borderColor: '#B2F5EA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  notificationText: {
    fontSize: 14,
    color: '#0F766E', // Dark teal text
  },

  // Battery section styles
  batterySection: {
    alignItems: 'center',
    marginBottom: 32,
  },

  // Circular progress styles
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSvg: {
    transform: [{ rotate: '-90deg' }],
  },
  progressCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chargingIcon: {
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
  },
  energyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  // Time section styles
  timeSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  timeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderColor: '#F3F4F6',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },

  // Charging illustration styles
  illustrationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderColor: '#F3F4F6',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
    width: width * 0.8,
    maxWidth: 320,
  },
  illustrationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  carContainer: {
    alignItems: 'center',
  },
  cableContainer: {
    flex: 1,
    height: 4,
    marginHorizontal: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cable: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#14B8A6', // Teal cable color
  },
  chargingDot: {
    position: 'absolute',
    right: -4,
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981', // Green charging indicator
  },
  stationContainer: {
    width: 24,
    height: 40,
    backgroundColor: '#D1D5DB', // Light gray station
    borderRadius: 4,
    position: 'relative',
  },
  stationDisplay: {
    width: 18,
    height: 6,
    backgroundColor: '#14B8A6', // Teal display
    borderRadius: 2,
    position: 'absolute',
    top: 6,
    left: 3,
  },
  stationButton1: {
    width: 12,
    height: 3,
    backgroundColor: '#9CA3AF', // Gray buttons
    borderRadius: 1,
    position: 'absolute',
    top: 16,
    left: 6,
  },
  stationButton2: {
    width: 12,
    height: 3,
    backgroundColor: '#9CA3AF',
    borderRadius: 1,
    position: 'absolute',
    top: 22,
    left: 6,
  },
  statusText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
  },
});

export default EVChargingScreen;