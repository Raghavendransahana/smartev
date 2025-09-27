import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, RoleBasedRedirect } from './components/auth/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { SuperAdminDashboard } from './pages/NewSuperAdminDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { EnhancedSuperAdminDashboard } from './pages/EnhancedSuperAdminDashboard'
import { EnhancedAdminDashboard } from './pages/EnhancedAdminDashboard'
import { SellerDashboard } from './pages/SellerDashboard'
import { SellerMarketplace } from './pages/SellerMarketplace'
import { SellerTransactions } from './pages/SellerTransactions'
import { SellerEcoAnalytics } from './pages/SellerEcoAnalytics'
import { UserManagement } from './pages/UserManagement'
import { EVStations } from './pages/EVStations'
import { VehicleBatteryManagement } from './pages/VehicleBatteryManagement'
import { ProfilePage } from './pages/ProfilePage'
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
                  <EnhancedSuperAdminDashboard />
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
            
            <Route path="/super-admin/stations" element={
              <ProtectedRoute requiredRoles={['Super Admin']}>
                <Layout>
                  <EVStations />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/super-admin/vehicles" element={
              <ProtectedRoute requiredRoles={['Super Admin']}>
                <Layout>
                  <VehicleBatteryManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/super-admin/analytics" element={
              <ProtectedRoute requiredRoles={['Super Admin']}>
                <Layout>
                  <SuperAdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout>
                  <EnhancedAdminDashboard />
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
            
            <Route path="/admin/stations" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout>
                  <EVStations />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/vehicles" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout>
                  <VehicleBatteryManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/support" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/reports" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout>
                  <SuperAdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/super-admin/vehicles" element={
              <ProtectedRoute requiredRoles={['Super Admin']}>
                <Layout>
                  <VehicleBatteryManagement />
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
            
            <Route path="/seller/marketplace" element={
              <ProtectedRoute requiredRoles={['Seller']}>
                <Layout>
                  <SellerMarketplace />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/seller/transactions" element={
              <ProtectedRoute requiredRoles={['Seller']}>
                <Layout>
                  <SellerTransactions />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/seller/eco-analytics" element={
              <ProtectedRoute requiredRoles={['Seller']}>
                <Layout>
                  <SellerEcoAnalytics />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Profile Routes - Available to all authenticated users */}
            <Route path="/profile" element={
              <ProtectedRoute requiredRoles={['Super Admin', 'Admin', 'Seller']}>
                <Layout>
                  <ProfilePage />
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
