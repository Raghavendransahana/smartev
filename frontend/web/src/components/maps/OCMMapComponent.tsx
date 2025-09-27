/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { 
  Edit, 
  Trash2, 
  Zap, 
  Search,
  RefreshCw,
  Battery,
  Clock,
  DollarSign,
  MapPin,
  ExternalLink,
  Info
} from 'lucide-react';

// OCM (Open Charge Map) Interfaces
interface OCMCharger {
  ID: number;
  UUID: string;
  DataProvider: {
    ID: number;
    Title: string;
    WebsiteURL: string;
  };
  OperatorInfo: {
    ID: number;
    Title: string;
    WebsiteURL: string;
  };
  UsageType: {
    ID: number;
    Title: string;
    IsPayAtLocation: boolean;
    IsMembershipRequired: boolean;
  };
  StatusType: {
    ID: number;
    Title: string;
    IsOperational: boolean;
  };
  AddressInfo: {
    ID: number;
    Title: string;
    AddressLine1: string;
    AddressLine2: string;
    Town: string;
    StateOrProvince: string;
    Postcode: string;
    Country: {
      ID: number;
      Title: string;
      ISOCode: string;
    };
    Latitude: number;
    Longitude: number;
    Distance: number;
  };
  Connections: Array<{
    ID: number;
    ConnectionType: {
      ID: number;
      Title: string;
    };
    StatusType: {
      ID: number;
      Title: string;
      IsOperational: boolean;
    };
    Level: {
      ID: number;
      Title: string;
      Comments: string;
    };
    Amps: number;
    Voltage: number;
    PowerKW: number;
    CurrentType: {
      ID: number;
      Title: string;
    };
  }>;
  NumberOfPoints: number;
  GeneralComments: string;
  DatePlanned: string;
  DateLastConfirmed: string;
  DateLastStatusUpdate: string;
  DataQualityLevel: number;
  DateCreated: string;
}

// Simplified interface for our component
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

interface OCMMapComponentProps {
  height?: string;
  onChargerSelect?: (charger: EVCharger) => void;
  onDataLoad?: (chargers: EVCharger[]) => void;
  adminMode?: boolean;
  countryCode?: string;
  maxResults?: number;
  distance?: number;
  latitude?: number;
  longitude?: number;
}

