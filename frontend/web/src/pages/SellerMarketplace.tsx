import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { 
  ShoppingCart, 
  Search,
  Filter,
  Battery,
  MapPin,
  DollarSign,
  Leaf,
  TrendingUp,
  Star,
  Eye,
  Plus,
  AlertCircle
} from 'lucide-react'
import { cn } from '../lib/utils'

interface BatteryListing {
  id: string
  vehicleId: string
  brand: string
  model: string
  vin: string
  soh: number // State of Health percentage
  soc: number // State of Charge percentage
  cycleCount: number
  temperature: number
  price: number
  estimatedValue: number
  remainingLife: string
  location: string
  sellerId: string
  sellerName: string
  sellerRating: number
  listedDate: string
  status: 'available' | 'pending' | 'sold' | 'reserved'
  ecoImpact: {
    co2Saved: number
    recycledMaterials: string[]
    ecoScore: number
  }
  specifications: {
    capacity: number // kWh
    voltage: number
    chemistry: string
    warranty: string
  }
}

interface MarketplaceFilters {
  priceRange: [number, number]
  sohRange: [number, number]
  brands: string[]
  chemistry: string[]
  location: string
  sortBy: 'price' | 'soh' | 'date' | 'eco-score'
  sortOrder: 'asc' | 'desc'
}

