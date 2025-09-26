# 🔋 SmartEV Battery Twin - Mobility Environment

This directory contains a complete battery monitoring system with SOH (State of Health) and RUL (Remaining Useful Life) models, set up in a dedicated Python virtual environment named "mobility".

## 🚀 Quick Start

### 1. Activate Environment
```bash
# Method 1: Use the activation script
./activate_mobility.sh

# Method 2: Manual activation
source mobility/bin/activate
```

### 2. Test the Setup
```bash
python test_models.py
```

### 3. Run the Battery Twin System
```bash
# Interactive launcher with menu
python launch_battery_twin.py

# Or run individual components:
python flexi_ev_dashboard.py    # Dashboard at http://127.0.0.1:8055
python live_simulator.py       # Live data generation
python run_flexi_ev.py          # Chatbot interface
```

## 📁 Project Structure

```
model & ai/ml/
├── mobility/                   # Virtual environment
├── models/                     # Pre-trained ML models
│   ├── rul_gru.pth            # RUL GRU model
│   ├── rul_gru_normalized.pth # Normalized RUL GRU
│   ├── rul_lstm_model.pth     # RUL LSTM model
│   ├── rul_scaler.pkl         # Feature scaler
│   └── soh_rf_model.pkl       # SOH Random Forest model
├── data/                       # Training/sample data
│   └── synthetic_battery_data_medium.csv
├── notebooks/                  # Jupyter notebooks
├── activate_mobility.sh        # Environment activation script
├── test_models.py             # Model verification script
├── launch_battery_twin.py     # Main launcher
├── flexi_ev_dashboard.py      # Real-time dashboard
├── live_simulator.py          # Data simulator
└── requirements.txt           # Dependencies
```

## 🧪 Available Models

### RUL (Remaining Useful Life) Models
- **GRU Model**: `rul_gru.pth` - Gated Recurrent Unit for RUL prediction
- **GRU Normalized**: `rul_gru_normalized.pth` - Normalized version for better accuracy
- **LSTM Model**: `rul_lstm_model.pth` - Long Short-Term Memory for sequential prediction
- **Scaler**: `rul_scaler.pkl` - MinMaxScaler for feature normalization

### SOH (State of Health) Model
- **Random Forest**: `soh_rf_model.pkl` - Ensemble model for battery health prediction

## 🔧 System Components

### 1. Launch Battery Twin (`launch_battery_twin.py`)
Interactive launcher with multiple options:
- Complete system with live simulation and dashboard
- Dashboard only mode
- Live simulator only
- Cleanup and reset functionality

### 2. Dashboard (`flexi_ev_dashboard.py`)
Real-time web dashboard featuring:
- Live battery metrics (SOC, voltage, current, temperature)
- Flexi-EV themed dark interface
- Auto-refreshing charts (every 3 seconds)
- Health status and range calculations

### 3. Live Simulator (`live_simulator.py`)
Generates realistic battery data:
- Trip phase simulation (highway, city, parking)
- Dynamic battery parameter changes
- JSON output for dashboard consumption

### 4. Chatbot Interface (`run_flexi_ev.py`)
Simple HTTP server for chatbot interaction

## 📦 Dependencies

The mobility environment includes:
```
dash==2.17.1          # Web dashboard framework
plotly==5.17.0        # Interactive charts
pandas==2.1.3         # Data manipulation
numpy==1.26.4         # Numerical computing (upgraded for compatibility)
scikit-learn==1.3.2   # Machine learning models
torch==2.1.1          # Deep learning models
joblib==1.3.2         # Model serialization
```

## 🎯 Usage Examples

### Test All Models
```bash
source mobility/bin/activate
python test_models.py
```

### Start Complete System
```bash
source mobility/bin/activate
python launch_battery_twin.py
# Select option 1 for complete system
```

### Dashboard Only
```bash
source mobility/bin/activate
python flexi_ev_dashboard.py
# Visit http://127.0.0.1:8055
```

### Live Data Generation
```bash
source mobility/bin/activate
python live_simulator.py
# Check live_trip_data.json for generated data
```

## 🔍 Troubleshooting

### Model Loading Issues
If you see scikit-learn version warnings, they're typically non-critical. The models were trained with a newer version but remain functional.

### Port Already in Use
If port 8055 is busy:
```bash
# Kill any existing processes
pkill -f flexi_ev_dashboard.py
pkill -f live_simulator.py
```

### Virtual Environment Issues
```bash
# Recreate if needed
rm -rf mobility/
python3 -m venv mobility
source mobility/bin/activate
pip install -r requirements.txt
```

## 🌟 Features

- ✅ Complete battery twin digital representation
- ✅ Real-time SOH and RUL predictions
- ✅ Interactive web dashboard with Flexi-EV theme
- ✅ Live trip simulation with realistic data
- ✅ Multiple ML model types (GRU, LSTM, Random Forest)
- ✅ Comprehensive testing framework
- ✅ Easy environment management

## 📊 Model Performance

The models provide:
- **RUL Prediction**: Remaining cycle life estimation
- **SOH Assessment**: Battery health percentage
- **Real-time Monitoring**: Continuous parameter tracking
- **Trip Analysis**: Phase-based battery behavior

## 🔄 Deactivation

When finished, deactivate the environment:
```bash
deactivate
```

## 📝 Notes

- Models were pre-trained on synthetic battery data
- Dashboard auto-refreshes every 3 seconds for live updates
- All models support CPU-only inference (no GPU required)
- The system generates realistic battery degradation patterns
- Compatible with macOS, Linux, and Windows (with minor path adjustments)

---

**Created**: September 27, 2025  
**Environment**: Python 3.9+ with mobility venv  
**Status**: ✅ Fully Operational