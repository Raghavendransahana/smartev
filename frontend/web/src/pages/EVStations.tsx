import React, { useState, useCallback } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { MapPin, Zap, Plus, Download, Upload, Filter } from 'lucide-react'
import OCMMapComponent from '../components/maps/OCMMapComponent'

interface EVCharger {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'fast' | 'rapid' | 'ultra-fast' | 'slow';
  status: 'available' | 'occupied' | 'maintenance' | 'offline' | 'unknown';
  power: number;
  connectorTypes: string[];
  operator: string;
  address: string;
  amenities: string[];
  usageType: string;
  membershipRequired: boolean;
  payAtLocation: boolean;
  comments: string;
  lastUpdated: string;
  ocmUrl: string;
  dataProvider: string;
}

export const EVStations: React.FC = () => {
  const [stations, setStations] = useState<EVCharger[]>([]);
  const [selectedStation, setSelectedStation] = useState<EVCharger | null>(null);

  // Callback to receive charger data from the map component
  const handleStationsUpdate = useCallback((stationsList: EVCharger[]) => {
    setStations(stationsList);
  }, []);

  // Callback when a station is selected
  const handleStationSelect = useCallback((station: EVCharger) => {
    setSelectedStation(station);
    console.log('Selected EV station:', station);
  }, []);

  // Calculate statistics
  const totalStations = stations.length;
  const availableStations = stations.filter(s => s.status === 'available').length;
  const fastCharging = stations.filter(s => s.power >= 50).length;
  const averagePower = stations.length > 0 
    ? Math.round(stations.reduce((sum, s) => sum + s.power, 0) / stations.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">EV Charging Stations</h1>
          <p className="text-gray-600">Manage and monitor your EV charging network powered by Open Charge Map</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">
            <Upload size={16} className="mr-2" />
            Import Stations
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus size={16} className="mr-2" />
            Add Station
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Stations</p>
              <p className="text-2xl font-bold text-gray-900">{totalStations}</p>
              <p className="text-blue-600 text-xs">From OCM Database</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Zap className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Available Now</p>
              <p className="text-2xl font-bold text-gray-900">{availableStations}</p>
              <p className="text-green-600 text-xs">Ready for use</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Filter className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Fast Charging</p>
              <p className="text-2xl font-bold text-gray-900">{fastCharging}</p>
              <p className="text-yellow-600 text-xs">≥50kW stations</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MapPin className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Avg Power</p>
              <p className="text-2xl font-bold text-gray-900">{averagePower}kW</p>
              <p className="text-purple-600 text-xs">Network average</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Network Status & Selected Station Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 border-gray-200 bg-white">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Network Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Operational</span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {totalStations > 0 ? Math.round((availableStations / totalStations) * 100) : 0}% Network
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Unknown Status</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {totalStations > 0 ? Math.round(((stations.filter(s => s.status === 'unknown').length) / totalStations) * 100) : 0}% Network
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Offline</span>
                </div>
                <Badge className="bg-red-100 text-red-800">
                  {totalStations > 0 ? Math.round(((stations.filter(s => s.status === 'offline').length) / totalStations) * 100) : 0}% Network
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 border-gray-200 bg-white">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {selectedStation ? 'Selected Station' : 'Quick Actions'}
          </h3>
          
          {selectedStation ? (
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedStation.name}</h4>
                <p className="text-sm text-gray-600">{selectedStation.operator}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Power:</span>
                  <span className="font-medium">{selectedStation.power}kW</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Type:</span>
                  <Badge className="text-xs">{selectedStation.type.toUpperCase()}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <Badge className="text-xs">{selectedStation.status.toUpperCase()}</Badge>
                </div>
              </div>

              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={() => window.open(selectedStation.ocmUrl, '_blank')}
              >
                View Full Details
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <MapPin size={16} className="mr-2" />
                Find Nearby Stations
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Zap size={16} className="mr-2" />
                Check Network Health
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Filter size={16} className="mr-2" />
                Filter by Power Type
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download size={16} className="mr-2" />
                Generate Report
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Main Map Section */}
      <Card className="p-6 border-gray-200 bg-white">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">EV Charging Network Map</h3>
          <p className="text-gray-600 text-sm">
            Interactive map showing real EV charging stations from Open Charge Map. Click on markers to view detailed station information, search by location, and filter by charging speed or availability.
          </p>
        </div>
        <OCMMapComponent 
          height="700px"
          adminMode={true}
          countryCode="IN"
          maxResults={300}
          onChargerSelect={handleStationSelect}
          // Pass callback to get all stations data
          onDataLoad={handleStationsUpdate}
        />
      </Card>

      {/* Footer Info */}
      <Card className="p-6 border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Data Source</h3>
            <p className="text-gray-600 text-sm">
              Station data provided by <a href="https://openchargemap.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Open Charge Map</a> - 
              the world's largest public database of EV charging locations.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-green-300 text-green-800">
              Free API
            </Badge>
            <Badge variant="outline" className="border-blue-300 text-blue-800">
              Real-time Data
            </Badge>
            <Badge variant="outline" className="border-purple-300 text-purple-800">
              Community Verified
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}