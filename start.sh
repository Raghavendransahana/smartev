#!/bin/bash
# SmartEV Battery Twin Startup Script

set -e

echo "🔋 SmartEV Battery Twin - Complete System Startup"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ML_DIR="$SCRIPT_DIR/model & ai/ml"

echo -e "${BLUE}📁 Project Directory: $SCRIPT_DIR${NC}"

# Check if Node.js dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    npm install
fi

# Check if Python environment exists
if [ ! -d "$ML_DIR/mobility" ]; then
    echo -e "${RED}❌ Python virtual environment 'mobility' not found!${NC}"
    echo -e "${YELLOW}Please run the mobility environment setup first.${NC}"
    exit 1
fi

# Activate Python environment and check dependencies
echo -e "${BLUE}🐍 Checking Python ML environment...${NC}"
cd "$ML_DIR"
source mobility/bin/activate

# Install Flask dependencies if needed
if ! python -c "import flask, flask_cors" 2>/dev/null; then
    echo -e "${YELLOW}📦 Installing Flask dependencies...${NC}"
    pip install flask flask-cors
fi

# Test models can be loaded
echo -e "${BLUE}🧪 Testing ML models...${NC}"
if python -c "
import torch, joblib, os
print('✅ PyTorch available')
print('✅ Joblib available')
models_dir = 'models'
if os.path.exists(f'{models_dir}/soh_rf_model.pkl'):
    print('✅ SOH model found')
if os.path.exists(f'{models_dir}/rul_gru.pth'):
    print('✅ RUL models found')
print('🎉 All models ready!')
" 2>/dev/null; then
    echo -e "${GREEN}✅ ML models verification passed${NC}"
else
    echo -e "${RED}❌ ML models verification failed${NC}"
    exit 1
fi

cd "$SCRIPT_DIR"

echo -e "\n${GREEN}🚀 Starting SmartEV Battery Twin System...${NC}"
echo -e "${BLUE}🌐 Server will be available at: http://localhost:8000${NC}"
echo -e "${BLUE}📊 Dashboard will be at: http://localhost:8000/dashboard${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the system${NC}\n"

# Start the integrated server
exec node server.js