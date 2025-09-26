import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeName } from '@/theme/themes';
import { createStyles } from '@/theme/styles';

const SettingsScreen: React.FC = () => {
  const { theme, themeName, changeTheme } = useTheme();
  const styles = createStyles(theme);

  const handleThemeChange = async (newTheme: ThemeName) => {
    try {
      await changeTheme(newTheme);
      Alert.alert('Success', `Theme changed to ${newTheme === 'brandA' ? 'Brand A' : 'Brand B'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to change theme');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Data',
      'Are you sure you want to reset all app data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            // Implement data reset logic
            Alert.alert('Success', 'App data has been reset');
          }
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Data export functionality will be implemented here');
  };

  const handleAbout = () => {
    Alert.alert(
      'About SmartEV Dashboard',
      'Version 1.0.0\n\nA hackathon project for EV dashboard and blockchain integration.\n\nDeveloped with React Native + Expo',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={screenStyles.container} showsVerticalScrollIndicator={false}>
        
        {/* Brand Theme Selector */}
        <View style={[styles.card, screenStyles.section]}>
          <Text style={[styles.h3, screenStyles.sectionTitle]}>
            Brand Theme
          </Text>
          <Text style={[styles.caption, screenStyles.sectionDescription]}>
            Choose your preferred brand theme
          </Text>
          
          <View style={screenStyles.pickerContainer}>
            <Picker
              selectedValue={themeName}
              onValueChange={(value) => handleThemeChange(value as ThemeName)}
              style={[screenStyles.picker, { color: theme.colors.text }]}
              dropdownIconColor={theme.colors.text}
            >
              <Picker.Item label="Emerald Green Theme" value="brandA" />
              <Picker.Item label="Deep Forest Green Theme" value="brandB" />
            </Picker>
          </View>
        </View>

        {/* App Settings */}
        <View style={[styles.card, screenStyles.section]}>
          <Text style={[styles.h3, screenStyles.sectionTitle]}>
            App Settings
          </Text>
          
          <TouchableOpacity 
            style={screenStyles.settingItem}
            onPress={() => Alert.alert('Notifications', 'Notification settings coming soon')}
          >
            <View style={screenStyles.settingContent}>
              <Text style={screenStyles.settingIcon}>🔔</Text>
              <View style={screenStyles.settingText}>
                <Text style={[styles.body, screenStyles.settingTitle]}>
                  Notifications
                </Text>
                <Text style={[styles.caption, screenStyles.settingSubtitle]}>
                  Manage push notifications
                </Text>
              </View>
            </View>
            <Text style={[styles.caption, screenStyles.settingArrow]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={screenStyles.settingItem}
            onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon')}
          >
            <View style={screenStyles.settingContent}>
              <Text style={screenStyles.settingIcon}>🔒</Text>
              <View style={screenStyles.settingText}>
                <Text style={[styles.body, screenStyles.settingTitle]}>
                  Privacy & Security
                </Text>
                <Text style={[styles.caption, screenStyles.settingSubtitle]}>
                  Data privacy settings
                </Text>
              </View>
            </View>
            <Text style={[styles.caption, screenStyles.settingArrow]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={screenStyles.settingItem}
            onPress={() => Alert.alert('Sync', 'Sync settings coming soon')}
          >
            <View style={screenStyles.settingContent}>
              <Text style={screenStyles.settingIcon}>🔄</Text>
              <View style={screenStyles.settingText}>
                <Text style={[styles.body, screenStyles.settingTitle]}>
                  Data Sync
                </Text>
                <Text style={[styles.caption, screenStyles.settingSubtitle]}>
                  Cloud synchronization
                </Text>
              </View>
            </View>
            <Text style={[styles.caption, screenStyles.settingArrow]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={[styles.card, screenStyles.section]}>
          <Text style={[styles.h3, screenStyles.sectionTitle]}>
            Data Management
          </Text>
          
          <TouchableOpacity 
            style={screenStyles.settingItem}
            onPress={handleExportData}
          >
            <View style={screenStyles.settingContent}>
              <Text style={screenStyles.settingIcon}>📤</Text>
              <View style={screenStyles.settingText}>
                <Text style={[styles.body, screenStyles.settingTitle]}>
                  Export Data
                </Text>
                <Text style={[styles.caption, screenStyles.settingSubtitle]}>
                  Download your data
                </Text>
              </View>
            </View>
            <Text style={[styles.caption, screenStyles.settingArrow]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[screenStyles.settingItem, screenStyles.dangerItem]}
            onPress={handleResetData}
          >
            <View style={screenStyles.settingContent}>
              <Text style={screenStyles.settingIcon}>🗑️</Text>
              <View style={screenStyles.settingText}>
                <Text style={[styles.body, screenStyles.settingTitle, { color: theme.colors.error }]}>
                  Reset App Data
                </Text>
                <Text style={[styles.caption, screenStyles.settingSubtitle]}>
                  Clear all stored data
                </Text>
              </View>
            </View>
            <Text style={[styles.caption, screenStyles.settingArrow]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={[styles.card, screenStyles.section]}>
          <Text style={[styles.h3, screenStyles.sectionTitle]}>
            About
          </Text>
          
          <TouchableOpacity 
            style={screenStyles.settingItem}
            onPress={handleAbout}
          >
            <View style={screenStyles.settingContent}>
              <Text style={screenStyles.settingIcon}>ℹ️</Text>
              <View style={screenStyles.settingText}>
                <Text style={[styles.body, screenStyles.settingTitle]}>
                  App Information
                </Text>
                <Text style={[styles.caption, screenStyles.settingSubtitle]}>
                  Version, credits, and more
                </Text>
              </View>
            </View>
            <Text style={[styles.caption, screenStyles.settingArrow]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={screenStyles.settingItem}
            onPress={() => Alert.alert('Help', 'Help documentation coming soon')}
          >
            <View style={screenStyles.settingContent}>
              <Text style={screenStyles.settingIcon}>❓</Text>
              <View style={screenStyles.settingText}>
                <Text style={[styles.body, screenStyles.settingTitle]}>
                  Help & Support
                </Text>
                <Text style={[styles.caption, screenStyles.settingSubtitle]}>
                  Get help and contact support
                </Text>
              </View>
            </View>
            <Text style={[styles.caption, screenStyles.settingArrow]}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  sectionDescription: {
    marginBottom: 16,
    opacity: 0.7,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
    textAlign: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    opacity: 0.7,
  },
  settingArrow: {
    fontSize: 18,
    opacity: 0.5,
    marginLeft: 8,
  },
  dangerItem: {
    // Additional styling for dangerous actions
  },
});

export default SettingsScreen;
