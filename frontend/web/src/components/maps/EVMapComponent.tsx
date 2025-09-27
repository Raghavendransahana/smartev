/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Zap, 
  Search,
  RefreshCw,
  Battery,
  Clock,
  DollarSign
} from 'lucide-react';

declare global {
  interface Window {
    H: any;
  }
}

interface EVCharger {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'fast' | 'rapid' | 'ultra-fast';
  status: 'available' | 'occupied' | 'maintenance' | 'offline';
  power: number;
  connectorTypes: string[];
  price: number;
  operator: string;
  address: string;
  amenities: string[];
  createdAt: string;
  updatedAt: string;
}

interface EVMapComponentProps {
  height?: string;
  apiKey?: string;
  onChargerSelect?: (charger: EVCharger) => void;
  adminMode?: boolean;
}

const EVMapComponent: React.FC<EVMapComponentProps> = ({
  height = '600px',
  apiKey = 'YOUR_HERE_API_KEY',
  onChargerSelect,
  adminMode = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const platform = useRef<any>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddingCharger, setIsAddingCharger] = useState(false);
  const [chargers, setChargers] = useState<EVCharger[]>([]);
  const [selectedCharger, setSelectedCharger] = useState<EVCharger | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Mock data for EV chargers
  const mockChargers: EVCharger[] = [
    {
      id: '1',
      name: 'Delhi Central Mall - Fast Charging Hub',
      lat: 28.6139,
      lng: 77.2090,
      type: 'fast',
      status: 'available',
      power: 50,
      connectorTypes: ['CCS2', 'CHAdeMO'],
      price: 12.50,
      operator: 'BPCL',
      address: 'Connaught Place, New Delhi, Delhi 110001',
      amenities: ['WiFi', 'Restroom', 'Cafe', 'Parking'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-09-27T08:30:00Z'
    },
    {
      id: '2',
      name: 'Mumbai Bandra Station - Ultra Fast',
      lat: 19.0760,
      lng: 72.8777,
      type: 'ultra-fast',
      status: 'occupied',
      power: 150,
      connectorTypes: ['CCS2', 'Type 2'],
      price: 18.00,
      operator: 'Tata Power',
      address: 'Bandra West, Mumbai, Maharashtra 400050',
      amenities: ['24/7', 'Security', 'Shopping'],
      createdAt: '2024-02-20T14:00:00Z',
      updatedAt: '2024-09-27T09:15:00Z'
    },
    {
      id: '3',
      name: 'Bangalore Tech Park - Rapid Charging',
      lat: 12.9716,
      lng: 77.5946,
      type: 'rapid',
      status: 'available',
      power: 80,
      connectorTypes: ['CCS2', 'CHAdeMO', 'Type 2'],
      price: 15.00,
      operator: 'Ather Energy',
      address: 'Electronic City, Bangalore, Karnataka 560100',
      amenities: ['WiFi', 'Food Court', 'EV Service'],
      createdAt: '2024-03-10T09:00:00Z',
      updatedAt: '2024-09-27T07:45:00Z'
    },
    {
      id: '4',
      name: 'Chennai Airport - Express Charging',
      lat: 12.9941,
      lng: 80.1709,
      type: 'fast',
      status: 'maintenance',
      power: 60,
      connectorTypes: ['CCS2', 'Type 2'],
      price: 14.00,
      operator: 'IOCL',
      address: 'Chennai International Airport, Tamil Nadu 600027',
      amenities: ['24/7', 'Airport Access', 'Lounge'],
      createdAt: '2024-04-05T11:00:00Z',
      updatedAt: '2024-09-26T16:20:00Z'
    }
  ];

  const filteredChargers = chargers.filter(charger => {
    const matchesSearch = charger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         charger.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         charger.operator.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || charger.status === filterStatus;
    const matchesType = filterType === 'all' || charger.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const createChargerIcon = (charger: EVCharger) => {
    const colors = {
      available: '#10B981',
      occupied: '#F59E0B',
      maintenance: '#EF4444',
      offline: '#6B7280'
    };

    const typeIcons = {
      fast: '⚡',
      rapid: '🔋',
      'ultra-fast': '⚡'
    };

    const color = colors[charger.status];
    const icon = typeIcons[charger.type];

    return new window.H.map.Icon(
      `<div style="background: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
        ${icon}
      </div>`,
      { size: { w: 32, h: 32 } }
    );
  };

  const addChargersToMap = () => {
    if (!map.current || !window.H) return;

    const group = new window.H.map.Group();

    filteredChargers.forEach((charger) => {
      const icon = createChargerIcon(charger);
      const marker = new window.H.map.Marker({ lat: charger.lat, lng: charger.lng }, { icon });
      
      marker.setData(charger);
      marker.addEventListener('tap', () => {
        setSelectedCharger(charger);
        onChargerSelect?.(charger);
      });

      group.addObject(marker);
    });

    map.current.removeObjects(map.current.getObjects());
    map.current.addObject(group);
  };

  const initializeMap = () => {
    if (!window.H || !mapRef.current) return;

    try {
      platform.current = new window.H.service.Platform({
        'apikey': apiKey
      });

      const defaultLayers = platform.current.createDefaultLayers();

      map.current = new window.H.Map(
        mapRef.current,
        defaultLayers.vector.normal.map,
        {
          zoom: 5,
          center: { lat: 20.5937, lng: 78.9629 }
        }
      );

      new window.H.mapevents.Behavior();
      window.H.ui.UI.createDefault(map.current);

      addChargersToMap();

      if (adminMode) {
        map.current.addEventListener('tap', (evt: any) => {
          if (isAddingCharger) {
            const coord = map.current.screenToGeo(
              evt.currentPointer.viewportX,
              evt.currentPointer.viewportY
            );
            handleAddCharger(coord.lat, coord.lng);
            setIsAddingCharger(false);
          }
        });
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to initialize HERE Map:', error);
      setIsLoaded(false);
    }
  };

  const handleAddCharger = (lat: number, lng: number) => {
    const newCharger: EVCharger = {
      id: Date.now().toString(),
      name: `New Charger ${chargers.length + 1}`,
      lat,
      lng,
      type: 'fast',
      status: 'available',
      power: 50,
      connectorTypes: ['CCS2'],
      price: 12.00,
      operator: 'Admin Added',
      address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
      amenities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setChargers(prev => [...prev, newCharger]);
  };

  const handleDeleteCharger = (chargerId: string) => {
    setChargers(prev => prev.filter(c => c.id !== chargerId));
    setSelectedCharger(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fast': return 'bg-blue-100 text-blue-800';
      case 'rapid': return 'bg-purple-100 text-purple-800';
      case 'ultra-fast': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    setChargers(mockChargers);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://js.api.here.com/v3/3.1/mapsjs-core.js';
    script.onload = () => {
      const script2 = document.createElement('script');
      script2.src = 'https://js.api.here.com/v3/3.1/mapsjs-service.js';
      script2.onload = () => {
        const script3 = document.createElement('script');
        script3.src = 'https://js.api.here.com/v3/3.1/mapsjs-ui.js';
        script3.onload = () => {
          const script4 = document.createElement('script');
          script4.src = 'https://js.api.here.com/v3/3.1/mapsjs-mapevents.js';
          script4.onload = () => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = 'https://js.api.here.com/v3/3.1/mapsjs-ui.css';
            document.getElementsByTagName('head')[0].appendChild(link);
            
            initializeMap();
          };
          document.head.appendChild(script4);
        };
        document.head.appendChild(script3);
      };
      document.head.appendChild(script2);
    };
    document.head.appendChild(script);

    return () => {
      if (map.current) {
        map.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      addChargersToMap();
    }
  }, [filteredChargers, isLoaded]);

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search chargers by name, location, or operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Types</option>
            <option value="fast">Fast</option>
            <option value="rapid">Rapid</option>
            <option value="ultra-fast">Ultra Fast</option>
          </select>

          {adminMode && (
            <Button
              onClick={() => setIsAddingCharger(!isAddingCharger)}
              variant={isAddingCharger ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isAddingCharger ? (
                <>Cancel</>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Charger
                </>
              )}
            </Button>
          )}

          <Button
            onClick={addChargersToMap}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {isAddingCharger && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm font-medium">
            📍 Click anywhere on the map to add a new EV charger at that location
          </p>
        </div>
      )}

      <div className="flex gap-4">
        {/* Map */}
        <div className="flex-1">
          <div 
            ref={mapRef} 
            style={{ height, width: '100%' }}
            className="border border-gray-300 rounded-lg"
          >
            {!isLoaded && (
              <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Loading HERE Map...</p>
                  <p className="text-xs text-gray-400 mt-1">Make sure to configure your HERE API key</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charger Details Panel */}
        {selectedCharger && (
          <Card className="w-80 p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{selectedCharger.name}</h3>
                <p className="text-sm text-gray-500">{selectedCharger.operator}</p>
              </div>
              {adminMode && (
                <div className="flex gap-1">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteCharger(selectedCharger.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge className={getStatusColor(selectedCharger.status)}>
                  {selectedCharger.status.charAt(0).toUpperCase() + selectedCharger.status.slice(1)}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Type:</span>
                <Badge className={getTypeColor(selectedCharger.type)}>
                  {selectedCharger.type.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">Power:</span>
                <span className="text-sm">{selectedCharger.power} kW</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">Price:</span>
                <span className="text-sm">₹{selectedCharger.price}/kWh</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Connector Types:</div>
              <div className="flex flex-wrap gap-1">
                {selectedCharger.connectorTypes.map(type => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Address:</div>
              <p className="text-xs text-gray-600">{selectedCharger.address}</p>
            </div>

            {selectedCharger.amenities.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Amenities:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedCharger.amenities.map(amenity => (
                    <Badge key={amenity} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="text-xs text-gray-500">
                Last updated: {new Date(selectedCharger.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-sm font-medium">Total Chargers</div>
              <div className="text-2xl font-bold">{filteredChargers.length}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Battery className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium">Available</div>
              <div className="text-2xl font-bold text-green-600">
                {filteredChargers.filter(c => c.status === 'available').length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-sm font-medium">Occupied</div>
              <div className="text-2xl font-bold text-yellow-600">
                {filteredChargers.filter(c => c.status === 'occupied').length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-sm font-medium">Avg Price</div>
              <div className="text-2xl font-bold">
                ₹{(filteredChargers.reduce((sum, c) => sum + c.price, 0) / filteredChargers.length || 0).toFixed(1)}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EVMapComponent;