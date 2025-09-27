const API_BASE_URL = 'http://localhost:4000/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'oem' | 'regulator' | 'service_provider' | 'admin';
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface GetUsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CreateUserData {
  email: string;
  password: string;
  role: 'owner' | 'oem' | 'regulator' | 'service_provider' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'owner' | 'oem' | 'regulator' | 'service_provider' | 'admin';
}

// Vehicle interfaces
interface Vehicle {
  _id: string;
  brand: string;
  vehicleModel: string;
  vin: string;
  owner: string;
  blockchainPassportId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface CreateVehicleData {
  brand: string;
  vehicleModel: string;
  vin: string;
  status?: 'active' | 'inactive';
}

interface CreateVehicleForUserData extends CreateVehicleData {
  ownerId: string;
}

interface UpdateVehicleData {
  brand?: string;
  vehicleModel?: string;
  status?: 'active' | 'inactive';
}

// Battery interfaces
interface BatteryLog {
  _id: string;
  vehicle: string;
  stateOfCharge: number;
  stateOfHealth: number;
  temperature: number;
  cycleCount: number;
  recordedAt: string;
  source: 'iot' | 'manual';
  blockchainTxId?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateBatteryLogData {
  vehicleId: string;
  batteryLevel: number;
  voltage: number;
  temperature: number;
  cycleCount: number;
  healthPercentage: number;
  chargingStatus: 'charging' | 'not_charging' | 'fast_charging';
}

interface CreateBatteryLogAdminData {
  vehicleId: string;
  stateOfCharge: number;
  stateOfHealth: number;
  temperature: number;
  cycleCount: number;
  voltage?: number;
  chargingStatus?: 'charging' | 'not_charging' | 'fast_charging';
  source?: 'iot' | 'manual';
  recordedAt?: string;
}

// Vehicle-User mapping interface
interface VehicleUserMapping {
  userId: string;
  userName: string;
  userEmail: string;
  vehicles: Vehicle[];
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        
        // Handle 401 Unauthorized - clear token and throw specific error
        if (response.status === 401) {
          console.log('Unauthorized - clearing token');
          localStorage.removeItem('token');
          throw new Error('Authentication required');
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.request<{ token: string; user: User }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token in localStorage for subsequent requests
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  }

  // Auto-login with test credentials (for development)
  async autoLogin(): Promise<boolean> {
    try {
      // Check if we already have a token
      const existingToken = this.getAuthToken();
      
      if (existingToken) {
        // Validate the existing token by trying to get current user
        try {
          await this.getCurrentUser();
          return true; // Token is valid
        } catch (error) {
          console.log('Existing token invalid, clearing and re-authenticating...');
          localStorage.removeItem('token');
        }
      }

      // Try to login with test admin credentials
      console.log('Attempting auto-login with admin credentials...');
      await this.login('admin@smartev.com', 'admin123');
      console.log('Auto-login successful');
      return true;
    } catch (error) {
      console.error('Auto-login failed:', error);
      localStorage.removeItem('token'); // Clear any invalid token
      return false;
    }
  }

  // User management
  async getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getUserById(id: string): Promise<User> {
    return this.request(`/users/profile/${id}`);
  }

  async createUser(userData: CreateUserData): Promise<{ message: string; user: User }> {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<{ message: string; user: User }> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/users/profile');
  }

  // Vehicle management methods
  async getVehicles(): Promise<Vehicle[]> {
    return this.request('/vehicles');
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return this.request('/vehicles/admin/all');
  }

  async getVehiclesByUserId(userId: string): Promise<Vehicle[]> {
    return this.request(`/vehicles/admin/user/${userId}`);
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    return this.request(`/vehicles/${id}`);
  }

  async createVehicle(vehicleData: CreateVehicleData): Promise<Vehicle> {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async createVehicleForUser(vehicleData: CreateVehicleForUserData): Promise<Vehicle> {
    console.log('API Service - Creating vehicle for user:', vehicleData);
    return this.request('/vehicles/admin/create', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async updateVehicle(id: string, vehicleData: UpdateVehicleData): Promise<Vehicle> {
    return this.request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async deleteVehicle(id: string): Promise<{ message: string }> {
    return this.request(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  }

  // Battery management methods
  async getBatteryLogs(vehicleId: string): Promise<BatteryLog[]> {
    return this.request(`/battery/logs/${vehicleId}`);
  }

  async getBatteryLogsAdmin(vehicleId: string): Promise<BatteryLog[]> {
    return this.request(`/battery/admin/logs/${vehicleId}`);
  }

  async createBatteryLog(batteryData: CreateBatteryLogData): Promise<BatteryLog> {
    return this.request('/battery/log', {
      method: 'POST',
      body: JSON.stringify(batteryData),
    });
  }

  async createAdminBatteryLog(batteryData: CreateBatteryLogAdminData): Promise<BatteryLog> {
    return this.request('/battery/admin/log', {
      method: 'POST',
      body: JSON.stringify(batteryData),
    });
  }

  // Combined methods for user-vehicle-battery mapping
  async getAllUsersWithVehicles(): Promise<VehicleUserMapping[]> {
    const users = await this.getUsers({ limit: 1000 });
    const mappings: VehicleUserMapping[] = [];

    for (const user of users.users) {
      try {
        const vehicles = await this.getVehiclesByUserId(user._id);
        const mapping: VehicleUserMapping = {
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          vehicles: vehicles
        };
        mappings.push(mapping);
      } catch (error) {
        console.warn(`Failed to get vehicles for user ${user._id}:`, error);
        // Still add user even if vehicle fetch fails
        mappings.push({
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          vehicles: []
        });
      }
    }

    return mappings;
  }
}

export const apiService = new ApiService();
export type { 
  User, 
  GetUsersParams, 
  CreateUserData, 
  UpdateUserData, 
  GetUsersResponse, 
  PaginationInfo,
  Vehicle,
  CreateVehicleData,
  CreateVehicleForUserData,
  UpdateVehicleData,
  BatteryLog,
  CreateBatteryLogData,
  VehicleUserMapping
};
