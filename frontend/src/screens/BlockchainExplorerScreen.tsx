import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { flexiEVAPI, BlockchainTransaction } from '../api/flexiEVApi';

const BlockchainExplorerScreen: React.FC = () => {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<BlockchainTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'battery' | 'charging' | 'ownership'>('all');

  const transactionTypes = [
    { key: 'all', label: 'All' },
    { key: 'battery', label: 'Battery' },
    { key: 'charging', label: 'Charging' },
    { key: 'ownership', label: 'Ownership' },
  ];

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await flexiEVAPI.getBlockchainTransactions();
      setTransactions(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load blockchain transactions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleTransactionDetails = async (transaction: BlockchainTransaction) => {
    try {
      setSelectedTransaction(transaction);
      setVerificationResult(null);
      setShowDetailModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load transaction details');
      console.error(error);
    }
  };

  const handleVerifyTransaction = async (txId: string) => {
    try {
      setVerifying(true);
      const result = await flexiEVAPI.verifyTransaction(txId);
      setVerificationResult(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to verify transaction');
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  const getFilteredTransactions = () => {
    if (filterType === 'all') return transactions;
    return transactions.filter(tx => tx.type === filterType);
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'battery':
        return '#22c55e';
      case 'charging':
        return '#3b82f6';
      case 'ownership':
        return '#f59e0b';
      default:
        return '#666';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'battery':
        return '🔋';
      case 'charging':
        return '⚡';
      case 'ownership':
        return '👤';
      default:
        return '📄';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTxId = (txId: string) => {
    return `${txId.substring(0, 8)}...${txId.substring(txId.length - 8)}`;
  };

  const TransactionCard = ({ item }: { item: BlockchainTransaction }) => (
    <TouchableOpacity
      style={[styles.transactionCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleTransactionDetails(item)}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <View style={styles.typeContainer}>
            <Text style={styles.typeIcon}>{getTransactionIcon(item.type)}</Text>
            <Text style={[
              styles.transactionType,
              { color: getTransactionTypeColor(item.type) }
            ]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.txId, { color: theme.colors.text }]}>
            {formatTxId(item.txId)}
          </Text>
        </View>
        <View style={styles.transactionMeta}>
          <Text style={[styles.blockNumber, { color: theme.colors.textSecondary }]}>
            Block #{item.blockNumber}
          </Text>
          <Text style={[styles.gasUsed, { color: theme.colors.textSecondary }]}>
            Gas: {item.gasUsed.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <Text style={[styles.vehicleId, { color: theme.colors.textSecondary }]}>
          Vehicle: {item.vehicleId}
        </Text>
        <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>

      <View style={styles.dataPreview}>
        <Text style={[styles.dataTitle, { color: theme.colors.text }]}>Data Preview:</Text>
        <Text style={[styles.dataContent, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {JSON.stringify(item.data)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const TransactionDetailModal = () => {
    if (!selectedTransaction) return null;

    return (
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Transaction Details
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetailModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Transaction ID
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {selectedTransaction.txId}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Type
                </Text>
                <View style={styles.typeContainer}>
                  <Text style={styles.typeIcon}>{getTransactionIcon(selectedTransaction.type)}</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: getTransactionTypeColor(selectedTransaction.type) }
                  ]}>
                    {selectedTransaction.type.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Vehicle ID
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {selectedTransaction.vehicleId}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Block Number
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {selectedTransaction.blockNumber.toLocaleString()}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Gas Used
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {selectedTransaction.gasUsed.toLocaleString()}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Timestamp
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {formatTimestamp(selectedTransaction.timestamp)}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Transaction Data
                </Text>
                <View style={[styles.dataContainer, { backgroundColor: theme.colors.background }]}>
                  <Text style={[styles.dataText, { color: theme.colors.text }]}>
                    {JSON.stringify(selectedTransaction.data, null, 2)}
                  </Text>
                </View>
              </View>

              {verificationResult && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    Verification Result
                  </Text>
                  <View style={[
                    styles.verificationResult,
                    { backgroundColor: verificationResult.valid ? '#22c55e' : '#ef4444' }
                  ]}>
                    <Text style={styles.verificationText}>
                      {verificationResult.valid ? '✓ Valid' : '✗ Invalid'}
                    </Text>
                  </View>
                  <Text style={[styles.dataText, { color: theme.colors.text }]}>
                    {JSON.stringify(verificationResult.details, null, 2)}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.verifyButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleVerifyTransaction(selectedTransaction.txId)}
                disabled={verifying}
              >
                {verifying ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.buttonText}>Verify Transaction</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Blockchain Explorer
        </Text>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleRefresh}
        >
          <Text style={styles.buttonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Filter by Type:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterList}>
          {transactionTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.filterChip,
                filterType === type.key && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setFilterType(type.key as any)}
            >
              <Text style={[
                styles.filterChipText,
                filterType === type.key ? { color: 'white' } : { color: theme.colors.text }
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.statsBar}>
        <Text style={[styles.statsText, { color: theme.colors.textSecondary }]}>
          Total: {transactions.length} | Showing: {filteredTransactions.length}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading blockchain transactions...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.txId}
          renderItem={({ item }) => <TransactionCard item={item} />}
          style={styles.transactionsList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No transactions found
              </Text>
            </View>
          }
        />
      )}

      <TransactionDetailModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  filterList: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsBar: {
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
  },
  transactionsList: {
    flex: 1,
  },
  transactionCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  txId: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  transactionMeta: {
    alignItems: 'flex-end',
  },
  blockNumber: {
    fontSize: 12,
    marginBottom: 2,
  },
  gasUsed: {
    fontSize: 12,
  },
  transactionDetails: {
    marginBottom: 12,
  },
  vehicleId: {
    fontSize: 14,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
  },
  dataPreview: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  dataTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dataContent: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'monospace',
  },
  dataContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 200,
  },
  dataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  verificationResult: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  verificationText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  verifyButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default BlockchainExplorerScreen;
