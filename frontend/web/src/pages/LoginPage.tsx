import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth, getRedirectPath } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Zap } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const { user, login, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  if (user) {
    return <Navigate to={getRedirectPath(user.role)} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const success = await login(formData.email, formData.password)
      if (success) {
        // User will be redirected automatically by the Navigate component
        // when the user state is updated
      } else {
        setError('Invalid credentials. Please check your email and password.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    if (error) setError('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-600/20">
            <Zap className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            SmartEV Platform
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enterprise EV lifecycle management system
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-gray-200 bg-white shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-gray-900">Sign in to continue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>

              {/* Forgot Password */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        {/* <Card className="border-gray-200 bg-white/50">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <Shield size={16} className="mr-2 text-emerald-400" />
              Demo Credentials
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-100/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield size={16} className="text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Super Admin</p>
                    <p className="text-xs text-gray-600">admin@smartev.com</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-700 text-emerald-400">
                  admin123
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-100/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users size={16} className="text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Brand Admin</p>
                    <p className="text-xs text-gray-600">brand@smartev.com</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-blue-700 text-blue-400">
                  admin123
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-100/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ShoppingCart size={16} className="text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sales Agent</p>
                    <p className="text-xs text-gray-600">agent@smartev.com</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-amber-700 text-amber-400">
                  admin123
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2025 SmartEV Platform. All rights reserved.</p>
          <p className="mt-1">Secure • Enterprise • Sustainable</p>
        </div>
      </div>
    </div>
  )
}