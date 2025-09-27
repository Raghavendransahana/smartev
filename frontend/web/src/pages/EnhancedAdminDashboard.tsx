import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { 
  Users, 
  TrendingUp, 
  Clock,
  XCircle,
  Eye,
  BarChart3,
  Database,
  Activity,
  Zap,
  Download,
  RefreshCw,
  MapPin,
  Battery,
  Car,
  Calendar,
  FileText,
  MessageSquare
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface AdminDashboardStats {
  regionUsers: number
  activeVehicles: number
  monthlyRegistrations: number
  pendingApprovals: number
  supportTickets: number
  regionStations: number
  batteryHealth: number
  weeklyTransactions: number
  regionPerformance: 'excellent' | 'good' | 'average' | 'needs_attention'
}

interface RegionActivity {
  id: string
  type: 'user_activity' | 'vehicle_registered' | 'ticket_created' | 'station_update' | 'battery_alert'
  description: string
  timestamp: string
  location?: string
  priority?: 'low' | 'medium' | 'high'
}

interface AdminTask {
  id: string
  type: 'user_approval' | 'document_review' | 'complaint_resolution' | 'vehicle_inspection'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  dueDate: string
  assignedTo?: string
  status: 'pending' | 'in_progress' | 'completed'
}

interface RegionMetrics {
  userSatisfaction: number
  averageResponseTime: number
  resolutionRate: number
  regionCoverage: number
  serviceQuality: number
}

const RegionStatsCard: React.FC<{
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'stable'
  icon: React.ReactNode
  color: string
  description?: string
}> = ({ title, value, change, trend, icon, color, description }) => (
  <Card className="p-6 border-gray-200 bg-white">
    <div className="flex items-center justify-between mb-3">
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
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
    {description && (
      <p className="text-xs text-gray-500 border-t pt-2">{description}</p>
    )}
  </Card>
)

const AdminTaskCard: React.FC<{ task: AdminTask; onAction: (id: string, action: string) => void }> = ({ task, onAction }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <Card className="p-4 border-gray-200 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-medium text-gray-900">{task.title}</h4>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            {task.assignedTo && <span>Assigned: {task.assignedTo}</span>}
          </div>
        </div>
        <Badge className={getStatusColor(task.status)}>
          {task.status.replace('_', ' ')}
        </Badge>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onAction(task.id, 'view')}
        >
          <Eye size={14} className="mr-1" />
          View
        </Button>
        {task.status === 'pending' && (
          <Button 
            size="sm" 
            onClick={() => onAction(task.id, 'start')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start
          </Button>
        )}
        {task.status === 'in_progress' && (
          <Button 
            size="sm" 
            onClick={() => onAction(task.id, 'complete')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Complete
          </Button>
        )}
      </div>
    </Card>
  )
}

const RegionActivityItem: React.FC<{ activity: RegionActivity }> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_activity': return <Users size={16} className="text-blue-600" />
      case 'vehicle_registered': return <Car size={16} className="text-emerald-600" />
      case 'ticket_created': return <MessageSquare size={16} className="text-orange-600" />
      case 'station_update': return <MapPin size={16} className="text-purple-600" />
      case 'battery_alert': return <Battery size={16} className="text-red-600" />
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
          {activity.location && (
            <span className="text-xs text-gray-500">• {activity.location}</span>
          )}
          {activity.priority && (
            <Badge 
              className={`text-xs ${
                activity.priority === 'high' ? 'bg-red-100 text-red-600' :
                activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-blue-100 text-blue-600'
              }`}
            >
              {activity.priority}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export const EnhancedAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [activities, setActivities] = useState<RegionActivity[]>([])
  const [tasks, setTasks] = useState<AdminTask[]>([])
  const [metrics, setMetrics] = useState<RegionMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  useEffect(() => {
    loadDashboardData()
    
    // Set up auto-refresh every 60 seconds
    const interval = setInterval(loadDashboardData, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      if (!refreshing) setLoading(true)
      setError(null)

      // TODO: Replace with actual API calls
      const [statsRes, activitiesRes, tasksRes, metricsRes] = await Promise.all([
        // apiService.getAdminDashboardStats(),
        // apiService.getRegionActivities(),
        // apiService.getAdminTasks(),
        // apiService.getRegionMetrics()
        
        // Mock API calls for now
        new Promise(resolve => setTimeout(() => resolve(mockAdminStats), 600)),
        new Promise(resolve => setTimeout(() => resolve(mockRegionActivities), 600)),
        new Promise(resolve => setTimeout(() => resolve(mockAdminTasks), 600)),
        new Promise(resolve => setTimeout(() => resolve(mockRegionMetrics), 600))
      ])

      setStats(statsRes as AdminDashboardStats)
      setActivities(activitiesRes as RegionActivity[])
      setTasks(tasksRes as AdminTask[])
      setMetrics(metricsRes as RegionMetrics)

    } catch (err) {
      console.error('Failed to load admin dashboard data:', err)
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

  const handleTaskAction = async (taskId: string, action: string) => {
    // TODO: Implement task action handling
    console.log('Task action:', taskId, action)
  }

  const filteredTasks = tasks.filter(task => 
    selectedFilter === 'all' || task.priority === selectedFilter || task.status === selectedFilter
  )

  // Mock data - replace with actual API integration
  const mockAdminStats: AdminDashboardStats = {
    regionUsers: 487,
    activeVehicles: 1234,
    monthlyRegistrations: 89,
    pendingApprovals: 7,
    supportTickets: 15,
    regionStations: 34,
    batteryHealth: 92,
    weeklyTransactions: 342,
    regionPerformance: 'good'
  }

  const mockRegionActivities: RegionActivity[] = [
    {
      id: '1',
      type: 'user_activity',
      description: 'New user registration from Tata Nexon EV owner',
      timestamp: '2024-09-27T11:15:00Z',
      location: 'Coimbatore, Tamil Nadu'
    },
    {
      id: '2',
      type: 'vehicle_registered',
      description: 'BMW iX successfully registered with battery certification',
      timestamp: '2024-09-27T10:30:00Z',
      location: 'Chennai, Tamil Nadu'
    },
    {
      id: '3',
      type: 'ticket_created',
      description: 'Battery performance concern reported',
      timestamp: '2024-09-27T09:45:00Z',
      location: 'Madurai, Tamil Nadu',
      priority: 'high'
    }
  ]

  const mockAdminTasks: AdminTask[] = [
    {
      id: '1',
      type: 'user_approval',
      title: 'User Identity Verification',
      description: 'Review documents for premium user upgrade',
      priority: 'high',
      dueDate: '2024-09-28T17:00:00Z',
      assignedTo: 'Current User',
      status: 'pending'
    },
    {
      id: '2',
      type: 'document_review',
      title: 'Battery Certificate Review',
      description: 'Validate battery health documentation for Model S',
      priority: 'medium',
      dueDate: '2024-09-29T12:00:00Z',
      status: 'in_progress'
    },
    {
      id: '3',
      type: 'complaint_resolution',
      title: 'Customer Service Escalation',
      description: 'Resolve charging station access issue',
      priority: 'low',
      dueDate: '2024-09-30T15:00:00Z',
      status: 'completed'
    }
  ]

  const mockRegionMetrics: RegionMetrics = {
    userSatisfaction: 87,
    averageResponseTime: 4.2,
    resolutionRate: 94,
    regionCoverage: 78,
    serviceQuality: 91
  }

  if (loading && !refreshing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Database className="animate-pulse mx-auto mb-4 text-blue-600" size={48} />
            <p className="text-gray-600">Loading admin dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Regional management and oversight</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge 
            className={`${
              stats?.regionPerformance === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
              stats?.regionPerformance === 'good' ? 'bg-blue-100 text-blue-700' :
              stats?.regionPerformance === 'average' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}
          >
            <BarChart3 size={14} className="mr-1" />
            {stats?.regionPerformance?.replace('_', ' ') || 'Loading...'}
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
        <RegionStatsCard
          title="Region Users"
          value={stats?.regionUsers.toLocaleString() || '0'}
          change="+5% this month"
          trend="up"
          icon={<Users size={24} className="text-white" />}
          color="bg-blue-500"
          description="Active users in your region"
        />
        <RegionStatsCard
          title="Active Vehicles"
          value={stats?.activeVehicles.toLocaleString() || '0'}
          change="+12 this week"
          trend="up"
          icon={<Car size={24} className="text-white" />}
          color="bg-emerald-500"
          description="Vehicles currently tracked"
        />
        <RegionStatsCard
          title="Support Tickets"
          value={stats?.supportTickets || 0}
          icon={<MessageSquare size={24} className="text-white" />}
          color="bg-orange-500"
          description="Open support requests"
        />
        <RegionStatsCard
          title="Pending Approvals"
          value={stats?.pendingApprovals || 0}
          icon={<Clock size={24} className="text-white" />}
          color="bg-purple-500"
          description="Items awaiting approval"
        />
      </div>

      {/* Management Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/users">
          <Card className="p-4 border-gray-200 bg-white hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">User Management</h4>
                <p className="text-sm text-gray-600">Manage regional users</p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
          </Card>
        </Link>

        <Link to="/admin/vehicles">
          <Card className="p-4 border-gray-200 bg-white hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Vehicle Mapping</h4>
                <p className="text-sm text-gray-600">Monitor vehicle status</p>
              </div>
              <Car className="text-emerald-600" size={24} />
            </div>
          </Card>
        </Link>

        <Link to="/admin/support">
          <Card className="p-4 border-gray-200 bg-white hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Support Center</h4>
                <p className="text-sm text-gray-600">Handle support tickets</p>
              </div>
              <MessageSquare className="text-orange-600" size={24} />
            </div>
          </Card>
        </Link>

        <Link to="/admin/reports">
          <Card className="p-4 border-gray-200 bg-white hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Reports</h4>
                <p className="text-sm text-gray-600">Generate reports</p>
              </div>
              <FileText className="text-purple-600" size={24} />
            </div>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Region Performance Metrics */}
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Region Performance</h3>
            <BarChart3 className="text-blue-600" size={20} />
          </div>
          
          {metrics && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">User Satisfaction</span>
                  <span className="text-sm font-medium">{metrics.userSatisfaction}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.userSatisfaction > 80 ? 'bg-emerald-500' : 
                      metrics.userSatisfaction > 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.userSatisfaction}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Resolution Rate</span>
                  <span className="text-sm font-medium">{metrics.resolutionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.resolutionRate > 90 ? 'bg-emerald-500' : 
                      metrics.resolutionRate > 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.resolutionRate}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Response Time</span>
                    <span className="font-medium">{metrics.averageResponseTime}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Region Coverage</span>
                    <span className="font-medium">{metrics.regionCoverage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Quality</span>
                    <span className="font-medium">{metrics.serviceQuality}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Recent Region Activity */}
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Region Activity</h3>
            <Activity className="text-green-600" size={20} />
          </div>
          
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <RegionActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </Card>

        {/* Admin Tasks */}
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
            <div className="flex items-center space-x-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="high">High Priority</option>
              </select>
              <Badge className="bg-blue-100 text-blue-700">
                {filteredTasks.length}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <AdminTaskCard 
                  key={task.id} 
                  task={task} 
                  onAction={handleTaskAction}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No tasks found</p>
            )}
          </div>
        </Card>
      </div>

      {/* Additional Region Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Monthly Registrations</p>
              <p className="text-xl font-bold text-gray-900">{stats?.monthlyRegistrations}</p>
            </div>
            <Calendar className="text-emerald-600" size={20} />
          </div>
        </Card>

        <Card className="p-4 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Region Stations</p>
              <p className="text-xl font-bold text-gray-900">{stats?.regionStations}</p>
            </div>
            <MapPin className="text-purple-600" size={20} />
          </div>
        </Card>

        <Card className="p-4 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Battery Health Avg</p>
              <p className="text-xl font-bold text-gray-900">{stats?.batteryHealth}%</p>
            </div>
            <Battery className="text-green-600" size={20} />
          </div>
        </Card>

        <Card className="p-4 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Weekly Transactions</p>
              <p className="text-xl font-bold text-gray-900">{stats?.weeklyTransactions}</p>
            </div>
            <Zap className="text-orange-600" size={20} />
          </div>
        </Card>
      </div>
    </div>
  )
}
