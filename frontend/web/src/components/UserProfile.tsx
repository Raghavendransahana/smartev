import React from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  ArrowLeft
} from 'lucide-react'

interface UserProfileProps {
  userId: string
  onBack: () => void
  onEdit: () => void
}

interface UserDetail {
  id: string
  name: string
  email: string
  phone: string
  role: 'Super Admin' | 'Admin' | 'Seller' | 'User'
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  lastLogin: string
  department: string
  avatar?: string
  permissions: string[]
  lastActivity: string
  totalLogins: number
  ipAddress: string
}

// Mock user data
const mockUserDetail: UserDetail = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@smartev.com',
  phone: '+1 234 567 8900',
  role: 'Admin',
  status: 'active',
  createdAt: '2024-01-15',
  lastLogin: '2025-09-27 14:30:00',
  department: 'Operations',
  permissions: ['users.read', 'users.create', 'users.update', 'stations.read', 'analytics.read'],
  lastActivity: '2025-09-27 15:45:00',
  totalLogins: 142,
  ipAddress: '192.168.1.100'
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onBack, onEdit }) => {
  // In a real app, you would fetch user data by userId
  // For now, using mock data
  console.log('Loading profile for user ID:', userId);
  const user = mockUserDetail

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={onBack}
            variant="outline"
            className="border-gray-300 text-gray-700"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
            <p className="text-gray-600">View and manage user details</p>
          </div>
        </div>
        <Button 
          onClick={onEdit}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Edit size={16} className="mr-2" />
          Edit User
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-gray-200 bg-white">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-700">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600">ID: {user.id}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(user.status)}
                      <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                        {user.status}
                      </Badge>
                    </div>
                    <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact Information</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-gray-900">{user.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Department</label>
                  <div className="mt-2 flex items-center space-x-2">
                    <Building2 size={16} className="text-gray-400" />
                    <span className="text-gray-900">{user.department}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Details</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-900">Created: {user.createdAt}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield size={16} className="text-gray-400" />
                      <span className="text-gray-900">Role: {user.role}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Activity</label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-900">Last Login: {user.lastLogin}</p>
                    <p className="text-sm text-gray-900">Total Logins: {user.totalLogins}</p>
                    <p className="text-sm text-gray-900">IP Address: {user.ipAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Permissions Card */}
          <Card className="p-6 border-gray-200 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
            <div className="space-y-2">
              {user.permissions.map((permission, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-emerald-600" />
                  <span className="text-sm text-gray-700">{permission}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6 border-gray-200 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                  {user.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Logins</span>
                <span className="text-sm font-medium text-gray-900">{user.totalLogins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Activity</span>
                <span className="text-sm text-gray-900">{user.lastActivity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm text-gray-900">{user.createdAt}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6 border-gray-200 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                onClick={onEdit}
              >
                <Edit size={16} className="mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="outline"
                className="w-full justify-start border-gray-300 text-gray-700"
              >
                <Mail size={16} className="mr-2" />
                Send Message
              </Button>
              <Button 
                variant="outline"
                className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50"
              >
                Reset Password
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
