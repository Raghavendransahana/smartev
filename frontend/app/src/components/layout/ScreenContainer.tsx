import React, { ReactNode } from 'react';
import { StyleSheet, View, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dashboardPalette } from '@/theme/dashboardPalette';

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
}) => {
  if (scrollable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.gradient}>
          <ScrollView
            style={[styles.container, style]}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.gradient}>
        <View style={[styles.container, style]}>{children}</View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: dashboardPalette.background,
  },
  gradient: {
    flex: 1,
    backgroundColor: dashboardPalette.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  scrollContent: {
    paddingBottom: 48,
  },
});

export default ScreenContainer;
