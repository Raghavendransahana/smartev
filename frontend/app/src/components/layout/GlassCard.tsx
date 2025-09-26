import React, { ReactNode } from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, style, backgroundColor }) => {
  const { theme } = useTheme();
  
  const cardBackgroundColor = backgroundColor || theme.colors.surface;

  return (
    <View style={[styles(theme).card, { backgroundColor: cardBackgroundColor }, style]}>
      <View style={styles(theme).overlay}>{children}</View>
    </View>
  );
};

const styles = (theme: any) => StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000000', // Better shadow for white theme
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  overlay: {
    borderRadius: 15,
    padding: 20,
    backgroundColor: 'transparent',
  },
});

export default GlassCard;
