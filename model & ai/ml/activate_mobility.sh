#!/bin/bash
# Mobility Environment Activation Script
# This script activates the mobility virtual environment and provides easy access to the battery models

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔋 SmartEV Battery Twin - Mobility Environment${NC}"
echo -e "${BLUE}=================================================${NC}"

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Activate the virtual environment
echo -e "${GREEN}Activating mobility virtual environment...${NC}"
source "$SCRIPT_DIR/mobility/bin/activate"

# Check if activation was successful
if [ "$VIRTUAL_ENV" != "" ]; then
    echo -e "${GREEN}✅ Virtual environment activated: $(basename $VIRTUAL_ENV)${NC}"
else
    echo -e "${YELLOW}⚠️ Virtual environment activation may have failed${NC}"
fi

# Show available commands
echo -e "\n${YELLOW}🚀 Available Commands:${NC}"
echo -e "  ${GREEN}python test_models.py${NC}          - Test all models"
echo -e "  ${GREEN}python launch_battery_twin.py${NC}  - Launch interactive battery system"
echo -e "  ${GREEN}python flexi_ev_dashboard.py${NC}   - Start dashboard (http://127.0.0.1:8055)"
echo -e "  ${GREEN}python live_simulator.py${NC}       - Start live data simulator"
echo -e "  ${GREEN}python run_flexi_ev.py${NC}         - Start chatbot server"

# Show Python info
echo -e "\n${YELLOW}📋 Environment Info:${NC}"
echo -e "  Python: $(python --version)"
echo -e "  Location: $(which python)"
echo -e "  Working Directory: $PWD"

echo -e "\n${BLUE}💡 To deactivate when done: ${GREEN}deactivate${NC}"
echo -e "${BLUE}=================================================${NC}"

# Keep shell open in the activated environment
exec "$SHELL"