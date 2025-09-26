import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Zap } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const { user, login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Admin',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  if (user) {
    const redirectPath = user.role === 'Super Admin' ? '/super-admin' 
                       : user.role === 'Admin' ? '/admin'
                       : '/seller'
    return <Navigate to={redirectPath} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const success = await login(formData.email, formData.password, formData.role)
      if (success) {
        const redirectPath = formData.role === 'Super Admin' ? '/super-admin'
                            : formData.role === 'Admin' ? '/admin'
                            : '/seller'
        navigate(redirectPath)
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-600/20">
            <Zap className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-bold text-zinc-100">
            SmartEV Platform
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Enterprise EV lifecycle management system
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-zinc-800 bg-zinc-900 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-zinc-100">Sign in to continue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-400 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-400 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Select Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:ring-emerald-500 focus:border-emerald-500 focus:ring-2"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Brand Admin</option>
                  <option value="Seller">Sales Agent</option>
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/50 border border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-300">{error}</p>
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
                  className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        {/* <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center">
              <Shield size={16} className="mr-2 text-emerald-400" />
              Demo Credentials
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield size={16} className="text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Super Admin</p>
                    <p className="text-xs text-zinc-400">admin@smartev.com</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-700 text-emerald-400">
                  admin123
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users size={16} className="text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Brand Admin</p>
                    <p className="text-xs text-zinc-400">brand@smartev.com</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-blue-700 text-blue-400">
                  admin123
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ShoppingCart size={16} className="text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Sales Agent</p>
                    <p className="text-xs text-zinc-400">agent@smartev.com</p>
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
        <div className="text-center text-xs text-zinc-500">
          <p>© 2025 SmartEV Platform. All rights reserved.</p>
          <p className="mt-1">Secure • Enterprise • Sustainable</p>
        </div>
      </div>
    </div>
  )
}