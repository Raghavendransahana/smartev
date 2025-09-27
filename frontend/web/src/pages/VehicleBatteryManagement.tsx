import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { 
  Car,
  Battery,
  Search,
  Plus,
  Edit,
  Trash2,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Thermometer,
  Activity,
  Users,
  MapPin
} from 'lucide-react'
import { 
  apiService, 
  type Vehicle, 
  type BatteryLog, 
  type VehicleUserMapping,
  type CreateVehicleForUserData 
} from '../services/api.service'

interface VehicleWithBattery extends Vehicle {
  latestBatteryLog?: BatteryLog;
  batteryHealth?: number;
}

export const VehicleBatteryManagement: React.FC = () => {
  const [userVehicleMappings, setUserVehicleMappings] = useState<VehicleUserMapping[]>([])
  const [selectedUser, setSelectedUser] = useState<VehicleUserMapping | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithBattery | null>(null)
  const [batteryLogs, setBatteryLogs] = useState<BatteryLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
  const [showVehicleDetailsModal, setShowVehicleDetailsModal] = useState(false)
  const [showBatteryDetailsModal, setShowBatteryDetailsModal] = useState(false)
  
  // Form data
  const [vehicleFormData, setVehicleFormData] = useState<CreateVehicleForUserData>({
    brand: '',
    vehicleModel: '',
    vin: '',
    status: 'active',
    ownerId: ''
  })

  const [batteryFormData, setBatteryFormData] = useState({
    vehicleId: '',
    stateOfCharge: '',
    stateOfHealth: '',
    temperature: '',
    cycleCount: '',
    voltage: '',
    chargingStatus: 'not_charging' as 'charging' | 'not_charging' | 'fast_charging'
  })

  useEffect(() => {
    loadUserVehicleMappings()
  }, [])

  const loadUserVehicleMappings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Ensure we're authenticated
      const isAuthenticated = await apiService.autoLogin()
      if (!isAuthenticated) {
        throw new Error('Authentication failed')
      }
      
      const mappings = await apiService.getAllUsersWithVehicles()
      setUserVehicleMappings(mappings)
    } catch (err) {
      console.error('Failed to load user vehicle mappings:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadBatteryLogs = async (vehicleId: string) => {
    try {
      setError(null)
      const logs = await apiService.getBatteryLogsAdmin(vehicleId)
      setBatteryLogs(logs)
    } catch (err) {
      console.error('Failed to load battery logs:', err)
      setError(err instanceof Error ? err.message : 'Failed to load battery logs')
    }
  }

  const handleVehicleClick = async (vehicle: Vehicle) => {
    const vehicleWithBattery: VehicleWithBattery = { ...vehicle }
    
    // Load battery logs for this vehicle
    try {
      const logs = await apiService.getBatteryLogsAdmin(vehicle._id)
      if (logs.length > 0) {
        vehicleWithBattery.latestBatteryLog = logs[0] // Most recent log
        vehicleWithBattery.batteryHealth = logs[0].stateOfHealth
      }
    } catch (err) {
      console.warn('Failed to load battery data for vehicle:', err)
    }
    
    setSelectedVehicle(vehicleWithBattery)
    setShowVehicleDetailsModal(true)
  }

  const handleAddVehicle = async () => {
    if (!selectedUser) return
    
    // Validate form data
    if (vehicleFormData.vin.length !== 17) {
      setError('VIN must be exactly 17 characters')
      return
    }
    
    if (!vehicleFormData.brand.trim() || !vehicleFormData.vehicleModel.trim()) {
      setError('Brand and model are required')
      return
    }
    
    try {
      setError(null)
      console.log('Creating vehicle with data:', {
        ...vehicleFormData,
        ownerId: selectedUser.userId
      })
      
      const vehicleDataWithOwner = {
        ...vehicleFormData,
        ownerId: selectedUser.userId
      }
      
      const newVehicle = await apiService.createVehicleForUser(vehicleDataWithOwner)
      console.log('Vehicle created successfully:', newVehicle)
      
      await loadUserVehicleMappings() // Reload data
      setShowAddVehicleModal(false)
      resetVehicleForm()
    } catch (err) {
      console.error('Failed to add vehicle:', err)
      setError(err instanceof Error ? err.message : 'Failed to add vehicle')
    }
  }

  const resetVehicleForm = () => {
    setVehicleFormData({
      brand: '',
      vehicleModel: '',
      vin: '',
      status: 'active',
      ownerId: ''
    })
  }

  const handleAddBatteryDetails = (vehicle: Vehicle) => {
    setBatteryFormData({
      vehicleId: vehicle._id,
      stateOfCharge: '',
      stateOfHealth: '',
      temperature: '',
      cycleCount: '',
      voltage: '',
      chargingStatus: 'not_charging'
    })
    setShowBatteryDetailsModal(true)
  }

  const handleCreateBatteryLog = async () => {
    try {
      setError(null)
      
      const batteryData = {
        vehicleId: batteryFormData.vehicleId,
        stateOfCharge: parseFloat(batteryFormData.stateOfCharge),
        stateOfHealth: parseFloat(batteryFormData.stateOfHealth),
        temperature: parseFloat(batteryFormData.temperature),
        cycleCount: parseInt(batteryFormData.cycleCount),
        voltage: batteryFormData.voltage ? parseFloat(batteryFormData.voltage) : undefined,
        chargingStatus: batteryFormData.chargingStatus,
        source: 'manual' as const,
        recordedAt: new Date().toISOString()
      }

      await apiService.createAdminBatteryLog(batteryData)
      
      // Reload data and close modal
      await loadUserVehicleMappings()
      setShowBatteryDetailsModal(false)
      resetBatteryForm()
    } catch (err) {
      console.error('Failed to create battery log:', err)
      setError(err instanceof Error ? err.message : 'Failed to create battery log')
    }
  }

  const resetBatteryForm = () => {
    setBatteryFormData({
      vehicleId: '',
      stateOfCharge: '',
      stateOfHealth: '',
      temperature: '',
      cycleCount: '',
      voltage: '',
      chargingStatus: 'not_charging'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700'
      case 'inactive': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getBatteryHealthColor = (health?: number) => {
    if (!health) return 'text-gray-500'
    if (health >= 80) return 'text-emerald-600'
    if (health >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredMappings = userVehicleMappings.filter(mapping =>
    mapping.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.vehicles.some(v => 
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle & Battery Management</h1>
          <p className="text-gray-600">Map users to vehicles and monitor battery health</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center text-red-700">
            <AlertCircle className="mr-2" size={16} />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </Card>
      )}

      {/* Loading Display */}
      {loading && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-center text-blue-700">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            <span>Loading vehicle data...</span>
          </div>
        </Card>
      )}

      {/* Search */}
      <Card className="p-6 border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search users, vehicles, or VIN numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300"
            />
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{userVehicleMappings.length}</p>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">
                {userVehicleMappings.reduce((sum, mapping) => sum + mapping.vehicles.length, 0)}
              </p>
            </div>
            <Car className="text-emerald-600" size={24} />
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">
                {userVehicleMappings.reduce((sum, mapping) => 
                  sum + mapping.vehicles.filter(v => v.status === 'active').length, 0
                )}
              </p>
            </div>
            <CheckCircle className="text-emerald-600" size={24} />
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Users with Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">
                {userVehicleMappings.filter(mapping => mapping.vehicles.length > 0).length}
              </p>
            </div>
            <MapPin className="text-purple-600" size={24} />
          </div>
        </Card>
      </div>

      {/* User-Vehicle Mappings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">User-Vehicle Mappings</h2>
        
        {filteredMappings.map((mapping) => (
          <Card key={mapping.userId} className="p-6 border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="text-blue-600" size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{mapping.userName}</h3>
                  <p className="text-gray-600 text-sm">{mapping.userEmail}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {mapping.vehicles.length} {mapping.vehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(mapping)
                    setShowAddVehicleModal(true)
                  }}
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                >
                  <Plus size={16} className="mr-1" />
                  Add Vehicle
                </Button>
              </div>
            </div>
            
            {/* Vehicles */}
            {mapping.vehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mapping.vehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className="p-4 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleVehicleClick(vehicle)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Car className="text-gray-600" size={16} />
                        <span className="font-medium text-gray-900">
                          {vehicle.brand} {vehicle.vehicleModel}
                        </span>
                      </div>
                      <Badge className={getStatusColor(vehicle.status)}>
                        {vehicle.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>VIN: {vehicle.vin}</div>
                      <div className="flex items-center justify-between">
                        <span>Battery Health:</span>
                        <div className="flex items-center space-x-1">
                          <Battery size={14} />
                          <span className="font-medium">N/A</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddBatteryDetails(vehicle)
                        }}
                        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Plus size={14} className="mr-1" />
                        Add Battery Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Car className="mx-auto mb-2 text-gray-400" size={48} />
                <p>No vehicles assigned to this user</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(mapping)
                    setShowAddVehicleModal(true)
                  }}
                  className="mt-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                >
                  <Plus size={16} className="mr-1" />
                  Add First Vehicle
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add Vehicle Modal - TODO: Implement modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Vehicle for {selectedUser?.userName}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <Input
                  value={vehicleFormData.brand}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, brand: e.target.value })}
                  placeholder="e.g., Tesla, BMW, Nissan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <Input
                  value={vehicleFormData.vehicleModel}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, vehicleModel: e.target.value })}
                  placeholder="e.g., Model 3, i3, Leaf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  VIN ({vehicleFormData.vin.length}/17 characters)
                </label>
                <Input
                  value={vehicleFormData.vin}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, vin: e.target.value.toUpperCase() })}
                  placeholder="17-character VIN (e.g., 1HGCM82633A123456)"
                  maxLength={17}
                  className={vehicleFormData.vin.length > 0 && vehicleFormData.vin.length !== 17 ? "border-red-300" : ""}
                />
                {vehicleFormData.vin.length > 0 && vehicleFormData.vin.length !== 17 && (
                  <p className="text-red-500 text-xs mt-1">VIN must be exactly 17 characters</p>
                )}
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={handleAddVehicle}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={
                  !vehicleFormData.brand || 
                  !vehicleFormData.vehicleModel || 
                  !vehicleFormData.vin ||
                  vehicleFormData.vin.length !== 17
                }
              >
                Add Vehicle
              </Button>
              <Button
                onClick={() => {
                  setShowAddVehicleModal(false)
                  resetVehicleForm()
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Battery Details Modal */}
      {showBatteryDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Battery className="mr-2 text-blue-600" size={20} />
              Add Battery Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">State of Charge (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={batteryFormData.stateOfCharge}
                  onChange={(e) => setBatteryFormData({ ...batteryFormData, stateOfCharge: e.target.value })}
                  placeholder="e.g., 85"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State of Health (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={batteryFormData.stateOfHealth}
                  onChange={(e) => setBatteryFormData({ ...batteryFormData, stateOfHealth: e.target.value })}
                  placeholder="e.g., 92"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Temperature (°C)</label>
                <Input
                  type="number"
                  value={batteryFormData.temperature}
                  onChange={(e) => setBatteryFormData({ ...batteryFormData, temperature: e.target.value })}
                  placeholder="e.g., 25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cycle Count</label>
                <Input
                  type="number"
                  min="0"
                  value={batteryFormData.cycleCount}
                  onChange={(e) => setBatteryFormData({ ...batteryFormData, cycleCount: e.target.value })}
                  placeholder="e.g., 150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Voltage (V) <span className="text-gray-500 text-xs">(Optional)</span></label>
                <Input
                  type="number"
                  step="0.1"
                  value={batteryFormData.voltage}
                  onChange={(e) => setBatteryFormData({ ...batteryFormData, voltage: e.target.value })}
                  placeholder="e.g., 400.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Charging Status</label>
                <select
                  value={batteryFormData.chargingStatus}
                  onChange={(e) => setBatteryFormData({ 
                    ...batteryFormData, 
                    chargingStatus: e.target.value as 'charging' | 'not_charging' | 'fast_charging'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="not_charging">Not Charging</option>
                  <option value="charging">Charging</option>
                  <option value="fast_charging">Fast Charging</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={handleCreateBatteryLog}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={
                  !batteryFormData.stateOfCharge || 
                  !batteryFormData.stateOfHealth || 
                  !batteryFormData.temperature ||
                  !batteryFormData.cycleCount
                }
              >
                <Plus size={16} className="mr-1" />
                Add Battery Log
              </Button>
              <Button
                onClick={() => {
                  setShowBatteryDetailsModal(false)
                  resetBatteryForm()
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default VehicleBatteryManagement
