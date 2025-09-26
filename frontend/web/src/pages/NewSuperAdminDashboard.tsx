import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { 
  Users, 
  Building2, 
  AlertTriangle, 
  Recycle, 
  TrendingUp, 
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  brand: string
  status: 'active' | 'inactive' | 'pending'
  lastLogin: string
  usersManaged: number
}

interface Complaint {
  id: string
  title: string
  type: 'battery' | 'charging' | 'ownership' | 'app'
  status: 'open' | 'in-progress' | 'resolved'
  user: string
  assignedTo: string
  priority: 'high' | 'medium' | 'low'
  createdAt: string
}

interface BrandPerformance {
  id: string
  name: string
  logo: string
  adoptionRate: number
  activeUsers: number
  evStations: number
  complaints: number
  growthTrend: number
}

const AdminTable: React.FC<{ admins: AdminUser[] }> = ({ admins }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-zinc-800">
          <th className="text-left p-4 text-zinc-300 font-medium">Admin</th>
          <th className="text-left p-4 text-zinc-300 font-medium">Brand</th>
          <th className="text-left p-4 text-zinc-300 font-medium">Status</th>
          <th className="text-left p-4 text-zinc-300 font-medium">Users</th>
          <th className="text-left p-4 text-zinc-300 font-medium">Last Login</th>
          <th className="text-left p-4 text-zinc-300 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {admins.map((admin) => (
          <tr key={admin.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
            <td className="p-4">
              <div>
                <div className="font-medium text-zinc-100">{admin.name}</div>
                <div className="text-sm text-zinc-400">{admin.email}</div>
              </div>
            </td>
            <td className="p-4 text-zinc-300">{admin.brand}</td>
            <td className="p-4">
              <Badge 
                variant={admin.status === 'active' ? 'default' : admin.status === 'pending' ? 'secondary' : 'destructive'}
                className={admin.status === 'active' ? 'bg-emerald-900 text-emerald-400' : ''}
              >
                {admin.status}
              </Badge>
            </td>
            <td className="p-4 text-zinc-300">{admin.usersManaged}</td>
            <td className="p-4 text-zinc-400 text-sm">{admin.lastLogin}</td>
            <td className="p-4">
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                  <Eye size={16} />
                </Button>
                <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                  <Edit size={16} />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                  <Trash2 size={16} />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const ComplaintCard: React.FC<{ complaint: Complaint }> = ({ complaint }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'battery': return 'bg-blue-900 text-blue-400'
      case 'charging': return 'bg-yellow-900 text-yellow-400'
      case 'ownership': return 'bg-purple-900 text-purple-400'
      case 'app': return 'bg-red-900 text-red-400'
      default: return 'bg-zinc-800 text-zinc-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock size={16} className="text-amber-400" />
      case 'in-progress': return <TrendingUp size={16} className="text-blue-400" />
      case 'resolved': return <CheckCircle size={16} className="text-emerald-400" />
      default: return <XCircle size={16} className="text-red-400" />
    }
  }

  return (
    <Card className="p-4 border-zinc-800 bg-zinc-900 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(complaint.status)}
          <h4 className="font-medium text-zinc-100 truncate">{complaint.title}</h4>
        </div>
        <Badge className={`text-xs ${getTypeColor(complaint.type)}`}>
          {complaint.type}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-400">User:</span>
          <span className="text-zinc-300">{complaint.user}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Assigned to:</span>
          <span className="text-zinc-300">{complaint.assignedTo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Priority:</span>
          <Badge 
            variant={complaint.priority === 'high' ? 'destructive' : complaint.priority === 'medium' ? 'secondary' : 'outline'}
            className="text-xs"
          >
            {complaint.priority}
          </Badge>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center">
        <span className="text-xs text-zinc-500">{complaint.createdAt}</span>
        <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
          View Details
        </Button>
      </div>
    </Card>
  )
}

const BrandCard: React.FC<{ brand: BrandPerformance }> = ({ brand }) => (
  <Card className="p-6 border-zinc-800 bg-zinc-900">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
          <Building2 className="text-zinc-400" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-100">{brand.name}</h3>
          <p className="text-sm text-zinc-400">{brand.adoptionRate}% adoption</p>
        </div>
      </div>
      <Badge 
        variant={brand.growthTrend > 0 ? 'default' : 'destructive'}
        className={brand.growthTrend > 0 ? 'bg-emerald-900 text-emerald-400' : ''}
      >
        {brand.growthTrend > 0 ? '+' : ''}{brand.growthTrend}%
      </Badge>
    </div>
    
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <p className="text-2xl font-bold text-zinc-100">{brand.activeUsers}</p>
        <p className="text-xs text-zinc-400">Users</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-100">{brand.evStations}</p>
        <p className="text-xs text-zinc-400">Stations</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-100">{brand.complaints}</p>
        <p className="text-xs text-zinc-400">Issues</p>
      </div>
    </div>
  </Card>
)

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'admins' | 'brands' | 'complaints'>('overview')

  // Mock data
  const admins: AdminUser[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@tesla.com',
      brand: 'Tesla',
      status: 'active',
      lastLogin: '2 hours ago',
      usersManaged: 1247
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@bmw.com',
      brand: 'BMW',
      status: 'active',
      lastLogin: '1 day ago',
      usersManaged: 892
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@nissan.com',
      brand: 'Nissan',
      status: 'pending',
      lastLogin: 'Never',
      usersManaged: 0
    }
  ]

  const complaints: Complaint[] = [
    {
      id: '1',
      title: 'Battery degradation issue with Model S',
      type: 'battery',
      status: 'open',
      user: 'nandha',
      assignedTo: 'kavin',
      priority: 'high',
      createdAt: '2 hours ago'
    },
    {
      id: '2',
      title: 'Charging station not working',
      type: 'charging',
      status: 'in-progress',
      user: 'Mithran',
      assignedTo: 'Bala ',
      priority: 'medium',
      createdAt: '5 hours ago'
    },
    {
      id: '3',
      title: 'Ownership transfer failed',
      type: 'ownership',
      status: 'resolved',
      user: 'sajith',
      assignedTo: 'sahana',
      priority: 'low',
      createdAt: '1 day ago'
    }
  ]

  const brands: BrandPerformance[] = [
    {
      id: '1',
      name: 'Tesla',
      logo: '',
      adoptionRate: 87,
      activeUsers: 1247,
      evStations: 89,
      complaints: 12,
      growthTrend: 15
    },
    {
      id: '2',
      name: 'BMW',
      logo: '',
      adoptionRate: 64,
      activeUsers: 892,
      evStations: 56,
      complaints: 8,
      growthTrend: 8
    },
    {
      id: '3',
      name: 'Nissan',
      logo: '',
      adoptionRate: 52,
      activeUsers: 623,
      evStations: 34,
      complaints: 5,
      growthTrend: -2
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Super Admin Dashboard</h1>
          <p className="text-zinc-400">Platform overview and management</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus size={16} className="mr-2" />
            Add Admin
          </Button>
          <Badge variant="outline" className="border-zinc-700 text-zinc-300">
            Super Admin • {user?.email}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-zinc-800 bg-zinc-900">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-900 rounded-lg">
              <Users className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-zinc-100">2,762</p>
              <p className="text-emerald-400 text-xs">+12% from last month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-zinc-800 bg-zinc-900">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-900 rounded-lg">
              <Building2 className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Brand Admins</p>
              <p className="text-2xl font-bold text-zinc-100">24</p>
              <p className="text-emerald-400 text-xs">3 active brands</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-zinc-800 bg-zinc-900">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-900 rounded-lg">
              <AlertTriangle className="text-amber-400" size={24} />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Open Complaints</p>
              <p className="text-2xl font-bold text-zinc-100">25</p>
              <p className="text-red-400 text-xs">8 high priority</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-zinc-800 bg-zinc-900">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-900 rounded-lg">
              <Recycle className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Recycled Batteries</p>
              <p className="text-2xl font-bold text-zinc-100">1,456</p>
              <p className="text-emerald-400 text-xs">847kg CO₂ saved</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-zinc-900 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'admins', label: 'Admins' },
          { id: 'brands', label: 'Brands' },
          { id: 'complaints', label: 'Complaints' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-zinc-800 bg-zinc-900">
            <h3 className="text-xl font-semibold text-zinc-100 mb-4">Brand Performance</h3>
            <div className="space-y-4">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          </Card>

          <Card className="p-6 border-zinc-800 bg-zinc-900">
            <h3 className="text-xl font-semibold text-zinc-100 mb-4">Recent Complaints</h3>
            <div className="space-y-4">
              {complaints.slice(0, 3).map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'admins' && (
        <Card className="border-zinc-800 bg-zinc-900">
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-zinc-100">Brand Admins</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={16} />
                  <Input 
                    placeholder="Search admins..." 
                    className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  <Filter size={16} className="mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>
          <AdminTable admins={admins} />
        </Card>
      )}

      {activeTab === 'brands' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  )
}