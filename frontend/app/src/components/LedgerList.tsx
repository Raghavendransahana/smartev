import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createStyles } from '@/theme/styles';
import { LedgerRecord } from '@/hooks/useLedger';

interface LedgerListProps {
  records: LedgerRecord[];
  onRecordPress?: (record: LedgerRecord) => void;
  loading?: boolean;
}

const LedgerList: React.FC<LedgerListProps> = ({
  records,
  onRecordPress,
  loading = false,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const getTypeIcon = (type: LedgerRecord['type']) => {
    switch (type) {
      case 'charging':
        return '⚡';
      case 'payment':
        return '💳';
      case 'energy_trade':
        return '🔄';
      case 'maintenance':
        return '🔧';
      default:
        return '📝';
    }
  };

  const getTypeColor = (type: LedgerRecord['type']) => {
    switch (type) {
      case 'charging':
        return theme.colors.info;
      case 'payment':
        return theme.colors.error;
      case 'energy_trade':
        return theme.colors.success;
      case 'maintenance':
        return theme.colors.warning;
      default:
        return theme.colors.text;
    }
  };

  const getStatusColor = (status: LedgerRecord['status']) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    }
    return `${amount.toFixed(2)} ${currency}`;
  };

  const renderRecord = ({ item }: { item: LedgerRecord }) => (
    <TouchableOpacity
      style={[styles.card, listStyles.recordItem]}
      onPress={() => onRecordPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={listStyles.recordHeader}>
        <View style={listStyles.typeContainer}>
          <Text style={listStyles.typeIcon}>
            {getTypeIcon(item.type)}
          </Text>
          <View style={listStyles.typeInfo}>
            <Text style={[styles.body, listStyles.description]} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={[styles.caption, listStyles.timestamp]}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
        </View>
        <View style={listStyles.amountContainer}>
          <Text style={[styles.h3, listStyles.amount, { color: getTypeColor(item.type) }]}>
            {formatAmount(item.amount, item.currency)}
          </Text>
          <View style={[listStyles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.caption, listStyles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      
      {item.transactionHash && (
        <View style={listStyles.transactionInfo}>
          <Text style={[styles.caption, listStyles.transactionLabel]}>
            Transaction Hash:
          </Text>
          <Text style={[styles.caption, listStyles.transactionHash]} numberOfLines={1}>
            {item.transactionHash}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.center, listStyles.loadingContainer]}>
        <Text style={styles.body}>Loading ledger records...</Text>
      </View>
    );
  }

  if (records.length === 0) {
    return (
      <View style={[styles.center, listStyles.emptyContainer]}>
        <Text style={styles.h3}>No Records Found</Text>
        <Text style={[styles.body, listStyles.emptyText]}>
          Your blockchain transactions will appear here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={records}
      renderItem={renderRecord}
      keyExtractor={(item) => item.id}
      style={listStyles.list}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={listStyles.listContainer}
    />
  );
};

const listStyles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  recordItem: {
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  typeInfo: {
    flex: 1,
  },
  description: {
    fontWeight: '600',
    marginBottom: 2,
  },
  timestamp: {
    opacity: 0.7,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  transactionInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  transactionLabel: {
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionHash: {
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
});

export default LedgerList;
