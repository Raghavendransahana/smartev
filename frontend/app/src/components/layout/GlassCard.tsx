import React, { ReactNode } from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { dashboardPalette, shadowStyles } from '@/theme/dashboardPalette';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  gradientColors?: [string, string];
}

const GlassCard: React.FC<GlassCardProps> = ({ children, style, gradientColors }) => {
  const colors = gradientColors ?? ['rgba(15,23,42,0.95)', 'rgba(2,6,23,0.9)'];

  return (
    <LinearGradient colors={colors} style={[styles.card, style]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.overlay}>{children}</View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: dashboardPalette.border,
    ...shadowStyles,
  },
  overlay: {
    borderRadius: 19,
    padding: 20,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
});

export default GlassCard;
