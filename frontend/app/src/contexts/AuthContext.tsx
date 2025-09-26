import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { flexiEVAPI, User } from '../api/flexiEVApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    role: User['role'];
    profile: {
      firstName: string;
      lastName: string;
      phoneNumber?: string;
    };
  }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'smartev_auth_token';
const USER_KEY = 'smartev_user_data';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Update API token when token changes
  useEffect(() => {
    if (token) {
      flexiEVAPI.setAuthToken(token);
    }
  }, [token]);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        flexiEVAPI.setAuthToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await flexiEVAPI.login({ email, password });
      
      setToken(response.token);
      setUser(response.user);
      
      // Store auth data
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, response.token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user)),
      ]);
      
      flexiEVAPI.setAuthToken(response.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    role: User['role'];
    profile: {
      firstName: string;
      lastName: string;
      phoneNumber?: string;
    };
  }) => {
    try {
      setIsLoading(true);
      const newUser = await flexiEVAPI.registerUser(userData);
      
      // Auto-login after successful registration
      await login(userData.email, userData.password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('AuthContext - logout function called');
    console.log('AuthContext - Current user before logout:', user);
    console.log('AuthContext - Current token before logout:', token ? 'exists' : 'null');
    
    try {
      // Clear API token first
      console.log('AuthContext - Clearing API token...');
      flexiEVAPI.setAuthToken('');
      
      // Clear stored auth data
      console.log('AuthContext - Clearing AsyncStorage...');
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
      console.log('AuthContext - AsyncStorage cleared successfully');
      
      // Clear state last to trigger re-render
      console.log('AuthContext - Clearing state...');
      setUser(null);
      setToken(null);
      console.log('AuthContext - State cleared, logout complete');
    } catch (error) {
      console.error('AuthContext - Logout error:', error);
      throw error; // Re-throw to handle in UI
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
