import React from 'react'
import { 
  BoltIcon,
  UsersIcon,
  MapPinIcon,
  Battery0Icon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { StatsCard } from '../components/dashboard/StatsCard'
import { Chart } from '../components/dashboard/Chart'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { PageWrapper } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'

// Mock data
const userEngagementData = [
  { month: 'Jan', users: 1200, admins: 45 },
  { month: 'Feb', users: 1350, admins: 52 },
  { month: 'Mar', users: 1480, admins: 48 },
  { month: 'Apr', users: 1620, admins: 55 },
  { month: 'May', users: 1780, admins: 62 },
  { month: 'Jun', users: 1950, admins: 58 },
]

const brandPerformanceData = [
  { name: 'Tesla', adoption: 85, activity: 92, contribution: 78 },
  { name: 'BYD', adoption: 72, activity: 88, contribution: 65 },
  { name: 'Mercedes', adoption: 68, activity: 75, contribution: 72 },
  { name: 'BMW', adoption: 65, activity: 82, contribution: 58 },
  { name: 'Audi', adoption: 62, activity: 79, contribution: 61 },
]

const recentActivities = [
  { id: 1, action: 'Battery passport created', user: 'Tesla Admin', time: '2 mins ago', type: 'passport' },
  { id: 2, action: 'Ownership transfer completed', user: 'John Smith', time: '15 mins ago', type: 'transfer' },
  { id: 3, action: 'Station added', user: 'Mercedes Admin', time: '1 hour ago', type: 'station' },
  { id: 4, action: 'User registered', user: 'Alice Johnson', time: '2 hours ago', type: 'user' },
  { id: 5, action: 'Complaint resolved', user: 'Support Team', time: '4 hours ago', type: 'complaint' },
]

export const SuperAdminDashboard: React.FC = () => {
  return (
    <PageWrapper
      title="Super Admin Dashboard"
      description="Comprehensive overview of the EV lifecycle management platform"
      actions={
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button variant="default" size="sm">
            Add Admin
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Users Today"
            value="1,247"
            change={{ value: 12.5, type: 'increase' }}
            icon={<UsersIcon className="h-6 w-6 text-primary-600" />}
            trend={[
              { value: 1100 }, { value: 1150 }, { value: 1200 }, 
              { value: 1180 }, { value: 1220 }, { value: 1247 }
            ]}
          />
          <StatsCard
            title="EV Stations"
            value="342"
            change={{ value: 8.2, type: 'increase' }}
            icon={<MapPinIcon className="h-6 w-6 text-primary-600" />}
            trend={[
              { value: 310 }, { value: 315 }, { value: 325 }, 
              { value: 335 }, { value: 338 }, { value: 342 }
            ]}
          />
          <StatsCard
            title="Battery Passports"
            value="15,423"
            change={{ value: 15.7, type: 'increase' }}
            icon={<Battery0Icon className="h-6 w-6 text-primary-600" />}
            trend={[
              { value: 13200 }, { value: 13800 }, { value: 14200 }, 
              { value: 14800 }, { value: 15100 }, { value: 15423 }
            ]}
          />
          <StatsCard
            title="Pending Complaints"
            value="7"
            change={{ value: 30.0, type: 'decrease' }}
            icon={<ChartBarIcon className="h-6 w-6 text-primary-600" />}
            trend={[
              { value: 12 }, { value: 10 }, { value: 8 }, 
              { value: 9 }, { value: 8 }, { value: 7 }
            ]}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Engagement Chart */}
          <Chart
            title="15-Day User Engagement"
            data={userEngagementData}
            type="line"
            dataKeys={['users', 'admins']}
            xAxisKey="month"
            height={300}
            showLegend
          />

          {/* Brand Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {brandPerformanceData.map((brand) => (
                  <div key={brand.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium text-neutral-600">
                          {brand.name.substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{brand.name}</p>
                        <p className="text-xs text-neutral-500">Adoption: {brand.adoption}%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${brand.activity}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-neutral-600">
                        {brand.activity}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <UsersIcon className="w-4 h-4 mr-2" />
                  Add New Admin
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BoltIcon className="w-4 h-4 mr-2" />
                  Add Brand
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  Add Station
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Badge 
                        variant={
                          activity.type === 'complaint' ? 'destructive' : 
                          activity.type === 'transfer' ? 'default' : 'secondary'
                        }
                      >
                        {activity.type}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900">{activity.action}</p>
                      <p className="text-xs text-neutral-500">by {activity.user}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-xs text-neutral-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}