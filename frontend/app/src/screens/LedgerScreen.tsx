import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLedger } from '@/hooks/useLedger';
import { createStyles } from '@/theme/styles';
import LedgerList from '@/components/LedgerList';

const LedgerScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { records, isLoading, error, refreshRecords, addRecord } = useLedger();
  
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshRecords();
    } finally {
      setRefreshing(false);
    }
  }, [refreshRecords]);

  const handleAddMockRecord = async () => {
    try {
      await addRecord({
        type: 'charging',
        amount: Math.random() * 50 + 10,
        currency: 'USD',
        description: `Charging session at Station ${Math.floor(Math.random() * 10) + 1}`,
        status: 'pending',
      });
    } catch (err) {
      console.error('Failed to add record:', err);
    }
  };

  const handleRecordPress = (record: any) => {
    console.log('Record pressed:', record);
    // Navigate to record details or show modal
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={screenStyles.container}>
        {/* Header */}
        <View style={screenStyles.header}>
          <Text style={[styles.h2, screenStyles.title]}>
            Blockchain Ledger
          </Text>
          <Text style={[styles.caption, screenStyles.subtitle]}>
            All your EV transactions on the blockchain
          </Text>
        </View>

        {/* Add Record Button */}
        <TouchableOpacity
          style={[styles.primaryButton, screenStyles.addButton]}
          onPress={handleAddMockRecord}
        >
          <Text style={styles.primaryButtonText}>
            Add Mock Transaction
          </Text>
        </TouchableOpacity>

        {/* Error State */}
        {error && (
          <View style={[screenStyles.errorCard, { backgroundColor: theme.colors.error + '20' }]}>
            <Text style={[styles.body, { color: theme.colors.error }]}>
              ⚠️ {error}
            </Text>
          </View>
        )}

        {/* Records List */}
        <View style={screenStyles.listContainer}>
          <LedgerList
            records={records}
            onRecordPress={handleRecordPress}
            loading={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  addButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  errorCard: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
});

export default LedgerScreen;
