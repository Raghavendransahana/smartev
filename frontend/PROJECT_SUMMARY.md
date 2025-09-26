# SmartEV Dashboard - Project Structure Summary

## 📱 React Native + Expo EV Dashboard

A comprehensive hackathon project showcasing an Electric Vehicle dashboard with blockchain integration.

## 🏗️ Architecture Overview

### Core Technologies
- **React Native** with **Expo SDK 49**
- **TypeScript** for type safety
- **React Navigation** for screen management
- **React Context** for state management
- **React Native SVG** for custom graphics

### Project Structure

```
frontend/
├── App.tsx                     # Main app entry point
├── app.json                   # Expo configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── babel.config.js            # Babel configuration
├── metro.config.js            # Metro bundler configuration
├── .gitignore                 # Git ignore rules
├── README.md                  # Project documentation
│
├── assets/                    # Static assets
│   ├── icon.png.placeholder
│   ├── splash.png.placeholder
│   ├── adaptive-icon.png.placeholder
│   └── favicon.png.placeholder
│
└── src/
    ├── api/                   # API Integration Layer
    │   ├── vehicleApi.ts      # Vehicle telemetry API
    │   └── blockchainApi.ts   # Blockchain/ledger API
    │
    ├── components/            # Reusable UI Components
    │   ├── DashboardCard.tsx  # Dashboard info cards
    │   ├── Gauge.tsx         # Circular progress gauges
    │   ├── BatteryChart.tsx  # Battery level visualization
    │   └── LedgerList.tsx    # Transaction list component
    │
    ├── screens/              # Main Application Screens
    │   ├── DashboardScreen.tsx # Main vehicle dashboard
    │   ├── LedgerScreen.tsx   # Blockchain transaction ledger
    │   └── SettingsScreen.tsx # App settings and theme selector
    │
    ├── navigation/           # Navigation Configuration
    │   └── AppNavigator.tsx  # Stack navigator setup
    │
    ├── contexts/            # React Context Providers
    │   ├── ThemeContext.tsx # Theme management system
    │   └── VehicleContext.tsx # Vehicle state management
    │
    ├── hooks/               # Custom React Hooks
    │   ├── useVehicleState.ts # Vehicle data fetching
    │   └── useLedger.ts      # Blockchain ledger management
    │
    ├── theme/               # Theme System
    │   ├── themes.ts        # Theme definitions (Brand A & B)
    │   └── styles.ts        # Style utility functions
    │
    └── utils/               # Utility Functions
        └── helpers.ts       # Common helper functions
```

## 🎨 Theme System

### Dual Brand Support
- **Brand A**: Emerald Green theme (#10B981)
- **Brand B**: Deep Forest Green theme (#16A34A)

### Theme Features
- Dynamic theme switching
- Consistent color palettes
- Typography scales
- Spacing systems
- Component styling utilities

## 📱 Screen Features

### Dashboard Screen
- **Real-time Vehicle Metrics**
  - Battery level gauge (0-100%)
  - Speed gauge (0-160 km/h)
  - Range, temperature, efficiency displays
  - Charging status indicator
- **Battery History Chart**
- **Quick Action Buttons**
  - Start charging
  - Lock vehicle
  - Climate control
  - Find my car

### Ledger Screen
- **Blockchain Transaction List**
  - Transaction type indicators
  - Amount and currency display
  - Status badges (pending/confirmed/failed)
  - Transaction hash display
- **Add Mock Transactions**
- **Real-time Updates**

### Settings Screen
- **Brand Theme Selector**
- **App Configuration**
  - Notifications
  - Privacy & Security
  - Data Sync
- **Data Management**
  - Export data
  - Reset app data
- **About & Help**

## 🔧 Components

### DashboardCard
- Flexible info display card
- Icon support
- Theme-aware styling
- Subtitle and unit display

### Gauge
- SVG-based circular gauge
- Customizable colors and sizes
- Animated progress display
- Center value display

### BatteryChart
- Bar chart visualization
- Historical data display
- Theme-integrated colors
- Responsive design

### LedgerList
- Transaction list with icons
- Status color coding
- Touch interactions
- Loading and empty states

## 🔌 API Integration

### Vehicle API (`vehicleApi.ts`)
```typescript
- getVehicleState(): Promise<VehicleState>
- updateVehicleSettings(settings): Promise<void>
- startCharging(): Promise<void>
- stopCharging(): Promise<void>
- getChargingHistory(): Promise<ChargingRecord[]>
```

### Blockchain API (`blockchainApi.ts`)
```typescript
- getLedgerRecords(): Promise<LedgerRecord[]>
- createLedgerRecord(record): Promise<LedgerRecord>
- getTransactionStatus(hash): Promise<TransactionStatus>
- getWalletBalance(): Promise<WalletBalance>
- subscribeToEvents(callback): () => void
```

## 📊 Data Models

### Vehicle State
```typescript
interface VehicleState {
  batteryLevel: number;      // 0-100%
  speed: number;             // km/h
  batteryTemp: number;       // °C
  range: number;             // km
  isCharging: boolean;
  chargingRate: number;      // kW
  location: { lat: number; lng: number };
  odometer: number;          // km
  efficiency: number;        // kWh/100km
}
```

### Ledger Record
```typescript
interface LedgerRecord {
  id: string;
  timestamp: Date;
  type: 'charging' | 'payment' | 'energy_trade' | 'maintenance';
  amount: number;
  currency: string;
  description: string;
  transactionHash?: string;
  blockNumber?: number;
  status: 'pending' | 'confirmed' | 'failed';
}
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Run on Platform**
   ```bash
   npm run android  # Android
   npm run ios      # iOS
   npm run web      # Web
   ```

## 🔮 Mock Data

All APIs currently use mock data for demonstration:
- Vehicle state with random realistic values
- Blockchain transactions with sample data
- Real-time updates simulation
- Error state handling

## 🎯 Production Readiness

### Current Status: Hackathon MVP
- ✅ Complete UI/UX implementation
- ✅ Theme system with brand switching
- ✅ Mock API integration
- ✅ TypeScript type safety
- ✅ Responsive design
- ✅ Navigation system

### Next Steps for Production
- 🔄 Replace mock APIs with real backends
- 🔐 Implement authentication system
- 🌐 Add WebSocket connections
- ⛓️ Integrate real blockchain networks
- 🧪 Add comprehensive testing
- 📱 Platform-specific optimizations
- 🚀 CI/CD pipeline setup

## 📄 Key Dependencies

```json
{
  "expo": "~49.0.15",
  "react": "18.2.0",
  "react-native": "0.72.6",
  "@react-navigation/native": "^6.1.7",
  "@react-navigation/stack": "^6.3.17",
  "react-native-svg": "13.9.0",
  "@react-native-async-storage/async-storage": "1.18.2",
  "@react-native-picker/picker": "2.4.10"
}
```

This project serves as a comprehensive foundation for an EV dashboard application with blockchain integration, ready for hackathon demonstration and further development.
