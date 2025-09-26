const BASE_URL = 'http://localhost:4000'; // Replace with actual API URL

// Types for API responses
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  vin: string;
  owner: string;
  registrationDate: string;
}

export interface BatteryTelemetry {
  id: string;
  vehicleId: string;
  soc: number; // State of Charge
  soh: number; // State of Health
  temperature: number;
  cycleCount: number;
  timestamp: string;
  blockchainTxId?: string;
}

export interface ChargingSession {
  id: string;
  vehicleId: string;
  startTime: string;
  endTime?: string;
  location: string;
  chargerId: string;
  kwhDelivered?: number;
  duration?: number;
  cost?: number;
  blockchainTxId?: string;
}

export interface OwnershipTransfer {
  id: string;
  vehicleId: string;
  oldOwner: string;
  newOwner: string;
  transferDate: string;
  blockchainTxId: string;
}

export interface BlockchainTransaction {
  txId: string;
  type: 'battery' | 'charging' | 'ownership';
  vehicleId: string;
  data: any;
  timestamp: string;
  blockNumber: number;
  gasUsed: number;
}

export interface User {
  id: string;
  email: string;
  role: 'owner' | 'oem' | 'regulator' | 'service_provider';
  name: string;
  createdAt: string;
}

export interface SystemInfo {
  version: string;
  supportedBrands: string[];
  blockchainStatus: 'active' | 'maintenance' | 'offline';
  totalVehicles: number;
  totalTransactions: number;
}

export interface FleetSummary {
  totalVehicles: number;
  activeVehicles: number;
  averageBatteryHealth: number;
  totalChargingSessions: number;
  alerts: number;
}

export interface Alert {
  id: string;
  vehicleId: string;
  type: 'battery_degradation' | 'abnormal_charging' | 'maintenance_required';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface Analytics {
  remainingLife: number;
  warrantyStatus: string;
  predictedFailureDate?: string;
  recommendedActions: string[];
  chargingEfficiency?: number;
  costOptimization?: {
    currentCost: number;
    optimizedCost: number;
    savings: number;
  };
}

// API Service Class
class FlexiEVAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // 1. System & Health
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  async getSystemInfo(): Promise<SystemInfo> {
    return this.request('/system/info');
  }

  // 2. Vehicle Management
  async registerVehicle(vehicle: Omit<Vehicle, 'id' | 'registrationDate'>): Promise<Vehicle> {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
  }

  async getVehicle(id: string): Promise<Vehicle> {
    return this.request(`/vehicles/${id}`);
  }

  async getVehicles(brand?: string): Promise<Vehicle[]> {
    const query = brand ? `?brand=${encodeURIComponent(brand)}` : '';
    return this.request(`/vehicles${query}`);
  }

  // 3. Battery Management
  async logBatteryTelemetry(
    vehicleId: string,
    telemetry: Omit<BatteryTelemetry, 'id' | 'vehicleId' | 'timestamp' | 'blockchainTxId'>
  ): Promise<BatteryTelemetry> {
    return this.request(`/batteries/${vehicleId}/log`, {
      method: 'POST',
      body: JSON.stringify(telemetry),
    });
  }

  async getBatteryHistory(vehicleId: string): Promise<BatteryTelemetry[]> {
    return this.request(`/batteries/${vehicleId}/history`);
  }

  async getLatestBatteryData(vehicleId: string): Promise<BatteryTelemetry> {
    return this.request(`/batteries/${vehicleId}/latest`);
  }

  // 4. Charging Sessions
  async startChargingSession(
    vehicleId: string,
    session: { location: string; chargerId: string }
  ): Promise<ChargingSession> {
    return this.request(`/charging/${vehicleId}/start`, {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  async endChargingSession(
    vehicleId: string,
    sessionData: { kwhDelivered: number; duration: number; cost: number }
  ): Promise<ChargingSession> {
    return this.request(`/charging/${vehicleId}/end`, {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getChargingHistory(vehicleId: string): Promise<ChargingSession[]> {
    return this.request(`/charging/${vehicleId}/history`);
  }

  // 5. Ownership & Traceability
  async transferOwnership(transfer: {
    vehicleId: string;
    oldOwner: string;
    newOwner: string;
  }): Promise<OwnershipTransfer> {
    return this.request('/ownership/transfer', {
      method: 'POST',
      body: JSON.stringify(transfer),
    });
  }

  async getOwnershipHistory(vehicleId: string): Promise<OwnershipTransfer[]> {
    return this.request(`/ownership/${vehicleId}/history`);
  }

  // 6. Blockchain Explorer
  async getBlockchainTransactions(): Promise<BlockchainTransaction[]> {
    return this.request('/blockchain/transactions');
  }

  async getBlockchainTransaction(txId: string): Promise<BlockchainTransaction> {
    return this.request(`/blockchain/transaction/${txId}`);
  }

  // 7. User Management
  async registerUser(user: {
    email: string;
    password: string;
    role: User['role'];
    name: string;
  }): Promise<User> {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async login(credentials: { email: string; password: string }): Promise<{ token: string; user: User }> {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getUser(id: string): Promise<User> {
    return this.request(`/users/${id}`);
  }

  // 8. Analytics / Insights
  async getBatteryAnalytics(vehicleId: string): Promise<Analytics> {
    return this.request(`/analytics/battery/${vehicleId}`);
  }

  async getChargingAnalytics(vehicleId: string): Promise<Analytics> {
    return this.request(`/analytics/charging/${vehicleId}`);
  }

  // 9. Integration APIs
  async submitOEMData(data: { vehicleId: string; telemetry: any }): Promise<{ success: boolean; txId: string }> {
    return this.request('/oem/integration', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOEMData(vehicleId: string): Promise<any> {
    return this.request(`/oem/data/${vehicleId}`);
  }

  // 10. Security / Audit
  async getAuditLogs(): Promise<any[]> {
    return this.request('/audit/logs');
  }

  async verifyTransaction(txId: string): Promise<{ valid: boolean; details: any }> {
    return this.request(`/audit/verify/${txId}`, {
      method: 'POST',
    });
  }

  // Bonus APIs
  async getFleetSummary(): Promise<FleetSummary> {
    return this.request('/fleet/summary');
  }

  async raiseAlert(vehicleId: string, alert: {
    type: Alert['type'];
    severity: Alert['severity'];
    message: string;
  }): Promise<Alert> {
    return this.request(`/alerts/${vehicleId}`, {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  }
}

export const flexiEVAPI = new FlexiEVAPI();