const OCMMapComponent: React.FC<OCMMapComponentProps> = ({
  height = '600px',
  onChargerSelect,
  onDataLoad,
  adminMode = false,
  countryCode = 'IN',
  maxResults = 200,
  distance = 100,
  latitude = 11.0168,
  longitude = 76.9558
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chargers, setChargers] = useState<EVCharger[]>([]);
  const [selectedCharger, setSelectedCharger] = useState<EVCharger | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Convert OCM data to our simplified format
  const convertOCMToCharger = (ocmData: OCMCharger): EVCharger => {
    const maxPower = Math.max(...ocmData.Connections.map(c => c.PowerKW || 0));
    
    let type: 'fast' | 'rapid' | 'ultra-fast' | 'slow' = 'slow';
    if (maxPower >= 150) type = 'ultra-fast';
    else if (maxPower >= 50) type = 'rapid';
    else if (maxPower >= 22) type = 'fast';

    let status: 'available' | 'occupied' | 'maintenance' | 'offline' | 'unknown' = 'unknown';
    if (ocmData.StatusType) {
      if (ocmData.StatusType.IsOperational) {
        status = 'available'; // We can't know if it's occupied from OCM
      } else {
        status = 'offline';
      }
    }

    return {
      id: ocmData.ID.toString(),
      name: ocmData.AddressInfo.Title || `Charging Station ${ocmData.ID}`,
      lat: ocmData.AddressInfo.Latitude,
      lng: ocmData.AddressInfo.Longitude,
      type,
      status,
      power: maxPower,
      connectorTypes: ocmData.Connections.map(c => c.ConnectionType.Title),
      operator: ocmData.OperatorInfo?.Title || 'Unknown',
      address: `${ocmData.AddressInfo.AddressLine1 || ''} ${ocmData.AddressInfo.Town || ''} ${ocmData.AddressInfo.StateOrProvince || ''}`.trim(),
      amenities: [], // OCM doesn't provide amenities directly
      usageType: ocmData.UsageType?.Title || 'Public',
      membershipRequired: ocmData.UsageType?.IsMembershipRequired || false,
      payAtLocation: ocmData.UsageType?.IsPayAtLocation || false,
      comments: ocmData.GeneralComments || '',
      lastUpdated: ocmData.DateLastStatusUpdate || ocmData.DateLastConfirmed || ocmData.DateCreated,
      ocmUrl: `https://openchargemap.org/site/poi/details/${ocmData.ID}`,
      dataProvider: ocmData.DataProvider?.Title || 'Open Charge Map'
    };
  };

  // Sample/Demo charging station data for when API key is not available
  const getDemoChargingStations = (): EVCharger[] => {
    return [
      {
        id: 'demo-1',
        name: 'Demo Fast Charging Hub - Coimbatore',
        lat: 11.0168,
        lng: 76.9558,
        type: 'fast',
        status: 'available',
        power: 150,
        connectorTypes: ['CCS2', 'CHAdeMO'],
        operator: 'TNEB',
        address: 'RS Puram, Coimbatore, Tamil Nadu 641002',
        amenities: ['Parking', 'WiFi', 'Cafe'],
        usageType: 'Public',
        membershipRequired: false,
        payAtLocation: true,
        comments: 'Demo station - Replace with real OCM data by adding API key',
        lastUpdated: new Date().toISOString(),
        ocmUrl: 'https://openchargemap.org',
        dataProvider: 'Demo Data'
      },
      {
        id: 'demo-2',
        name: 'Demo EV Station - Salem',
        lat: 11.6643,
        lng: 78.1460,
        type: 'rapid',
        status: 'occupied',
        power: 50,
        connectorTypes: ['Type2'],
        operator: 'Tamil Nadu EV Network',
        address: 'Junction Main Road, Salem, Tamil Nadu 636001',
        amenities: ['Parking'],
        usageType: 'Public',
        membershipRequired: false,
        payAtLocation: true,
        comments: 'Sample EV charging station for demo purposes',
        lastUpdated: new Date().toISOString(),
        ocmUrl: 'https://openchargemap.org',
        dataProvider: 'Demo Data'
      },
      {
        id: 'demo-3',
        name: 'Demo Charging Point - Erode',
        lat: 11.3410,
        lng: 77.7172,
        type: 'ultra-fast',
        status: 'available',
        power: 300,
        connectorTypes: ['CCS2'],
        operator: 'Future Charge TN',
        address: 'Perundurai Road, Erode, Tamil Nadu 638001',
        amenities: ['Parking', 'Restaurant', 'Shopping'],
        usageType: 'Public',
        membershipRequired: false,
        payAtLocation: true,
        comments: 'Ultra-fast charging demo station',
        lastUpdated: new Date().toISOString(),
        ocmUrl: 'https://openchargemap.org',
        dataProvider: 'Demo Data'
      }
    ];
  };

  // Fetch charging stations from OCM API
  const fetchChargingStations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiKey = import.meta.env.VITE_OCM_API_KEY;
      console.log('OCM API Key status:', apiKey ? 'Present' : 'Missing');
      
      if (!apiKey || apiKey.trim() === '') {
        console.log('No API key found, using demo data');
        
        // Use demo data when no API key is available
        const demoChargers = getDemoChargingStations();
        setChargers(demoChargers);
        
        // Notify parent component about the demo data
        if (onDataLoad) {
          onDataLoad(demoChargers);
        }
        
        // Show info message about demo data
        setError('Using demo data. Get a free OCM API key for real charging station data.');
        setIsLoading(false);
        return;
      }
      
      const params = new URLSearchParams({
        countrycode: countryCode,
        maxresults: maxResults.toString(),
        compact: 'false',
        verbose: 'false',
        output: 'json',
        key: apiKey
      });

      if (latitude && longitude && distance) {
        params.append('latitude', latitude.toString());
        params.append('longitude', longitude.toString());
        params.append('distance', distance.toString());
      }

      const url = `https://api.openchargemap.io/v3/poi?${params}`;
      console.log('OCM API URL:', url.replace(apiKey, '***'));
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OCM API Error: ${response.status} ${response.statusText}`);
      }

      const ocmData: OCMCharger[] = await response.json();
      const convertedChargers = ocmData
        .filter(station => station.AddressInfo?.Latitude && station.AddressInfo?.Longitude)
        .map(convertOCMToCharger);
      
      setChargers(convertedChargers);
      
      // Notify parent component about the data
      if (onDataLoad) {
        onDataLoad(convertedChargers);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch OCM data:', err);
      
      let errorMessage = 'Failed to fetch charging stations';
      
      if (err instanceof Error) {
        if (err.message.includes('OCM API key')) {
          errorMessage = 'OCM API key is missing or invalid. Please check your .env file and add a valid VITE_OCM_API_KEY.';
        } else if (err.message.includes('403')) {
          errorMessage = 'OCM API key is invalid or expired. Please get a new API key from openchargemap.org';
        } else if (err.message.includes('429')) {
          errorMessage = 'OCM API rate limit exceeded. Please wait and try again.';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to OCM API. Please check your internet connection.';
        } else {
          errorMessage = `OCM API Error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Initialize OpenStreetMap (Leaflet)
  const initializeMap = () => {
    if (!mapRef.current) return;
    
    // If map is already initialized, don't initialize again
    if (map.current) {
      console.log('Map already initialized, skipping...');
      setIsLoaded(true);
      return;
    }

    // Load Leaflet dynamically
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    
    // Check if stylesheet already exists
    const existingLink = document.querySelector('link[href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]');
    if (!existingLink) {
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const L = (window as any).L;
      
      // Double check map isn't initialized during async load
      if (!map.current && mapRef.current) {
        try {
          map.current = L.map(mapRef.current).setView([latitude, longitude], 6);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map.current);

          setIsLoaded(true);
          addMarkersToMap();
        } catch (error) {
          console.error('Error initializing map:', error);
          setError('Failed to initialize map');
        }
      }
    };
    
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"]');
    if (!existingScript) {
      document.head.appendChild(script);
    } else {
      // If script exists and Leaflet is available, initialize immediately
      if ((window as any).L && !map.current && mapRef.current) {
        const L = (window as any).L;
        try {
          map.current = L.map(mapRef.current).setView([latitude, longitude], 6);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map.current);

          setIsLoaded(true);
          addMarkersToMap();
        } catch (error) {
          console.error('Error initializing map:', error);
          setError('Failed to initialize map');
        }
      }
    }
  };

  // Add markers to map
  const addMarkersToMap = () => {
    if (!map.current || !(window as any).L) return;

    const L = (window as any).L;
    
    // Clear existing markers
    map.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.current.removeLayer(layer);
      }
    });

    filteredChargers.forEach((charger) => {
      const icon = createMarkerIcon(charger);
      const marker = L.marker([charger.lat, charger.lng], { icon })
        .addTo(map.current);

      marker.on('click', () => {
        setSelectedCharger(charger);
        onChargerSelect?.(charger);
      });

      // Add popup with basic info
      const popupContent = `
        <div class="p-2">
          <h3 class="font-semibold">${charger.name}</h3>
          <p class="text-sm text-gray-600">${charger.operator}</p>
          <p class="text-sm">${charger.power}kW • ${charger.type}</p>
          <p class="text-xs text-gray-500">${charger.address}</p>
        </div>
      `;
      marker.bindPopup(popupContent);
    });
  };

  // Create marker icon based on charger data
  const createMarkerIcon = (charger: EVCharger) => {
    const L = (window as any).L;
    
    const colors = {
      available: '#10B981',
      occupied: '#F59E0B', 
      maintenance: '#EF4444',
      offline: '#6B7280',
      unknown: '#9CA3AF'
    };

    const color = colors[charger.status];
    
    const iconHtml = `
      <div style="
        background: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 12px;
      ">
        ⚡
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      iconSize: [24, 24],
      className: 'custom-div-icon'
    });
  };

  const filteredChargers = chargers.filter(charger => {
    const matchesSearch = charger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         charger.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         charger.operator.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || charger.status === filterStatus;
    const matchesType = filterType === 'all' || charger.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      case 'unknown': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'slow': return 'bg-gray-100 text-gray-800';
      case 'fast': return 'bg-blue-100 text-blue-800';
      case 'rapid': return 'bg-purple-100 text-purple-800';
      case 'ultra-fast': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchChargingStations();
  }, [countryCode, maxResults, distance, latitude, longitude]);

  // Initialize map
  useEffect(() => {
    initializeMap();
  }, []);

  // Update markers when filtered chargers change
  useEffect(() => {
    if (isLoaded && !isLoading) {
      addMarkersToMap();
    }
  }, [filteredChargers, isLoaded, isLoading]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        try {
          map.current.remove();
          map.current = null;
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, []);

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
            <option value="unknown">Unknown</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Types</option>
            <option value="slow">Slow (≤22kW)</option>
            <option value="fast">Fast (22-50kW)</option>
            <option value="rapid">Rapid (50-150kW)</option>
            <option value="ultra-fast">Ultra Fast (≥150kW)</option>
          </select>

          <Button
            onClick={fetchChargingStations}
            variant="outline"
            size="sm" 
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className={`p-4 border rounded-lg ${
          error.includes('demo data') 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm font-medium mb-2 ${
            error.includes('demo data') 
              ? 'text-blue-800' 
              : 'text-red-800'
          }`}>
            {error.includes('demo data') ? '💡' : '❌'} {error}
          </p>
          {(error.includes('API key') || error.includes('403') || error.includes('demo data')) && (
            <div className={`text-xs space-y-1 ${
              error.includes('demo data') 
                ? 'text-blue-700' 
                : 'text-red-700'
            }`}>
              <p>To get real charging station data:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Get a free API key from <a href="https://openchargemap.org/site/loginprovider?connect=true" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">openchargemap.org</a></li>
                <li>Add it to your .env file as: <code className={`px-1 rounded ${
                  error.includes('demo data') ? 'bg-blue-100' : 'bg-red-100'
                }`}>VITE_OCM_API_KEY=your-key-here</code></li>
                <li>Restart the development server</li>
              </ol>
              <p className="mt-2">See <code>OCM_API_SETUP.md</code> for detailed instructions.</p>
            </div>
          )}
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
            {(isLoading || !isLoaded) && (
              <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <RefreshCw className={`h-8 w-8 text-gray-400 mx-auto mb-2 ${isLoading ? 'animate-spin' : ''}`} />
                  <p className="text-gray-500">
                    {isLoading ? 'Loading OCM data...' : 'Initializing map...'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Powered by Open Charge Map & OpenStreetMap
                  </p>
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
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(selectedCharger.ocmUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                {adminMode && (
                  <>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
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
                <span className="text-sm font-medium">Max Power:</span>
                <span className="text-sm">{selectedCharger.power} kW</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">Usage:</span>
                <span className="text-sm">{selectedCharger.usageType}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Connector Types:</div>
              <div className="flex flex-wrap gap-1">
                {selectedCharger.connectorTypes.map((type, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Address:</div>
              <p className="text-xs text-gray-600">{selectedCharger.address}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-gray-400" />
                <span>Membership Required:</span>
                <Badge variant={selectedCharger.membershipRequired ? "destructive" : "secondary"}>
                  {selectedCharger.membershipRequired ? "Yes" : "No"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span>Pay at Location:</span>
                <Badge variant={selectedCharger.payAtLocation ? "default" : "secondary"}>
                  {selectedCharger.payAtLocation ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            {selectedCharger.comments && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Comments:</div>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {selectedCharger.comments}
                </p>
              </div>
            )}

            <div className="pt-2 border-t space-y-1">
              <div className="text-xs text-gray-500">
                Data: {selectedCharger.dataProvider}
              </div>
              <div className="text-xs text-gray-500">
                Updated: {new Date(selectedCharger.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-sm font-medium">Total Stations</div>
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
              <div className="text-sm font-medium">Offline</div>
              <div className="text-2xl font-bold text-red-600">
                {filteredChargers.filter(c => c.status === 'offline').length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-sm font-medium">Avg Power</div>
              <div className="text-2xl font-bold">
                {(filteredChargers.reduce((sum, c) => sum + c.power, 0) / filteredChargers.length || 0).toFixed(0)}kW
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-indigo-600" />
            <div>
              <div className="text-sm font-medium">Data Source</div>
              <div className="text-sm font-bold">OCM</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OCMMapComponent;