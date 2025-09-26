import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Bell, Settings, Users, Building2, AlertTriangle, Recycle } from 'lucide-react'

interface SetupStepProps {
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  onAction: () => void
}

const SetupStep: React.FC<SetupStepProps> = ({ title, description, icon, completed, onAction }) => (
  <Card className="p-6 hover:shadow-lg transition-shadow border-gray-200 bg-white">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${completed ? 'bg-emerald-900 text-emerald-400' : 'bg-gray-100 text-gray-600'}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Badge variant={completed ? 'default' : 'secondary'} className={completed ? 'bg-emerald-900 text-emerald-400' : ''}>
          {completed ? 'Complete' : 'Pending'}
        </Badge>
        {!completed && (
          <Button onClick={onAction} size="sm" variant="outline" className="border-zinc-700 text-gray-700 hover:bg-gray-100">
            Setup
          </Button>
        )}
      </div>
    </div>
  </Card>
)

export const AdminDashboard: React.FC = () => {
  const { user, updateUser } = useAuth()
  const [showSetup, setShowSetup] = React.useState(user?.isFirstLogin || false)

  const setupSteps = [
    {
      id: 'brand-setup',
      title: 'Brand Configuration',
      description: 'Upload brand logo, configure settings, and set up brand preferences',
      icon: <Building2 size={20} />,
      completed: false,
    },
    {
      id: 'vehicle-data',
      title: 'Vehicle Data Upload',
      description: 'Upload vehicle datasets, images, and specifications',
      icon: <Users size={20} />,
      completed: false,
    },
    {
      id: 'stations',
      title: 'EV Stations Setup',
      description: 'Add charging stations, service centers, and maintenance facilities',
      icon: <Settings size={20} />,
      completed: false,
    },
    {
      id: 'bms-integration',
      title: 'BMS/VCU/TCU Integration',
      description: 'Configure Battery Management System and vehicle control units',
      icon: <AlertTriangle size={20} />,
      completed: false,
    },
  ]

  const handleSetupAction = (stepId: string) => {
    console.log(`Setting up ${stepId}`)
    // Handle setup action based on step
  }

  const completeSetup = () => {
    setShowSetup(false)
    updateUser({ isFirstLogin: false })
    localStorage.setItem(`setup_complete_${user?.email}`, 'true')
  }

  if (showSetup) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SmartEV Platform</h1>
            <p className="text-gray-600 text-lg">Let's get your admin account set up with these essential configurations</p>
            <div className="mt-4">
              <Badge variant="outline" className="border-zinc-700 text-gray-700">
                Brand Admin • {user?.email}
              </Badge>
            </div>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4 mb-8">
            {setupSteps.map((step) => (
              <SetupStep
                key={step.id}
                title={step.title}
                description={step.description}
                icon={step.icon}
                completed={step.completed}
                onAction={() => handleSetupAction(step.id)}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button onClick={completeSetup} variant="outline" className="border-zinc-700 text-gray-700 hover:bg-gray-100">
              Skip Setup
            </Button>
            <Button onClick={completeSetup} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Complete Setup Later
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Regular Admin Dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, stations, and brand operations</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="border-zinc-700 text-gray-700 hover:bg-gray-100">
            <Bell size={16} className="mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm" className="border-zinc-700 text-gray-700 hover:bg-gray-100">
            <Settings size={16} className="mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-900 rounded-lg">
              <Users className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
              <p className="text-emerald-400 text-xs">+12% from last month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-900 rounded-lg">
              <Building2 className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">EV Stations</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
              <p className="text-emerald-400 text-xs">+3 new this week</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-900 rounded-lg">
              <AlertTriangle className="text-amber-400" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Open Complaints</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-red-400 text-xs">3 high priority</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-900 rounded-lg">
              <Recycle className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Recycled Batteries</p>
              <p className="text-2xl font-bold text-gray-900">456</p>
              <p className="text-emerald-400 text-xs">342kg CO₂ saved</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-gray-200 bg-white">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users size={16} className="mr-2" />
              Manage Users
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Building2 size={16} className="mr-2" />
              Add EV Station
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <AlertTriangle size={16} className="mr-2" />
              Raise Complaint
            </Button>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">New user registered</span>
              <span className="text-gray-500">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">EV station added</span>
              <span className="text-gray-500">1 day ago</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Complaint resolved</span>
              <span className="text-gray-500">2 days ago</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}