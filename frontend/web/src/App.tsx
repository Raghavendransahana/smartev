import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, RoleBasedRedirect } from './components/auth/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { SuperAdminDashboard } from './pages/NewSuperAdminDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { SellerDashboard } from './pages/SellerDashboard'
import { UserManagement } from './pages/UserManagement'
import { Layout } from './components/layout/Layout'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/super-admin" element={
              <ProtectedRoute requiredRoles={['Super Admin']}>
                <Layout>
                  <SuperAdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/super-admin/users" element={
              <ProtectedRoute requiredRoles={['Super Admin']}>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/seller" element={
              <ProtectedRoute requiredRoles={['Seller']}>
                <Layout>
                  <SellerDashboard />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Role-based redirect for root */}
            <Route path="/" element={<RoleBasedRedirect />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
