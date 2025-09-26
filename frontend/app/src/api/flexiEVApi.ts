const BASE_URL = 'http://192.168.137.103:4000/api'; // Backend API URL

// Types for API responses (updated to match backend schema)
export interface Vehicle {
  _id: string;
  brand: string;
  vehicleModel: string;
  vin: string;
  owner: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface BatteryTelemetry {
  _id: string;
  vehicleId: string;
  batteryLevel: number; // State of Charge (0-100)
  voltage: number;
  temperature: number;
  cycleCount: number;
  health: number; // State of Health (0-100)
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChargingSession {
  _id: string;
  vehicleId: string;
  startTime: string;
  endTime?: string;
  location: string;
  chargerId: string;
  energyDelivered?: number;
  cost?: number;
  status: 'started' | 'completed' | 'interrupted';
  createdAt: string;
  updatedAt: string;
}

export interface OwnershipTransfer {
  _id: string;
  vehicleId: string;
  currentOwner: string;
  newOwner: string;
  transferPrice?: number;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  initiatedAt: string;
  approvedAt?: string;
}

export interface BlockchainTransaction {
  _id: string;
  type: 'battery' | 'charging' | 'ownership' | 'alert' | 'oem';
  vehicleId?: string;
  payload: any;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
  timestamp: string;
  blockNumber: number;
  gasUsed: number;
}

export interface User {
  _id: string;
  email: string;
  role: 'owner' | 'oem' | 'regulator' | 'service_provider' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SystemInfo {
  version: string;
  uptime: number;
  environment: string;
  database: {
    status: string;
    name: string;
  };
  memory: {
    used: number;
    total: number;
  };
  timestamp: string;
}

export interface FleetSummary {
  totalVehicles: number;
  activeVehicles: number;
  totalChargingSessions: number;
  totalEnergyDelivered: number;
  totalAlerts: number;
  recentTransactions: number;
}

export interface Alert {
  _id: string;
  vehicleId: string;
  type: 'maintenance' | 'battery' | 'charging' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data?: any;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
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
  async registerVehicle(vehicle: { brand: string; vehicleModel: string; vin: string }): Promise<Vehicle> {
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

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    return this.request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicle),
    });
  }

  async deleteVehicle(id: string): Promise<void> {
    return this.request(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  }

  // 3. Battery Management
  async logBatteryTelemetry(
    vehicleId: string,
    telemetry: { batteryLevel: number; voltage: number; temperature: number; cycleCount: number; health: number }
  ): Promise<BatteryTelemetry> {
    return this.request('/battery/log', {
      method: 'POST',
      body: JSON.stringify({ ...telemetry, vehicleId }),
    });
  }

  async getBatteryHistory(vehicleId: string): Promise<BatteryTelemetry[]> {
    return this.request(`/battery/${vehicleId}/history`);
  }

  async getLatestBatteryData(vehicleId: string): Promise<BatteryTelemetry> {
    const history = await this.getBatteryHistory(vehicleId);
    return history[0] || null;
  }

  // 4. Charging Sessions
  async startChargingSession(
    vehicleId: string,
    session: { location: string; chargerId: string }
  ): Promise<ChargingSession> {
    return this.request('/charging/start', {
      method: 'POST',
      body: JSON.stringify({ ...session, vehicleId }),
    });
  }

  async endChargingSession(
    sessionId: string,
    sessionData: { energyDelivered: number; cost: number }
  ): Promise<ChargingSession> {
    return this.request('/charging/end', {
      method: 'POST',
      body: JSON.stringify({ sessionId, ...sessionData }),
    });
  }

  async getChargingHistory(vehicleId: string): Promise<ChargingSession[]> {
    return this.request(`/charging/history/${vehicleId}`);
  }

  // 5. Ownership & Traceability
  async initiateOwnershipTransfer(transfer: {
    vehicleId: string;
    newOwnerId: string;
    transferPrice?: number;
    notes?: string;
  }): Promise<OwnershipTransfer> {
    return this.request('/ownership/initiate', {
      method: 'POST',
      body: JSON.stringify(transfer),
    });
  }

  async approveOwnershipTransfer(transferId: string, approved: boolean): Promise<OwnershipTransfer> {
    return this.request('/ownership/approve', {
      method: 'POST',
      body: JSON.stringify({ transferId, approved }),
    });
  }

  async getOwnershipHistory(vehicleId: string): Promise<OwnershipTransfer[]> {
    return this.request(`/ownership/history/${vehicleId}`);
  }

  // 6. Blockchain Explorer
  async getBlockchainTransactions(): Promise<BlockchainTransaction[]> {
    return this.request('/blockchain/recent');
  }

  async getVehicleTransactions(vehicleId: string): Promise<BlockchainTransaction[]> {
    return this.request(`/blockchain/vehicle/${vehicleId}`);
  }

  async getBlockchainStats(): Promise<{ byType: any[]; total: number }> {
    return this.request('/blockchain/stats');
  }

  // 7. User Management
  async registerUser(user: {
    email: string;
    password: string;
    role: User['role'];
    profile: {
      firstName: string;
      lastName: string;
      phoneNumber?: string;
    };
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

  async getProfile(): Promise<User> {
    return this.request('/users/profile');
  }

  async updateProfile(profile: Partial<User['profile']>): Promise<User> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ profile }),
    });
  }

  // 8. Analytics / Insights
  async getVehicleAnalytics(vehicleId: string): Promise<Analytics> {
    return this.request(`/analytics/vehicle/${vehicleId}/summary`);
  }

  // 9. Alerts Management
  async createAlert(alert: {
    vehicleId: string;
    type: Alert['type'];
    severity: Alert['severity'];
    message: string;
    data?: any;
  }): Promise<Alert> {
    return this.request('/alerts/create', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  }

  async getVehicleAlerts(vehicleId: string): Promise<Alert[]> {
    return this.request(`/alerts/vehicle/${vehicleId}`);
  }

  async updateAlert(alertId: string, status: Alert['status']): Promise<Alert> {
    return this.request(`/alerts/${alertId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // 10. Fleet Management
  async getFleetSummary(): Promise<FleetSummary> {
    // This would be a custom endpoint that aggregates data
    const [vehicles, alerts, transactions] = await Promise.all([
      this.getVehicles(),
      this.getSystemInfo(),
      this.getBlockchainStats(),
    ]);
    
    return {
      totalVehicles: vehicles.length,
      activeVehicles: vehicles.filter(v => v.status === 'active').length,
      totalChargingSessions: 0, // Would need charging data
      totalEnergyDelivered: 0, // Would need charging data
      totalAlerts: 0, // Would need alert data
      recentTransactions: transactions.total,
    };
  }
}

export const flexiEVAPI = new FlexiEVAPI();
