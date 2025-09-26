import React, { createContext, useContext, useState, useEffect } from 'react'

export type UserRole = 'Super Admin' | 'Admin' | 'Seller'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  brandId?: string
  isFirstLogin?: boolean
  permissions?: string[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  isLoading: boolean
  isAuthenticated: boolean
  hasRole: (role: UserRole) => boolean
  canAccess: (requiredRoles: UserRole[]) => boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        
        if (token) {
          // Validate token with backend
          await validateToken(token)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear invalid data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        throw new Error('Token validation failed')
      }
    } catch (error) {
      console.error('Token validation error:', error)
      // Fallback to mock data for development
      const userData = localStorage.getItem('user_data')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      }
    }
  }

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Try to authenticate with backend API
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        setUser(data.user)
        return true
      }
    } catch (error) {
      console.error('Backend login failed, using mock data:', error)
    }

    // Fallback to mock authentication for development
    try {
      console.log('Authenticating:', { email, password: '***', role })
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data based on role
      const mockUser: User = {
        id: `user_${Date.now()}`,
        name: getNameByRole(role),
        email,
        role: formatRoleName(role),
        avatar: undefined,
        brandId: role === 'admin' ? 'brand-1' : undefined,
        isFirstLogin: role === 'admin' && !localStorage.getItem(`setup_complete_${email}`),
        permissions: getPermissionsByRole(role),
      }

      // Mock token
      const mockToken = `mock_token_${Date.now()}`
      
      // Store in localStorage
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('user_data', JSON.stringify(mockUser))
      
      setUser(mockUser)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setUser(null)
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('user_data', JSON.stringify(updatedUser))
    }
  }

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  const canAccess = (requiredRoles: UserRole[]): boolean => {
    return user ? requiredRoles.includes(user.role) : false
  }

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false
  }

  const getNameByRole = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'superadmin':
      case 'super admin':
        return 'Super Admin'
      case 'admin':
        return 'Brand Admin'
      case 'seller':
        return 'Sales Agent'
      default:
        return 'User'
    }
  }

  const formatRoleName = (role: string): UserRole => {
    switch (role.toLowerCase()) {
      case 'superadmin':
      case 'super admin':
        return 'Super Admin'
      case 'admin':
        return 'Admin'
      case 'seller':
        return 'Seller'
      default:
        return 'Seller'
    }
  }

  const getPermissionsByRole = (role: string): string[] => {
    switch (role.toLowerCase()) {
      case 'superadmin':
      case 'super admin':
        return ['*'] // All permissions
      case 'admin':
        return ['users:read', 'users:write', 'stations:read', 'stations:write', 'complaints:write', 'analytics:read']
      case 'seller':
        return ['marketplace:read', 'marketplace:write', 'transactions:write', 'analytics:read']
      default:
        return []
    }
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    canAccess,
    hasPermission,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}