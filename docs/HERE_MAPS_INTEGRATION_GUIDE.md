# HERE Maps Integration Configuration

## Overview
The SmartEV platform now includes HERE Maps integration for real-time EV charging station management. This enables admins to visualize, manage, and monitor EV chargers across the network.

## Features
- **Real-time Map Visualization**: Interactive map showing all EV charging stations
- **Admin Management**: Add, edit, and delete charging stations (admin mode only)
- **Advanced Filtering**: Filter by status, charger type, and search by location/operator
- **Detailed Information**: View comprehensive charger details including:
  - Power output (kW)
  - Connector types (CCS2, CHAdeMO, Type 2, etc.)
  - Pricing information (₹/kWh)
  - Amenities (WiFi, Restrooms, Cafe, etc.)
  - Real-time status (Available, Occupied, Maintenance, Offline)

## Setup Instructions

### 1. Get HERE API Key
1. Visit [HERE Developer Portal](https://developer.here.com/)
2. Create an account or sign in
3. Create a new project
4. Generate an API key with the following permissions:
   - Maps API
   - Geocoding and Search API
   - Routing API (optional, for future features)

### 2. Configure API Key
Replace `YOUR_HERE_API_KEY` in the following files with your actual API key:

**AdminDashboard.tsx:**
```tsx
<EVMapComponent 
  height="600px"
  adminMode={true}
  apiKey="YOUR_ACTUAL_HERE_API_KEY" // Replace this
  onChargerSelect={(charger) => {
    console.log('Selected charger:', charger);
  }}
/>
```

**NewSuperAdminDashboard.tsx:**
```tsx
<EVMapComponent 
  height="700px"
  adminMode={true}
  apiKey="YOUR_ACTUAL_HERE_API_KEY" // Replace this
  onChargerSelect={(charger) => {
    console.log('Super admin selected charger:', charger);
  }}
/>
```

### 3. Environment Variables (Recommended)
For production deployments, store the API key in environment variables:

Create `.env.local`:
```
VITE_HERE_API_KEY=your_actual_here_api_key_here
```

Then update the components to use:
```tsx
apiKey={import.meta.env.VITE_HERE_API_KEY || 'YOUR_HERE_API_KEY'}
```

## Component Structure

### EVMapComponent Props
- `height?: string` - Map container height (default: "600px")
- `apiKey?: string` - HERE API key (required)
- `onChargerSelect?: (charger: EVCharger) => void` - Callback when charger is selected
- `adminMode?: boolean` - Enables admin features (add/edit/delete)

### EVCharger Interface
```typescript
interface EVCharger {
  id: string
  name: string
  lat: number
  lng: number
  type: 'fast' | 'rapid' | 'ultra-fast'
  status: 'available' | 'occupied' | 'maintenance' | 'offline'
  power: number // kW
  connectorTypes: string[]
  price: number // per kWh
  operator: string
  address: string
  amenities: string[]
  createdAt: string
  updatedAt: string
}
```

## Admin Features

### Regular Admin (AdminDashboard)
- View all EV chargers on map
- Search and filter chargers
- View detailed charger information
- Add new charging stations by clicking on map
- Edit existing charger details
- Delete charging stations

### Super Admin (NewSuperAdminDashboard)
- All regular admin features
- Global network overview across all brands
- Enhanced statistics and analytics
- Multi-brand charger management
- Network performance monitoring

## Map Controls

### Search & Filter
- **Search Bar**: Search by charger name, location, or operator
- **Status Filter**: Filter by availability status
- **Type Filter**: Filter by charger type (fast, rapid, ultra-fast)
- **Refresh Button**: Reload map data

### Map Interactions
- **Click Markers**: View charger details in side panel
- **Admin Mode**: Click anywhere on map to add new charger
- **Zoom Controls**: Standard HERE Maps zoom functionality
- **Pan**: Drag to navigate around the map

## Mock Data
The current implementation includes mock data for demonstration:
- Delhi Central Mall - Fast Charging Hub
- Mumbai Bandra Station - Ultra Fast
- Bangalore Tech Park - Rapid Charging  
- Chennai Airport - Express Charging

## Backend Integration
To connect with real data, update the following:

1. Replace mock data with API calls to your backend
2. Implement CRUD operations for chargers
3. Add real-time status updates via WebSocket
4. Integrate with payment and booking systems

## Troubleshooting

### Common Issues
1. **Map not loading**: Check HERE API key validity
2. **CORS errors**: Ensure domain is registered with HERE
3. **TypeScript errors**: Update types for strict mode if needed

### HERE API Limits
- Free tier: 250,000 requests/month
- Rate limits: 5 requests/second
- Monitor usage in HERE Developer Portal

## Future Enhancements
- Route planning to charging stations
- Real-time occupancy updates
- Booking and reservation system
- Navigation integration
- Mobile app synchronization
- Analytics dashboard
- Geofencing alerts
- Multi-language support