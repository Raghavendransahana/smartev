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
}

export const apiService = new ApiService();
export type { User, GetUsersParams, CreateUserData, UpdateUserData, GetUsersResponse, PaginationInfo };
