import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  CheckCircle,
  Clock,
  Edit,
  Save,
  X,
  Camera,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react'
import { apiService, type UpdateProfileData } from '../services/api.service'

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Fetch current user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        const profile = await apiService.getCurrentUser()
        setProfileData(profile)
        
        // Split name into first and last name for editing
        const nameParts = profile.name?.split(' ') || ['', '']
        setFormData(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          phone: '' // Phone might not be available in current user object
        }))
      } catch (err: any) {
        if (err.message === 'Authentication required') {
          // Redirect to login if authentication fails
          navigate('/login')
          return
        }
        setError('Failed to load profile data. Please try again.')
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear messages when user starts typing
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required')
      return false
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return false
    }

    if (formData.newPassword && !formData.currentPassword) {
      setError('Current password is required when setting a new password')
      return false
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long')
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      setError(null)

      const updateData: UpdateProfileData = {
        profile: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim() || undefined
        }
      }

      // Add password change if provided
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const response = await apiService.updateProfile(updateData)
      
      // Update the profile data
      setProfileData(response.user)
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))

      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      
      // Refresh user context if needed
      await refreshUser()
      
    } catch (err: any) {
      if (err.message === 'Authentication required') {
        navigate('/login')
        return
      }
      setError(err.response?.data?.message || 'Failed to update profile')
      console.error('Error updating profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (profileData) {
      const nameParts = profileData.name?.split(' ') || ['', '']
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
    setIsEditing(false)
    setError(null)
    setSuccess(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'inactive': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'bg-purple-100 text-purple-700'
      case 'Admin': return 'bg-blue-100 text-blue-700'
      case 'Seller': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading && !profileData) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="flex items-center space-x-2">
            <Edit size={16} />
            <span>Edit Profile</span>
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <X size={16} />
              <span>Cancel</span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center">
              {/* Avatar */}
              <div className="relative mx-auto w-24 h-24 mb-4">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User className="text-emerald-600" size={32} />
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-emerald-600 rounded-full p-1.5 text-white hover:bg-emerald-700">
                    <Camera size={12} />
                  </button>
                )}
              </div>

              {/* Basic Info */}
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {profileData?.name || 'Loading...'}
              </h3>
              
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Badge className={getRoleColor(user?.role || '')}>
                  <Shield size={12} className="mr-1" />
                  {user?.role}
                </Badge>
                <Badge className={getStatusColor('active')}>
                  <CheckCircle size={12} className="mr-1" />
                  Active
                </Badge>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Calendar size={14} />
                  <span>Joined September 2024</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock size={14} />
                  <span>Last active: Today</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6 mt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Logins</span>
                <span className="text-sm font-medium">342</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Profile Views</span>
                <span className="text-sm font-medium">89</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Actions This Month</span>
                <span className="text-sm font-medium">156</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
            
            {/* Error and Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center">
                <CheckCircle size={16} className="mr-2" />
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-1" />
                  First Name
                </label>
                {isEditing ? (
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{formData.firstName || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-1" />
                  Last Name
                </label>
                {isEditing ? (
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{formData.lastName || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-1" />
                  Email Address
                </label>
                <p className="text-gray-900 bg-gray-100 p-2 rounded cursor-not-allowed">
                  {profileData?.email || 'Loading...'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-1" />
                  Phone Number
                </label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{formData.phone || 'Not provided'}</p>
                )}
              </div>

              {/* Password Change Section */}
              {isEditing && (
                <>
                  <div className="md:col-span-2">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3 border-t pt-4">
                      Change Password (Optional)
                    </h5>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="Enter new password (min 8 chars)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* System Information */}
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">System Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded font-mono text-sm">{profileData?._id || 'Loading...'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{profileData?.role || 'Loading...'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">
                  {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Loading...'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">
                  {profileData?.updatedAt ? new Date(profileData.updatedAt).toLocaleDateString() : 'Loading...'}
                </p>
              </div>
            </div>
          </Card>

          {/* Permissions */}
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Permissions & Access</h4>
            <div className="flex flex-wrap gap-2">
              {[
                'Dashboard Access',
                'User Management',
                'Station Management',
                'Vehicle Monitoring',
                'Analytics View',
                'Report Generation'
              ].map((permission) => (
                <Badge key={permission} variant="secondary" className="bg-emerald-50 text-emerald-700">
                  <CheckCircle size={12} className="mr-1" />
                  {permission}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
