import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createStyles } from '@/theme/styles';

interface BatteryChartProps {
  data: number[];
  labels: string[];
  title?: string;
  height?: number;
}

const BatteryChart: React.FC<BatteryChartProps> = ({
  data,
  labels,
  title = 'Battery Level',
  height = 220,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const screenWidth = Dimensions.get('window').width;

  // Mock data if none provided
  const chartData = data.length > 0 ? data : [65, 70, 68, 72, 75, 78, 76];
  const chartLabels = labels.length > 0 ? labels : ['6h', '5h', '4h', '3h', '2h', '1h', 'Now'];

  const maxValue = Math.max(...chartData);
  const minValue = Math.min(...chartData);

  return (
    <View style={[styles.card, chartStyles.container]}>
      {title && (
        <Text style={[styles.h3, chartStyles.title]}>
          {title}
        </Text>
      )}
      
      <View style={[chartStyles.chartContainer, { height }]}>
        <View style={chartStyles.chartArea}>
          {chartData.map((value, index) => {
            const barHeight = ((value - minValue) / (maxValue - minValue)) * (height - 60);
            return (
              <View key={index} style={chartStyles.barContainer}>
                <View style={chartStyles.barBackground}>
                  <View 
                    style={[
                      chartStyles.bar, 
                      { 
                        height: barHeight || 5,
                        backgroundColor: theme.colors.primary,
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.caption, chartStyles.barValue]}>
                  {value}%
                </Text>
                <Text style={[styles.caption, chartStyles.barLabel]}>
                  {chartLabels[index]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      
      <View style={chartStyles.legend}>
        <View style={chartStyles.legendItem}>
          <View style={[chartStyles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <Text style={[styles.caption, chartStyles.legendText]}>
            Battery Level (%)
          </Text>
        </View>
      </View>
    </View>
  );
};

const chartStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    marginVertical: 8,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingBottom: 40,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    minHeight: 20,
  },
  bar: {
    width: '80%',
    minHeight: 5,
    borderRadius: 3,
    alignSelf: 'center',
  },
  barValue: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  barLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
});

export default BatteryChart;
