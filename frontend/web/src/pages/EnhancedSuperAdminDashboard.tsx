import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { 
  Users, 
  Building2, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Shield,
  Database,
  Activity,
  Zap,
  Download,
  RefreshCw,
  UserCheck,
  UserX,
  MapPin,
  Battery,
  Car
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalAdmins: number
  totalSellers: number
  totalVehicles: number
  totalStations: number
  totalTransactions: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  pendingVerifications: number
  activeAlerts: number
}

interface RecentActivity {
  id: string
  type: 'user_registered' | 'admin_created' | 'station_added' | 'transaction_completed' | 'alert_raised'
  description: string
  timestamp: string
  userId?: string
  userName?: string
  severity?: 'low' | 'medium' | 'high'
}

interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  activeConnections: number
  apiResponseTime: number
  uptime: string
}

interface PendingAction {
  id: string
  type: 'user_verification' | 'admin_approval' | 'station_review' | 'complaint_escalation'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  createdAt: string
  requiredAction: string
}

const QuickStatsCard: React.FC<{
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'stable'
  icon: React.ReactNode
  color: string
}> = ({ title, value, change, trend, icon, color }) => (
  <Card className="p-6 border-gray-200 bg-white">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <p className={`text-sm mt-1 flex items-center ${
            trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' && <TrendingUp size={14} className="mr-1" />}
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </Card>
)

const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered': return <UserCheck size={16} className="text-emerald-600" />
      case 'admin_created': return <Shield size={16} className="text-blue-600" />
      case 'station_added': return <MapPin size={16} className="text-purple-600" />
      case 'transaction_completed': return <CheckCircle size={16} className="text-green-600" />
      case 'alert_raised': return <AlertTriangle size={16} className="text-red-600" />
      default: return <Activity size={16} className="text-gray-600" />
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0 mt-1">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.description}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</span>
          {activity.userName && (
            <span className="text-xs text-gray-500">• {activity.userName}</span>
          )}
        </div>
      </div>
    </div>
  )
}

const PendingActionCard: React.FC<{ action: PendingAction; onAction: (id: string) => void }> = ({ action, onAction }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <Card className="p-4 border-gray-200 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{action.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{action.description}</p>
        </div>
        <Badge className={getPriorityColor(action.priority)}>
          {action.priority}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {new Date(action.createdAt).toLocaleDateString()}
        </span>
        <Button 
          size="sm" 
          onClick={() => onAction(action.id)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {action.requiredAction}
        </Button>
      </div>
    </Card>
  )
}

export const EnhancedSuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      if (!refreshing) setLoading(true)
      setError(null)

      // TODO: Replace with actual API calls
      const [statsRes, activitiesRes, metricsRes, actionsRes] = await Promise.all([
        // apiService.getDashboardStats(),
        // apiService.getRecentActivities(),
        // apiService.getSystemMetrics(),
        // apiService.getPendingActions()
        
        // Mock API calls for now
        new Promise(resolve => setTimeout(() => resolve(mockStats), 500)),
        new Promise(resolve => setTimeout(() => resolve(mockActivities), 500)),
        new Promise(resolve => setTimeout(() => resolve(mockMetrics), 500)),
        new Promise(resolve => setTimeout(() => resolve(mockPendingActions), 500))
      ])

      setStats(statsRes as DashboardStats)
      setActivities(activitiesRes as RecentActivity[])
      setSystemMetrics(metricsRes as SystemMetrics)
      setPendingActions(actionsRes as PendingAction[])

    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadDashboardData()
  }

  const handlePendingAction = async (actionId: string) => {
    // TODO: Implement action handling
    console.log('Handling action:', actionId)
  }

  // Mock data - replace with actual API integration
  const mockStats: DashboardStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalAdmins: 23,
    totalSellers: 156,
    totalVehicles: 3420,
    totalStations: 89,
    totalTransactions: 15678,
    systemHealth: 'healthy',
    pendingVerifications: 12,
    activeAlerts: 3
  }

  const mockActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'user_registered',
      description: 'New user registered from Tamil Nadu',
      timestamp: '2024-09-27T10:30:00Z',
      userName: 'John Smith'
    },
    {
      id: '2',
      type: 'admin_created',
      description: 'New admin account created for Tata Motors',
      timestamp: '2024-09-27T09:15:00Z',
      userName: 'Admin System'
    },
    {
      id: '3',
      type: 'alert_raised',
      description: 'High battery degradation detected on Model S',
      timestamp: '2024-09-27T08:45:00Z',
      severity: 'high'
    }
  ]

  const mockMetrics: SystemMetrics = {
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 78,
    activeConnections: 234,
    apiResponseTime: 145,
    uptime: '7d 12h 34m'
  }

  const mockPendingActions: PendingAction[] = [
    {
      id: '1',
      type: 'user_verification',
      title: 'User Identity Verification',
      description: 'John Doe from BMW requires identity verification',
      priority: 'high',
      createdAt: '2024-09-27T08:00:00Z',
      requiredAction: 'Review'
    },
    {
      id: '2',
      type: 'admin_approval',
      title: 'Admin Access Request',
      description: 'Sarah Johnson requesting admin privileges',
      priority: 'medium',
      createdAt: '2024-09-26T15:30:00Z',
      requiredAction: 'Approve'
    }
  ]

  if (loading && !refreshing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Database className="animate-pulse mx-auto mb-4 text-blue-600" size={48} />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <XCircle className="mx-auto mb-4 text-red-600" size={48} />
            <p className="text-gray-900 font-medium mb-2">Failed to load dashboard</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and system management</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge 
            className={`${
              stats?.systemHealth === 'healthy' ? 'bg-emerald-100 text-emerald-700' :
              stats?.systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}
          >
            <Activity size={14} className="mr-1" />
            System {stats?.systemHealth || 'Unknown'}
          </Badge>
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            disabled={refreshing}
            size="sm"
          >
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button size="sm">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickStatsCard
          title="Total Users"
          value={stats?.totalUsers.toLocaleString() || '0'}
          change="+12% this month"
          trend="up"
          icon={<Users size={24} className="text-white" />}
          color="bg-blue-500"
        />
        <QuickStatsCard
          title="Active Users"
          value={stats?.activeUsers.toLocaleString() || '0'}
          change="+8% this week"
          trend="up"
          icon={<UserCheck size={24} className="text-white" />}
          color="bg-emerald-500"
        />
        <QuickStatsCard
          title="Total Vehicles"
          value={stats?.totalVehicles.toLocaleString() || '0'}
          change="+156 this month"
          trend="up"
          icon={<Car size={24} className="text-white" />}
          color="bg-purple-500"
        />
        <QuickStatsCard
          title="Active Alerts"
          value={stats?.activeAlerts || 0}
          icon={<AlertTriangle size={24} className="text-white" />}
          color="bg-red-500"
        />
      </div>

      {/* Management Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/super-admin/users">
          <Card className="p-4 border-gray-200 bg-white hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">User Management</h4>
                <p className="text-sm text-gray-600">{stats?.totalUsers} total users</p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
          </Card>
        </Link>

        <Link to="/super-admin/stations">
          <Card className="p-4 border-gray-200 bg-white hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">EV Stations</h4>
                <p className="text-sm text-gray-600">{stats?.totalStations} stations</p>
              </div>
              <MapPin className="text-emerald-600" size={24} />
            </div>
          </Card>
        </Link>

        <Link to="/super-admin/vehicles">
          <Card className="p-4 border-gray-200 bg-white hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Vehicle & Battery</h4>
                <p className="text-sm text-gray-600">{stats?.totalVehicles} vehicles</p>
              </div>
              <Battery className="text-purple-600" size={24} />
            </div>
          </Card>
        </Link>

        <Link to="/super-admin/analytics">
          <Card className="p-4 border-gray-200 bg-white hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Analytics</h4>
                <p className="text-sm text-gray-600">System insights</p>
              </div>
              <BarChart3 className="text-orange-600" size={24} />
            </div>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Metrics */}
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Performance</h3>
            <Activity className="text-blue-600" size={20} />
          </div>
          
          {systemMetrics && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">CPU Usage</span>
                  <span className="text-sm font-medium">{systemMetrics.cpuUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      systemMetrics.cpuUsage > 80 ? 'bg-red-500' : 
                      systemMetrics.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${systemMetrics.cpuUsage}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <span className="text-sm font-medium">{systemMetrics.memoryUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      systemMetrics.memoryUsage > 80 ? 'bg-red-500' : 
                      systemMetrics.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${systemMetrics.memoryUsage}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">API Response</span>
                    <p className="font-medium">{systemMetrics.apiResponseTime}ms</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Uptime</span>
                    <p className="font-medium">{systemMetrics.uptime}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Connections</span>
                    <p className="font-medium">{systemMetrics.activeConnections}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Disk Usage</span>
                    <p className="font-medium">{systemMetrics.diskUsage}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Clock className="text-green-600" size={20} />
          </div>
          
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </Card>

        {/* Pending Actions */}
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Actions</h3>
            <Badge className="bg-yellow-100 text-yellow-700">
              {pendingActions.length}
            </Badge>
          </div>
          
          <div className="space-y-4">
            {pendingActions.length > 0 ? (
              pendingActions.map((action) => (
                <PendingActionCard 
                  key={action.id} 
                  action={action} 
                  onAction={handlePendingAction}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No pending actions</p>
            )}
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Admins</p>
              <p className="text-xl font-bold text-gray-900">{stats?.totalAdmins}</p>
            </div>
            <Shield className="text-blue-600" size={20} />
          </div>
        </Card>

        <Card className="p-4 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Sellers</p>
              <p className="text-xl font-bold text-gray-900">{stats?.totalSellers}</p>
            </div>
            <Building2 className="text-emerald-600" size={20} />
          </div>
        </Card>

        <Card className="p-4 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Transactions</p>
              <p className="text-xl font-bold text-gray-900">{stats?.totalTransactions.toLocaleString()}</p>
            </div>
            <Zap className="text-purple-600" size={20} />
          </div>
        </Card>

        <Card className="p-4 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Verifications</p>
              <p className="text-xl font-bold text-gray-900">{stats?.pendingVerifications}</p>
            </div>
            <UserX className="text-orange-600" size={20} />
          </div>
        </Card>
      </div>
    </div>
  )
}
