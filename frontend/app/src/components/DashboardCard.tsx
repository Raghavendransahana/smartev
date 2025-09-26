import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createStyles } from '@/theme/styles';

interface DashboardCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  style,
  titleStyle,
  valueStyle,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.card, cardStyles.container, style]}>
      <View style={cardStyles.header}>
        {icon && <View style={cardStyles.icon}>{icon}</View>}
        <Text style={[styles.body, cardStyles.title, titleStyle]}>
          {title}
        </Text>
      </View>
      
      <View style={cardStyles.content}>
        <View style={cardStyles.valueContainer}>
          <Text style={[styles.h2, cardStyles.value, valueStyle]}>
            {value}
          </Text>
          {unit && (
            <Text style={[styles.caption, cardStyles.unit]}>
              {unit}
            </Text>
          )}
        </View>
        
        {subtitle && (
          <Text style={[styles.caption, cardStyles.subtitle]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    minHeight: 120,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  value: {
    fontWeight: 'bold',
  },
  unit: {
    marginLeft: 4,
    opacity: 0.7,
  },
  subtitle: {
    opacity: 0.6,
  },
});

export default DashboardCard;
