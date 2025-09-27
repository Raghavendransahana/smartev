import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { 
  Users, 
  Search,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { apiService, type User as ApiUser } from '../services/api.service'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'Super Admin' | 'Admin' | 'Seller' | 'User'
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  lastLogin: string
  department?: string
  avatar?: string
}

interface UserFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'Super Admin' | 'Admin' | 'Seller' | 'User'
  status: 'active' | 'inactive' | 'pending'
  department: string
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@smartev.com',
    phone: '+1 234 567 8900',
    role: 'Admin',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2025-09-27',
    department: 'Operations'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@smartev.com',
    phone: '+1 234 567 8901',
    role: 'Seller',
    status: 'active',
    createdAt: '2024-02-10',
    lastLogin: '2025-09-26',
    department: 'Sales'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@smartev.com',
    phone: '+1 234 567 8902',
    role: 'User',
    status: 'pending',
    createdAt: '2024-03-20',
    lastLogin: 'Never',
    department: 'Customer'
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice.brown@smartev.com',
    phone: '+1 234 567 8903',
    role: 'Admin',
    status: 'inactive',
    createdAt: '2024-01-05',
    lastLogin: '2025-09-20',
    department: 'Support'
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie.wilson@smartev.com',
    phone: '+1 234 567 8904',
    role: 'Seller',
    status: 'active',
    createdAt: '2024-04-12',
    lastLogin: '2025-09-27',
    department: 'Sales'
  }
]

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'User',
    status: 'pending',
    department: ''
  })

  // Convert API user to frontend user format
  const convertApiUser = (apiUser: ApiUser): User => {
    // Map API roles to frontend role types
    let role: 'User' | 'Seller' | 'Admin' | 'Super Admin' = 'User'
    if (apiUser.role === 'admin') role = 'Admin'
    else if (apiUser.role === 'oem') role = 'Seller' // OEM can be mapped to Seller
    else if (apiUser.role === 'service_provider') role = 'Super Admin' // Service provider has high privileges
    else if (apiUser.role === 'regulator') role = 'Admin' // Regulator has admin privileges
    // 'owner' defaults to 'User'
    
    return {
      id: apiUser._id,
      name: apiUser.name,
      email: apiUser.email,
      phone: '', // API doesn't have phone field yet
      role: role,
      status: 'active', // API doesn't have status field yet, defaulting to active
      createdAt: new Date(apiUser.createdAt).toLocaleDateString(),
      lastLogin: 'Recently', // API doesn't have lastLogin field yet
      department: 'N/A' // API doesn't have department field yet
    }
  }

  // Load users from API
  useEffect(() => {
    loadUsers()
  }, [])

  // Reload users when search term changes
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchTerm.length > 2 || searchTerm.length === 0) {
        loadUsers()
      }
    }, 500) // Debounce search for 500ms

    return () => clearTimeout(searchTimeout)
  }, [searchTerm])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Ensure we're authenticated before making API calls
      const isAuthenticated = await apiService.autoLogin()
      if (!isAuthenticated) {
        throw new Error('Authentication failed. Please check your credentials.')
      }
      
      const response = await apiService.getUsers({
        search: searchTerm || undefined,
        limit: 100 // Load more users for better UX
      })
      const convertedUsers = response.users.map(convertApiUser)
      setUsers(convertedUsers)
    } catch (err) {
      console.error('Failed to load users:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users'
      
      // If it's an authentication error, retry once
      if (errorMessage.includes('Authentication') || errorMessage.includes('Unauthorized')) {
        console.log('Authentication error detected, retrying...')
        try {
          // Force re-authentication by clearing token first
          localStorage.removeItem('token')
          const retryAuth = await apiService.autoLogin()
          if (retryAuth) {
            const retryResponse = await apiService.getUsers({
              search: searchTerm || undefined,
              limit: 100
            })
            const retryUsers = retryResponse.users.map(convertApiUser)
            setUsers(retryUsers)
            return // Success on retry
          }
        } catch (retryErr) {
          console.error('Retry also failed:', retryErr)
        }
      }
      
      setError(errorMessage)
      // Fallback to mock data if API fails
      setUsers(mockUsers)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} className="text-emerald-600" />
      case 'inactive': return <XCircle size={16} className="text-red-600" />
      case 'pending': return <Clock size={16} className="text-amber-600" />
      default: return <XCircle size={16} className="text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700'
      case 'inactive': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'bg-purple-100 text-purple-700'
      case 'Admin': return 'bg-blue-100 text-blue-700'
      case 'Seller': return 'bg-green-100 text-green-700'
      case 'User': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleCreateUser = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Validate required fields
      if (!formData.firstName.trim()) {
        setError('First name is required')
        setLoading(false)
        return
      }
      
      if (!formData.lastName.trim()) {
        setError('Last name is required')
        setLoading(false)
        return
      }
      
      if (!formData.email.trim()) {
        setError('Email is required')
        setLoading(false)
        return
      }
      
      // Map frontend role to API role
      let apiRole: 'owner' | 'oem' | 'regulator' | 'service_provider' | 'admin' = 'owner'
      if (formData.role === 'Admin') apiRole = 'admin'
      else if (formData.role === 'Seller') apiRole = 'oem'
      else if (formData.role === 'Super Admin') apiRole = 'service_provider'
      
      await apiService.createUser({
        email: formData.email,
        password: 'temp123!', // Default password, should be changed on first login
        role: apiRole,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        }
      })
      
      await loadUsers() // Reload users list
      setShowCreateModal(false)
      resetForm()
    } catch (err) {
      console.error('Failed to create user:', err)
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Validate required fields
      if (!formData.firstName.trim()) {
        setError('First name is required')
        setLoading(false)
        return
      }
      
      if (!formData.lastName.trim()) {
        setError('Last name is required')
        setLoading(false)
        return
      }
      
      if (!formData.email.trim()) {
        setError('Email is required')
        setLoading(false)
        return
      }
      
      // Map frontend role to API role
      let apiRole: 'owner' | 'oem' | 'regulator' | 'service_provider' | 'admin' = 'owner'
      if (formData.role === 'Admin') apiRole = 'admin'
      else if (formData.role === 'Seller') apiRole = 'oem'
      else if (formData.role === 'Super Admin') apiRole = 'service_provider'
      
      await apiService.updateUser(selectedUser.id, {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        role: apiRole
      })
      
      await loadUsers() // Reload users list
      setShowEditModal(false)
      setSelectedUser(null)
      resetForm()
    } catch (err) {
      console.error('Failed to update user:', err)
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      setLoading(true)
      setError(null)
      
      await apiService.deleteUser(selectedUser.id)
      
      await loadUsers() // Reload users list
      setShowDeleteModal(false)
      setSelectedUser(null)
    } catch (err) {
      console.error('Failed to delete user:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    const nameParts = user.name.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    setFormData({
      firstName,
      lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      department: user.department || ''
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'User',
      status: 'pending',
      department: ''
    })
  }

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <UserPlus size={16} className="mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="text-emerald-600" size={24} />
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'pending').length}
              </p>
            </div>
            <Clock className="text-amber-600" size={24} />
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'Admin' || u.role === 'Super Admin').length}
              </p>
            </div>
            <Shield className="text-purple-600" size={24} />
          </div>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center text-red-700">
            <AlertCircle className="mr-2" size={16} />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </Card>
      )}

      {/* Loading Display */}
      {loading && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-center text-blue-700">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            <span>Loading users...</span>
          </div>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="p-6 border-gray-200 bg-white">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            >
              <option value="all">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Seller">Seller</option>
              <option value="User">User</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-gray-700 font-medium">User</th>
                <th className="text-left p-4 text-gray-700 font-medium">Contact</th>
                <th className="text-left p-4 text-gray-700 font-medium">Role</th>
                <th className="text-left p-4 text-gray-700 font-medium">Status</th>
                <th className="text-left p-4 text-gray-700 font-medium">Department</th>
                <th className="text-left p-4 text-gray-700 font-medium">Last Login</th>
                <th className="text-left p-4 text-gray-700 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(user.status)}
                      <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                        {user.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">{user.department}</td>
                  <td className="p-4 text-gray-600 text-sm">{user.lastLogin}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => openEditModal(user)}
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => openDeleteModal(user)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New User</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    className="bg-white border-gray-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className="bg-white border-gray-300"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className="bg-white border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  className="bg-white border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  <option value="User">User</option>
                  <option value="Seller">Seller</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <Input
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Enter department"
                  className="bg-white border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button 
                onClick={handleCreateUser}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Create User
              </Button>
              <Button 
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-white border-gray-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-white border-gray-300"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  <option value="User">User</option>
                  <option value="Seller">Seller</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <Input
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button 
                onClick={handleUpdateUser}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Update User
              </Button>
              <Button 
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedUser(null)
                  resetForm()
                }}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete User</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedUser.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button 
                onClick={handleDeleteUser}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete User
              </Button>
              <Button 
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                }}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
