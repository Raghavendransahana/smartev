import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { 
  Leaf,
  Battery,
  Recycle,
  Award,
  Target,
  BarChart3,
  PieChart,
  Download,
  Share2,
  TreePine,
  Zap,
  Droplets,
  Globe,
  Users,
  AlertCircle
} from 'lucide-react'

interface EcoMetrics {
  co2Saved: number
  batteriesRecycled: number
  ecoScore: number
  carbonCredits: number
  materialsRecovered: {
    lithium: number // kg
    cobalt: number // kg
    nickel: number // kg
    other: number // kg
  }
  energySaved: number // kWh
  waterSaved: number // liters
  treesEquivalent: number
  impactRating: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
}

interface Certification {
  id: string
  name: string
  issuer: string
  level: string
  earnedDate: string
  validUntil: string
  status: 'active' | 'expired' | 'pending'
  badge: string
}

interface EcoGoal {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  category: 'co2' | 'batteries' | 'materials' | 'energy'
  deadline: string
  status: 'on-track' | 'behind' | 'achieved' | 'at-risk'
}

const EcoScoreCard: React.FC<{ metrics: EcoMetrics }> = ({ metrics }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 8) return 'bg-emerald-100'
    if (score >= 6) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <Card className="p-6 border-gray-200 bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Overall Eco Score</h3>
        <Badge className="bg-emerald-100 text-emerald-700">
          {metrics.impactRating}
        </Badge>
      </div>
      
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ₹{getScoreBackground(metrics.ecoScore)} mb-3`}>
          <span className={`text-3xl font-bold ₹{getScoreColor(metrics.ecoScore)}`}>
            {metrics.ecoScore.toFixed(1)}
          </span>
        </div>
        <p className="text-sm text-gray-600">out of 10.0</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TreePine className="text-emerald-600" size={20} />
          </div>
          <p className="text-sm text-gray-600">Trees Equivalent</p>
          <p className="font-semibold text-gray-900">{metrics.treesEquivalent}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Award className="text-yellow-600" size={20} />
          </div>
          <p className="text-sm text-gray-600">Carbon Credits</p>
          <p className="font-semibold text-gray-900">{metrics.carbonCredits}</p>
        </div>
      </div>
    </Card>
  )
}

const GoalCard: React.FC<{ goal: EcoGoal }> = ({ goal }) => {
  const progress = (goal.current / goal.target) * 100
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'text-emerald-600'
      case 'on-track': return 'text-blue-600'
      case 'behind': return 'text-yellow-600'
      case 'at-risk': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'bg-emerald-500'
      case 'on-track': return 'bg-blue-500'
      case 'behind': return 'bg-yellow-500'
      case 'at-risk': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card className="p-4 border-gray-200 bg-white">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900">{goal.title}</h4>
        <Badge className={`₹{getStatusColor(goal.status)} bg-transparent border-current`}>
          {goal.status.replace('-', ' ')}
        </Badge>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ₹{getProgressColor(goal.status)}`}
            style={{ width: `₹{Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{Math.round(progress)}% complete</span>
          <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  )
}

export const SellerEcoAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<EcoMetrics | null>(null)
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [goals, setGoals] = useState<EcoGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  // Mock data - Replace with actual API calls
  const mockMetrics: EcoMetrics = {
    co2Saved: 1247,
    batteriesRecycled: 23,
    ecoScore: 8.3,
    carbonCredits: 156,
    materialsRecovered: {
      lithium: 45.2,
      cobalt: 23.8,
      nickel: 67.5,
      other: 89.1
    },
    energySaved: 2456,
    waterSaved: 12500,
    treesEquivalent: 56,
    impactRating: 'Gold'
  }



  const mockCertifications: Certification[] = [
    {
      id: '1',
      name: 'Green Energy Champion',
      issuer: 'EV Sustainability Council',
      level: 'Gold',
      earnedDate: '2024-08-15',
      validUntil: '2025-08-15',
      status: 'active',
      badge: '🏆'
    },
    {
      id: '2',
      name: 'Carbon Neutral Seller',
      issuer: 'Climate Action Network',
      level: 'Silver',
      earnedDate: '2024-07-10',
      validUntil: '2025-07-10',
      status: 'active',
      badge: '🌱'
    }
  ]

  const mockGoals: EcoGoal[] = [
    {
      id: '1',
      title: 'CO₂ Reduction Target',
      description: 'Reduce 2000kg of CO₂ emissions this year',
      target: 2000,
      current: 1247,
      unit: 'kg',
      category: 'co2',
      deadline: '2024-12-31',
      status: 'on-track'
    },
    {
      id: '2',
      title: 'Battery Recycling Goal',
      description: 'Process 50 batteries for recycling',
      target: 50,
      current: 23,
      unit: 'batteries',
      category: 'batteries',
      deadline: '2024-12-31',
      status: 'behind'
    },
    {
      id: '3',
      title: 'Energy Conservation',
      description: 'Save 5000 kWh of energy through efficient practices',
      target: 5000,
      current: 2456,
      unit: 'kWh',
      category: 'energy',
      deadline: '2024-12-31',
      status: 'behind'
    }
  ]

  useEffect(() => {
    loadEcoData()
  }, [selectedPeriod])

  const loadEcoData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Replace with actual API calls
      // const [metricsRes, trendsRes, certificationsRes, goalsRes] = await Promise.all([
      //   apiService.getEcoMetrics(selectedPeriod),
      //   apiService.getEcoTrends(selectedPeriod),
      //   apiService.getCertifications(),
      //   apiService.getEcoGoals()
      // ])
      
      // Simulate API delay
      setTimeout(() => {
        setMetrics(mockMetrics)
        setCertifications(mockCertifications)
        setGoals(mockGoals)
        setLoading(false)
      }, 1000)
      
    } catch (err) {
      console.error('Failed to load eco analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load eco analytics')
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log('Exporting eco impact report...')
  }

  const handleShareReport = () => {
    // TODO: Implement share functionality
    console.log('Sharing eco impact report...')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Leaf className="animate-pulse mx-auto mb-4 text-emerald-600" size={48} />
            <p className="text-gray-600">Loading eco analytics...</p>
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
            <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
            <p className="text-gray-900 font-medium mb-2">Failed to load eco analytics</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadEcoData}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Eco Analytics</h1>
          <p className="text-gray-600">Track your environmental impact and sustainability goals</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" onClick={handleShareReport}>
            <Share2 size={16} className="mr-2" />
            Share
          </Button>
          <Button onClick={handleExportReport}>
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EcoScoreCard metrics={metrics} />
        
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Environmental Impact</h3>
            <Leaf className="text-emerald-600" size={24} />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Globe size={16} className="text-blue-600" />
                <span className="text-sm text-gray-600">CO₂ Saved</span>
              </div>
              <span className="font-semibold text-gray-900">{metrics.co2Saved}kg</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Zap size={16} className="text-yellow-600" />
                <span className="text-sm text-gray-600">Energy Saved</span>
              </div>
              <span className="font-semibold text-gray-900">{metrics.energySaved.toLocaleString()}kWh</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Droplets size={16} className="text-cyan-600" />
                <span className="text-sm text-gray-600">Water Saved</span>
              </div>
              <span className="font-semibold text-gray-900">{metrics.waterSaved.toLocaleString()}L</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Battery size={16} className="text-emerald-600" />
                <span className="text-sm text-gray-600">Batteries Recycled</span>
              </div>
              <span className="font-semibold text-gray-900">{metrics.batteriesRecycled}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Materials Recovered</h3>
            <Recycle className="text-purple-600" size={24} />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Lithium</span>
              <span className="font-medium text-gray-900">{metrics.materialsRecovered.lithium}kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cobalt</span>
              <span className="font-medium text-gray-900">{metrics.materialsRecovered.cobalt}kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Nickel</span>
              <span className="font-medium text-gray-900">{metrics.materialsRecovered.nickel}kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Other Materials</span>
              <span className="font-medium text-gray-900">{metrics.materialsRecovered.other}kg</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Total Recovery</span>
              <span className="font-semibold text-emerald-600">
                {(Object.values(metrics.materialsRecovered).reduce((a, b) => a + b, 0)).toFixed(1)}kg
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Trends Chart */}
      <Card className="p-6 border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Impact Trends</h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <BarChart3 size={16} className="mr-1" />
              Chart
            </Button>
            <Button variant="ghost" size="sm">
              <PieChart size={16} className="mr-1" />
              Breakdown
            </Button>
          </div>
        </div>
        
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 size={48} className="mx-auto mb-2" />
            <p>Interactive chart showing eco trends would be displayed here</p>
            <p className="text-sm">Chart.js or similar charting library integration</p>
          </div>
        </div>
      </Card>

      {/* Goals and Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sustainability Goals */}
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sustainability Goals</h3>
            <Target className="text-blue-600" size={24} />
          </div>
          
          <div className="space-y-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </Card>

        {/* Certifications */}
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
            <Award className="text-yellow-600" size={24} />
          </div>
          
          <div className="space-y-4">
            {certifications.map((cert) => (
              <div key={cert.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{cert.badge}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <p className="text-sm text-gray-600">{cert.issuer}</p>
                    </div>
                  </div>
                  <Badge className={cert.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}>
                    {cert.level}
                  </Badge>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Earned: {new Date(cert.earnedDate).toLocaleDateString()}</span>
                  <span>Valid until: {new Date(cert.validUntil).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            <Users size={16} className="mr-2" />
            View All Certifications
          </Button>
        </Card>
      </div>

      {/* Impact Summary */}
      <Card className="p-6 border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Environmental Impact</h3>
          <p className="text-gray-600 mb-4">
            Through your battery recycling and sales activities, you've made a significant positive impact on the environment.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">{metrics.co2Saved}kg</div>
              <div className="text-sm text-gray-600">CO₂ emissions prevented</div>
              <div className="text-xs text-gray-500 mt-1">Equivalent to driving {Math.round(metrics.co2Saved * 2.5)} fewer miles</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">{metrics.treesEquivalent}</div>
              <div className="text-sm text-gray-600">Trees planted equivalent</div>
              <div className="text-xs text-gray-500 mt-1">Based on average CO₂ absorption per tree</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">{metrics.batteriesRecycled}</div>
              <div className="text-sm text-gray-600">Batteries kept from landfills</div>
              <div className="text-xs text-gray-500 mt-1">Preventing soil and water contamination</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
