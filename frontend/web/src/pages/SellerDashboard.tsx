import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Battery, ShoppingCart, TrendingUp, Leaf, DollarSign, Package, Zap } from 'lucide-react'

interface BatteryListingProps {
  id: string
  brand: string
  model: string
  soh: number
  price: number
  remainingLife: string
  location: string
  eco_impact: {
    co2_saved: number
    recycled_materials: string[]
  }
}

const BatteryCard: React.FC<{ battery: BatteryListingProps }> = ({ battery }) => (
  <Card className="p-6 border-gray-200 bg-white hover:shadow-lg transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{battery.brand} {battery.model}</h3>
        <p className="text-gray-600 text-sm">{battery.location}</p>
      </div>
      <Badge 
        variant={battery.soh > 80 ? 'default' : battery.soh > 60 ? 'secondary' : 'destructive'}
        className={battery.soh > 80 ? 'bg-emerald-900 text-emerald-400' : ''}
      >
        {battery.soh}% SoH
      </Badge>
    </div>

    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Remaining Life:</span>
        <span className="text-gray-900">{battery.remainingLife}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">CO₂ Impact:</span>
        <span className="text-emerald-400">-{battery.eco_impact.co2_saved}kg</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Price:</span>
        <span className="text-gray-900 font-semibold">${battery.price.toLocaleString()}</span>
      </div>
    </div>

    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
      <ShoppingCart size={16} className="mr-2" />
      Buy Battery
    </Button>
  </Card>
)

export const SellerDashboard: React.FC = () => {
  const { user } = useAuth()

  const batteryListings: BatteryListingProps[] = [
    {
      id: '1',
      brand: 'Tesla',
      model: 'Model S 2020',
      soh: 87,
      price: 12500,
      remainingLife: '8-10 years',
      location: 'California, USA',
      eco_impact: {
        co2_saved: 45,
        recycled_materials: ['Lithium', 'Cobalt', 'Nickel']
      }
    },
    {
      id: '2',
      brand: 'BMW',
      model: 'i3 2019',
      soh: 74,
      price: 8900,
      remainingLife: '5-7 years',
      location: 'Texas, USA',
      eco_impact: {
        co2_saved: 32,
        recycled_materials: ['Lithium', 'Manganese']
      }
    },
    {
      id: '3',
      brand: 'Nissan',
      model: 'Leaf 2021',
      soh: 92,
      price: 9800,
      remainingLife: '10-12 years',
      location: 'Florida, USA',
      eco_impact: {
        co2_saved: 51,
        recycled_materials: ['Lithium', 'Cobalt']
      }
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">Battery marketplace and eco-impact analytics</p>
        </div>
        <Badge variant="outline" className="border-zinc-700 text-gray-700">
          Sales Agent • {user?.email}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-900 rounded-lg">
              <ShoppingCart className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">$47,350</p>
              <p className="text-emerald-400 text-xs">+18% this month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-900 rounded-lg">
              <Battery className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Batteries Sold</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
              <p className="text-emerald-400 text-xs">+5 this week</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-900 rounded-lg">
              <Leaf className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">CO₂ Saved</p>
              <p className="text-2xl font-bold text-gray-900">1,247kg</p>
              <p className="text-emerald-400 text-xs">Environmental impact</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-900 rounded-lg">
              <TrendingUp className="text-amber-400" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Commission</p>
              <p className="text-2xl font-bold text-gray-900">$2,368</p>
              <p className="text-emerald-400 text-xs">12% avg rate</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Eco-Impact Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-gray-200 bg-white">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Leaf className="mr-2 text-green-400" size={20} />
            Environmental Impact
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total CO₂ Reduced</span>
              <span className="text-emerald-400 font-semibold">1,247 kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Batteries Recycled</span>
              <span className="text-emerald-400 font-semibold">23 units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Eco Score</span>
              <Badge className="bg-emerald-900 text-emerald-400">Excellent</Badge>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Your sales have prevented 1,247kg of CO₂ from entering the atmosphere - equivalent to planting 56 trees!
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="mr-2 text-blue-400" size={20} />
            Revenue Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">This Month</span>
              <span className="text-gray-900 font-semibold">$8,450</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Average Sale</span>
              <span className="text-gray-900 font-semibold">$2,063</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Best Seller</span>
              <span className="text-gray-900 font-semibold">Tesla Batteries</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 text-sm">Growth Rate</span>
                <div className="flex items-center">
                  <TrendingUp size={16} className="text-emerald-400 mr-1" />
                  <span className="text-emerald-400 font-semibold">+18%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Battery Marketplace */}
      <Card className="p-6 border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Package className="mr-2 text-blue-400" size={20} />
            Available Battery Listings
          </h3>
          <Button variant="outline" className="border-zinc-700 text-gray-700 hover:bg-gray-100">
            <Zap size={16} className="mr-2" />
            Filter by SoH
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batteryListings.map((battery) => (
            <BatteryCard key={battery.id} battery={battery} />
          ))}
        </div>
      </Card>
    </div>
  )
}