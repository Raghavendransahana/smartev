import { useState, useEffect, useCallback } from 'react';
import { blockchainApi } from '@/api/blockchainApi';

export interface LedgerRecord {
  id: string;
  timestamp: Date;
  type: 'charging' | 'payment' | 'energy_trade' | 'maintenance';
  amount: number;
  currency: string;
  description: string;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface UseLedgerReturn {
  records: LedgerRecord[];
  isLoading: boolean;
  error: string | null;
  refreshRecords: () => Promise<void>;
  addRecord: (record: Omit<LedgerRecord, 'id' | 'timestamp'>) => Promise<void>;
  lastUpdated: Date | null;
}

export const useLedger = (): UseLedgerReturn => {
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await blockchainApi.getLedgerRecords();
      setRecords(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ledger records');
      console.error('Error fetching ledger records:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshRecords = useCallback(async () => {
    await fetchRecords();
  }, [fetchRecords]);

  const addRecord = useCallback(async (recordData: Omit<LedgerRecord, 'id' | 'timestamp'>) => {
    try {
      setError(null);
      const newRecord = await blockchainApi.createLedgerRecord(recordData);
      setRecords(prevRecords => [newRecord, ...prevRecords]);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add record');
      console.error('Error adding record:', err);
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Listen for blockchain events
  useEffect(() => {
    const unsubscribe = blockchainApi.subscribeToEvents((event) => {
      console.log('Blockchain event received:', event);
      // Refresh records when new blockchain events are received
      fetchRecords();
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchRecords]);

  return {
    records,
    isLoading,
    error,
    refreshRecords,
    addRecord,
    lastUpdated,
  };
};
