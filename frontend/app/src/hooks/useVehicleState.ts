import { useState, useEffect, useCallback } from 'react';
import { VehicleState } from '@/contexts/VehicleContext';
import { vehicleApi } from '@/api/vehicleApi';

export interface UseVehicleStateReturn {
  vehicleState: VehicleState | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useVehicleState = (): UseVehicleStateReturn => {
  const [vehicleState, setVehicleState] = useState<VehicleState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchVehicleState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await vehicleApi.getVehicleState();
      setVehicleState(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicle state');
      console.error('Error fetching vehicle state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchVehicleState();
  }, [fetchVehicleState]);

  // Initial fetch
  useEffect(() => {
    fetchVehicleState();
  }, [fetchVehicleState]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchVehicleState();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchVehicleState, isLoading]);

  return {
    vehicleState,
    isLoading,
    error,
    refreshData,
    lastUpdated,
  };
};