const BatteryListingCard: React.FC<{ 
  battery: BatteryListing
  onViewDetails: (battery: BatteryListing) => void
  onAddToCart: (batteryId: string) => void
}> = ({ battery, onViewDetails, onAddToCart }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-100 text-emerald-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'sold': return 'bg-gray-100 text-gray-700'
      case 'reserved': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getSohColor = (soh: number) => {
    if (soh >= 80) return 'text-emerald-600'
    if (soh >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className="p-6 border-gray-200 bg-white hover:shadow-lg transition-all duration-200 hover:border-emerald-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {battery.brand} {battery.model}
          </h3>
          <p className="text-sm text-gray-600 mb-2">VIN: {battery.vin}</p>
          <div className="flex items-center space-x-2 mb-2">
            <MapPin size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{battery.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star size={14} className="text-yellow-500 fill-current" />
            <span className="text-sm text-gray-600">{battery.sellerRating}/5 • {battery.sellerName}</span>
          </div>
        </div>
        <Badge className={getStatusColor(battery.status)}>
          {battery.status.charAt(0).toUpperCase() + battery.status.slice(1)}
        </Badge>
      </div>

      {/* Battery Health Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">State of Health</span>
            <span className={cn("text-sm font-semibold", getSohColor(battery.soh))}>
              {battery.soh}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className={cn("h-2 rounded-full", 
                battery.soh >= 80 ? "bg-emerald-500" : 
                battery.soh >= 60 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `₹{battery.soh}%` }}
            />
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Charge Level</span>
            <span className="text-sm font-semibold text-gray-900">{battery.soc}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `₹{battery.soc}%` }}
            />
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Capacity:</span>
          <span className="text-gray-900">{battery.specifications.capacity} kWh</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Cycle Count:</span>
          <span className="text-gray-900">{battery.cycleCount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Chemistry:</span>
          <span className="text-gray-900">{battery.specifications.chemistry}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Remaining Life:</span>
          <span className="text-gray-900">{battery.remainingLife}</span>
        </div>
      </div>

      {/* Eco Impact */}
      <div className="bg-emerald-50 p-3 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <Leaf size={14} className="text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Eco Impact</span>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 text-xs">
            Score: {battery.ecoImpact.ecoScore}/10
          </Badge>
        </div>
        <div className="text-xs text-emerald-600">
          CO₂ Saved: {battery.ecoImpact.co2Saved}kg • Materials: {battery.ecoImpact.recycledMaterials.join(', ')}
        </div>
      </div>

      {/* Pricing */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <DollarSign size={16} className="text-gray-600" />
            <span className="text-2xl font-bold text-gray-900">₹{battery.price.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-500">
            Est. Value: ₹{battery.estimatedValue.toLocaleString()}
            {battery.price < battery.estimatedValue && (
              <span className="text-emerald-600 ml-1">
                ({Math.round((1 - battery.price / battery.estimatedValue) * 100)}% off)
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Listed</div>
          <div className="text-xs text-gray-600">{new Date(battery.listedDate).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewDetails(battery)}
          className="flex-1"
        >
          <Eye size={14} className="mr-1" />
          View Details
        </Button>
        <Button 
          size="sm" 
          onClick={() => onAddToCart(battery.id)}
          disabled={battery.status !== 'available'}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
        >
          <ShoppingCart size={14} className="mr-1" />
          {battery.status === 'available' ? 'Add to Cart' : 'Unavailable'}
        </Button>
      </div>
    </Card>
  )
}

export const SellerMarketplace: React.FC = () => {
  const [listings, setListings] = useState<BatteryListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBattery, setSelectedBattery] = useState<BatteryListing | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [cart, setCart] = useState<string[]>([])
  
  const [filters, setFilters] = useState<MarketplaceFilters>({
    priceRange: [0, 50000],
    sohRange: [50, 100],
    brands: [],
    chemistry: [],
    location: '',
    sortBy: 'date',
    sortOrder: 'desc'
  })

  // Mock data - Replace with actual API call
  const mockListings: BatteryListing[] = [
    {
      id: '1',
      vehicleId: 'v1',
      brand: 'Tata Motors',
      model: 'Model S 2020',
      vin: '1HGBH41JXMN109186',
      soh: 87,
      soc: 45,
      cycleCount: 1250,
      temperature: 23,
      price: 12500,
      estimatedValue: 15000,
      remainingLife: '8-10 years',
      location: 'Coimbatore, Tamil Nadu',
      sellerId: 'seller1',
      sellerName: 'EV Solutions Inc',
      sellerRating: 4.8,
      listedDate: '2024-09-20',
      status: 'available',
      ecoImpact: {
        co2Saved: 45,
        recycledMaterials: ['Lithium', 'Cobalt', 'Nickel'],
        ecoScore: 8.5
      },
      specifications: {
        capacity: 75,
        voltage: 400,
        chemistry: 'Li-NMC',
        warranty: '2 years'
      }
    },
    {
      id: '2',
      vehicleId: 'v2',
      brand: 'BMW',
      model: 'i3 2019',
      vin: '2HGBH41JXMN109187',
      soh: 74,
      soc: 78,
      cycleCount: 2100,
      temperature: 25,
      price: 8900,
      estimatedValue: 10500,
      remainingLife: '5-7 years',
      location: 'Chennai, Tamil Nadu',
      sellerId: 'seller2',
      sellerName: 'GreenTech Motors',
      sellerRating: 4.6,
      listedDate: '2024-09-18',
      status: 'available',
      ecoImpact: {
        co2Saved: 32,
        recycledMaterials: ['Lithium', 'Manganese'],
        ecoScore: 7.2
      },
      specifications: {
        capacity: 42,
        voltage: 355,
        chemistry: 'Li-ion',
        warranty: '1 year'
      }
    },
    {
      id: '3',
      vehicleId: 'v3',
      brand: 'Nissan',
      model: 'Leaf 2021',
      vin: '3HGBH41JXMN109188',
      soh: 92,
      soc: 89,
      cycleCount: 680,
      temperature: 22,
      price: 9800,
      estimatedValue: 11200,
      remainingLife: '10-12 years',
      location: 'Madurai, Tamil Nadu',
      sellerId: 'seller3',
      sellerName: 'Eco Battery Co',
      sellerRating: 4.9,
      listedDate: '2024-09-25',
      status: 'available',
      ecoImpact: {
        co2Saved: 51,
        recycledMaterials: ['Lithium', 'Cobalt'],
        ecoScore: 9.1
      },
      specifications: {
        capacity: 40,
        voltage: 350,
        chemistry: 'Li-Mn',
        warranty: '3 years'
      }
    }
  ]

  useEffect(() => {
    loadListings()
  }, [])

  const loadListings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Replace with actual API call
      // const response = await apiService.getBatteryListings()
      
      // Simulate API delay
      setTimeout(() => {
        setListings(mockListings)
        setLoading(false)
      }, 1000)
      
    } catch (err) {
      console.error('Failed to load listings:', err)
      setError(err instanceof Error ? err.message : 'Failed to load listings')
      setLoading(false)
    }
  }

  const handleViewDetails = (battery: BatteryListing) => {
    setSelectedBattery(battery)
    setShowDetails(true)
  }

  const handleAddToCart = (batteryId: string) => {
    setCart(prev => [...prev, batteryId])
    // TODO: Add to cart API call
  }

  const filteredListings = listings.filter(listing => {
    const matchesSearch = searchTerm === '' || 
      listing.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.vin.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPriceRange = listing.price >= filters.priceRange[0] && listing.price <= filters.priceRange[1]
    const matchesSohRange = listing.soh >= filters.sohRange[0] && listing.soh <= filters.sohRange[1]
    
    return matchesSearch && matchesPriceRange && matchesSohRange
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Battery className="animate-spin mx-auto mb-4 text-emerald-600" size={48} />
            <p className="text-gray-600">Loading marketplace...</p>
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
            <p className="text-gray-900 font-medium mb-2">Failed to load marketplace</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadListings}>Try Again</Button>
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
          <h1 className="text-3xl font-bold text-gray-900">Battery Marketplace</h1>
          <p className="text-gray-600">Discover and purchase high-quality EV batteries</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="border-emerald-200 text-emerald-700">
            {cart.length} items in cart
          </Badge>
          <Button variant="outline">
            <Plus size={16} className="mr-2" />
            List Battery
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 border-gray-200 bg-white">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search by brand, model, or VIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Filter size={16} className="mr-2" />
              Filters
            </Button>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={`₹{filters.sortBy}-₹{filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                setFilters(prev => ({ 
                  ...prev, 
                  sortBy: sortBy as any, 
                  sortOrder: sortOrder as any 
                }))
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="soh-desc">Best Health First</option>
              <option value="eco-score-desc">Best Eco Score</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Available Batteries</p>
              <p className="text-2xl font-bold text-gray-900">{filteredListings.length}</p>
            </div>
            <Battery className="text-emerald-600" size={24} />
          </div>
        </Card>
        <Card className="p-4 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{Math.round(filteredListings.reduce((acc, item) => acc + item.price, 0) / filteredListings.length).toLocaleString()}
              </p>
            </div>
            <DollarSign className="text-blue-600" size={24} />
          </div>
        </Card>
        <Card className="p-4 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg. Health</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(filteredListings.reduce((acc, item) => acc + item.soh, 0) / filteredListings.length)}%
              </p>
            </div>
            <TrendingUp className="text-emerald-600" size={24} />
          </div>
        </Card>
        <Card className="p-4 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Eco Impact</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(filteredListings.reduce((acc, item) => acc + item.ecoImpact.co2Saved, 0))}kg CO₂
              </p>
            </div>
            <Leaf className="text-green-600" size={24} />
          </div>
        </Card>
      </div>

      {/* Battery Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <BatteryListingCard
            key={listing.id}
            battery={listing}
            onViewDetails={handleViewDetails}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {filteredListings.length === 0 && (
        <Card className="p-12 border-gray-200 bg-white text-center">
          <Battery className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No batteries found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </Card>
      )}

      {/* Battery Details Modal */}
      {showDetails && selectedBattery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedBattery.brand} {selectedBattery.model}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Add detailed view content here */}
              <div className="text-center text-gray-600">
                <p>Detailed battery information would be displayed here</p>
                <p className="text-sm mt-2">This modal will contain comprehensive battery specs, history, and seller information</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
