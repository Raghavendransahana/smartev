import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface VehicleState {
  batteryLevel: number; // 0-100
  speed: number; // km/h
  batteryTemp: number; // Celsius
  range: number; // km
  isCharging: boolean;
  chargingRate: number; // kW
  location: {
    latitude: number;
    longitude: number;
  };
  odometer: number; // km
  efficiency: number; // kWh/100km
}

interface VehicleContextType {
  vehicleState: VehicleState;
  updateVehicleState: (updates: Partial<VehicleState>) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

interface VehicleProviderProps {
  children: ReactNode;
}

// Mock initial state
const initialVehicleState: VehicleState = {
  batteryLevel: 78,
  speed: 45,
  batteryTemp: 32,
  range: 312,
  isCharging: false,
  chargingRate: 0,
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
  odometer: 15420,
  efficiency: 18.5,
};

export const VehicleProvider: React.FC<VehicleProviderProps> = ({ children }) => {
  const [vehicleState, setVehicleState] = useState<VehicleState>(initialVehicleState);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const updateVehicleState = (updates: Partial<VehicleState>) => {
    setVehicleState(prevState => ({
      ...prevState,
      ...updates,
    }));
  };

  return (
    <VehicleContext.Provider 
      value={{ 
        vehicleState, 
        updateVehicleState, 
        isConnected, 
        setIsConnected 
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = (): VehicleContextType => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
};
