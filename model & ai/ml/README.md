# 🔋 Battery Twin Project - Real-Time Monitoring System

A comprehensive real-time battery monitoring and prediction system with live trip simulation, colorful dashboard, and AI-powered analytics.

## ✨ Features

🚗 **Live Trip Simulation**
- Real-time battery parameter generation
- Realistic trip phases (highway, city, parking, charging)
- Dynamic voltage, temperature, current, and SOC changes

📊 **Colorful Real-Time Dashboard** 
- Beautiful gradient-colored interface
- Live updating charts and metrics
- Trip phase indicators with status colors
- Auto-refresh every 2 seconds

🤖 **AI-Powered Predictions**
- State of Health (SOH) prediction using Random Forest
- Remaining Useful Life (RUL) prediction using GRU neural networks
- Real-time battery status assessment

🔍 **Advanced Analytics**
- Trend analysis and pattern detection
- Battery degradation monitoring
- Performance optimization recommendations

## 🚀 Quick Start

### Option 1: One-Click Launch (Recommended)
```bash
python launch_battery_twin.py
```
Then select option 1 for the complete system!

### Option 2: Manual Launch

1. **Start Live Simulator**:
   ```bash
   python live_simulator.py
   ```

2. **Start Flexi-EV Dashboard**:
   ```bash
   python flexi_ev_dashboard.py
   ```

3. **Access Dashboard**: Open http://127.0.0.1:8055

## 📁 Project Structure

```
battery_twin_project/
├── 🚀 launch_battery_twin.py     # Main launcher with menu
├── 🔄 live_simulator.py          # Real-time trip simulation
├── 🌈 flexi_ev_dashboard.py      # Beautiful Flexi-EV themed dashboard
├── 🤖 run_flexi_ev.py            # Chatbot server launcher
├── � flexi-ev-chatbot.html      # Interactive chatbot interface
├── 🎨 flexi-ev-styles.css        # Flexi-EV styling
├── ⚡ flexi-ev-script.js          # Chatbot functionality
├── data/                         # Battery datasets
├── models/                       # Trained AI models
└── notebooks/                    # Analysis notebooks
```

## 🎯 System Components

### 🔄 Live Simulator (`live_simulator.py`)
- Generates realistic battery data every 2 seconds
- Simulates different trip phases with appropriate parameters
- Saves data to `live_trip_data.json`
- Runs continuously in background

### 🌈 Flexi-EV Dashboard (`flexi_ev_dashboard.py`)
- **Metric Cards**: Voltage, SOH, Temperature, Current, Status
- **Live Charts**: 6 real-time parameter visualizations
- **Trip Phases**: Visual indicators for driving conditions
- **Auto-Updates**: Refreshes every 2 seconds
- **Modern UI**: Gradient colors and responsive design

### 🤖 AI Models
- **SOH Model**: Random Forest for health percentage prediction
- **RUL Model**: GRU neural network for remaining life cycles
- **Real-time Analysis**: Instant battery condition assessment

## 📊 Dashboard Features

### Colorful Metric Cards
- ⚡ **Voltage**: Real-time voltage with status colors
- 🔋 **SOH**: State of Health percentage
- 🌡️ **Temperature**: Battery temperature monitoring  
- 🔄 **Current**: Current flow visualization
- 🎯 **Status**: REUSE/REFURBISH/RECYCLE recommendations

### Live Parameter Charts
- **Voltage Trend**: Gradient-filled line chart
- **Temperature Evolution**: Color-coded temperature points
- **State of Health**: Health degradation tracking
- **Remaining Life**: Cycle predictions
- **Current Flow**: Phase-based current visualization
- **State of Charge**: Battery-like SOC display

### Trip Phase Indicators
- 🛣️ **Highway**: High-speed cruising conditions
- 🏙️ **City**: Stop-and-go urban traffic
- 🅿️ **Parking**: Stationary with minimal drain
- 🔌 **Charging**: Battery charging simulation

## 🎨 Color Schemes

The dashboard uses beautiful gradient color schemes:
- **Primary**: Deep blue gradients for voltage metrics
- **Health**: Green-to-red gradients for SOH status
- **Temperature**: Blue-to-red thermal mapping
- **Current**: Phase-based dynamic colors
- **Status**: Intuitive green/yellow/red indicators

## ⚙️ Requirements

```
dash>=2.0.0
plotly>=5.0.0
pandas>=1.3.0
numpy>=1.21.0
torch>=1.9.0
scikit-learn>=1.0.0
```

## 🔧 Configuration

### Dashboard Settings
- **Port**: 8055 (configurable)
- **Update Interval**: 3 seconds
- **Auto-refresh**: Enabled
- **Data Source**: `live_trip_data.json`

### Simulator Settings
- **Update Rate**: 2 seconds per reading
- **Trip Duration**: Configurable phases
- **Parameter Ranges**: Realistic battery values
- **Background Mode**: Continuous operation

## 🎯 Usage Examples

### Complete System Launch
```bash
python launch_battery_twin.py
# Select option 1: START COMPLETE SYSTEM
```

### Dashboard Only
```bash
python flexi_ev_dashboard.py
# Access: http://127.0.0.1:8055
```

### Live Data Generation
```bash
python live_simulator.py
# Generates: live_trip_data.json
```

## 🌟 Key Benefits

- **Real-Time Monitoring**: Live battery parameter tracking
- **Beautiful Visualization**: Modern, colorful interface
- **AI Predictions**: Intelligent health and life assessments  
- **Realistic Simulation**: Authentic trip condition modeling
- **Easy Deployment**: One-click launcher system
- **No Database Required**: JSON-based lightweight operation

## 🚗 Trip Simulation Details

The system simulates realistic battery behavior:

- **Highway Phase**: Steady high current draw, moderate heating
- **City Phase**: Variable current, stop-and-go patterns
- **Parking Phase**: Minimal drain, cooling period
- **Charging Phase**: Current reversal, SOC increase

Each phase affects battery parameters differently, providing realistic degradation patterns and usage scenarios.

## 🎨 Visual Features

- **Gradient Backgrounds**: Beautiful color transitions
- **Live Animations**: Smooth parameter updates
- **Responsive Cards**: Modern metric displays
- **Status Colors**: Intuitive health indicators
- **Phase Visualizations**: Clear trip state displays

## 🔄 Data Flow

```
Live Simulator → JSON File → Dashboard → Real-Time Charts
     ↓              ↓            ↓           ↓
Trip Phases → Parameter Gen → Live Updates → Visual Display
```

## 🎯 Perfect For

- Battery research and development
- Real-time monitoring demonstrations
- Educational battery technology showcases
- IoT battery management system prototypes
- Visual battery health presentations

Start monitoring your battery's digital twin today! 🔋✨
