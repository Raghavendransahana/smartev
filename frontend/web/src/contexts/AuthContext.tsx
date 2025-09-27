import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

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
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  refreshUser: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
  hasRole: (role: UserRole) => boolean
  canAccess: (requiredRoles: UserRole[]) => boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

// Helper function to map backend roles to frontend roles
const mapBackendRoleToFrontend = (backendRole: string): UserRole => {
  switch (backendRole) {
    case 'admin': return 'Super Admin'
    case 'service_provider': return 'Admin'
    case 'owner': return 'Seller'
    default: return 'Seller'
  }
}

// Helper function to get redirect path based on user role
export const getRedirectPath = (role: UserRole): string => {
  switch (role) {
    case 'Super Admin': return '/super-admin'
    case 'Admin': return '/admin'
    case 'Seller': return '/seller'
    default: return '/seller'
  }
}

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

  const applyStoredUser = useCallback(() => {
    const storedUser = localStorage.getItem('user_data')
    if (!storedUser) return null
    try {
      const parsedUser = JSON.parse(storedUser) as User
      setUser(parsedUser)
      return parsedUser
    } catch (error) {
      console.warn('Unable to parse stored user data:', error)
      localStorage.removeItem('user_data')
      return null
    }
  }, [])

  const validateToken = useCallback(async (token: string) => {
    if (!token) return false

    // Skip network validation when offline to avoid infinite retries
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return applyStoredUser() !== null
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()
        // Convert backend user format to frontend User format
        const user: User = {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          role: mapBackendRoleToFrontend(userData.role),
          avatar: undefined,
          brandId: undefined,
          isFirstLogin: false,
          permissions: getPermissionsByRole(userData.role)
        }
        setUser(user)
        localStorage.setItem('user_data', JSON.stringify(user))
        return true
      }
      throw new Error('Token validation failed')
    } catch (error) {
      console.error('Token validation error:', error)
      return applyStoredUser() !== null
    }
  }, [applyStoredUser])

  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        const storedUser = applyStoredUser()
        const token = localStorage.getItem('auth_token')

        if (token) {
          const isValid = await validateToken(token)
          if (!isValid && storedUser) {
            // Keep stored user for dev environments when backend unavailable
            setUser(storedUser)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void initAuth()

    return () => {
      isMounted = false
    }
  }, [applyStoredUser, validateToken])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Try to authenticate with backend API
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        // Convert backend user format to frontend User format
        const user: User = {
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: mapBackendRoleToFrontend(data.user.role),
          avatar: undefined,
          brandId: undefined,
          isFirstLogin: false,
          permissions: getPermissionsByRole(data.user.role)
        }
        
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(user))
        setUser(user)
        return true
      } else {
        // Handle login failure from backend
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }))
        console.error('Login failed:', errorData.message)
        return false
      }
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setUser(null)
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('user_data', JSON.stringify(updatedUser))
    }
  }, [user])

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      await validateToken(token)
    }
  }, [validateToken])

  const hasRole = useCallback((role: UserRole): boolean => {
    return user?.role === role
  }, [user?.role])

  const canAccess = useCallback((requiredRoles: UserRole[]): boolean => {
    return user ? requiredRoles.includes(user.role) : false
  }, [user])

  const hasPermission = useCallback((permission: string): boolean => {
    return user?.permissions?.includes(permission) || false
  }, [user?.permissions])



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

  const value: AuthContextType = useMemo(() => ({
    user,
    login,
    logout,
    updateUser,
    refreshUser,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    canAccess,
    hasPermission,
  }), [user, login, logout, updateUser, refreshUser, isLoading, hasRole, canAccess, hasPermission])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}