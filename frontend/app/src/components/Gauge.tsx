import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { createStyles } from '@/theme/styles';

interface GaugeProps {
  value: number;
  maxValue: number;
  title: string;
  unit?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const Gauge: React.FC<GaugeProps> = ({
  value,
  maxValue,
  title,
  unit = '',
  size = 200,
  strokeWidth = 20,
  color,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / maxValue) * circumference;
  
  const gaugeColor = color || theme.colors.primary;
  const backgroundPath = `M ${size/2 - radius} ${size/2} a ${radius} ${radius} 0 0 1 ${radius * 2} 0`;
  const foregroundPath = `M ${size/2 - radius} ${size/2} a ${radius} ${radius} 0 0 1 ${radius * 2} 0`;

  return (
    <View style={[gaugeStyles.container, { width: size, height: size / 2 + 40 }]}>
      <Svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <Path
          d={backgroundPath}
          stroke={theme.colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Foreground arc */}
        <Path
          d={foregroundPath}
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      
      <View style={gaugeStyles.textContainer}>
        <Text style={[styles.h2, gaugeStyles.value, { color: gaugeColor }]}>
          {Math.round(value)}{unit}
        </Text>
        <Text style={[styles.caption, gaugeStyles.title]}>
          {title}
        </Text>
      </View>
    </View>
  );
};

const gaugeStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  value: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default Gauge;
