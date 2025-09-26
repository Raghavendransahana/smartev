# ============================================================================
# 🚀 BATTERY TWIN PROJECT LAUNCHER
# Complete Real-Time Battery Monitoring System
# ============================================================================

import subprocess
import sys
import os
import time
import json
import threading
from datetime import datetime

class BatteryTwinLauncher:
    def __init__(self):
        """Initialize the Battery Twin Project launcher"""
        self.project_dir = os.path.dirname(os.path.abspath(__file__))
        
    def print_banner(self):
        """Print colorful project banner"""
        banner = """
╔══════════════════════════════════════════════════════════════════════╗
║                    🔋 BATTERY TWIN PROJECT 🔋                        ║
║                  Real-Time Battery Monitoring System                 ║
╠══════════════════════════════════════════════════════════════════════╣
║  🚗 Live Trip Simulation  │  📊 Real-Time Dashboard  │  🔍 Analytics ║
║  🌡️ Temperature Monitor   │  ⚡ Voltage Tracking     │  🔋 SOH/SOC   ║
║  🤖 AI Predictions        │  📈 Trend Analysis       │  🌈 Colorful  ║
╚══════════════════════════════════════════════════════════════════════╝
        """
        print(banner)
    
    def check_dependencies(self):
        """Check if required dependencies are installed"""
        required_packages = [
            'dash', 'plotly', 'pandas', 'numpy', 'torch', 'sklearn'
        ]
        
        missing = []
        for package in required_packages:
            try:
                __import__(package)
            except ImportError:
                missing.append(package)
        
        if missing:
            print(f"❌ Missing packages: {', '.join(missing)}")
            print("📦 Installing missing packages...")
            
            for package in missing:
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            
            print("✅ All dependencies installed!")
        else:
            print("✅ All dependencies are available!")
    
    def cleanup_old_files(self):
        """Clean up old data files"""
        cleanup_files = [
            'battery_data.json',
            'trip_analytics.json',
            'battery_readings.json'
        ]
        
        cleaned = 0
        for file in cleanup_files:
            file_path = os.path.join(self.project_dir, file)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    cleaned += 1
                except:
                    pass
        
        if cleaned > 0:
            print(f"🧹 Cleaned up {cleaned} old data files")
    
    def start_live_simulator(self):
        """Start the live battery simulator in background"""
        try:
            simulator_path = os.path.join(self.project_dir, 'live_simulator.py')
            if os.path.exists(simulator_path):
                print("🔄 Starting live battery simulator...")
                # Start simulator in background
                subprocess.Popen([sys.executable, simulator_path], 
                               stdout=subprocess.DEVNULL, 
                               stderr=subprocess.DEVNULL)
                time.sleep(2)  # Give it time to start
                print("✅ Live simulator started!")
                return True
            else:
                print("⚠️ Live simulator not found")
                return False
        except Exception as e:
            print(f"❌ Error starting simulator: {e}")
            return False
    
    def start_dashboard(self):
        """Start the colorful dashboard"""
        try:
            dashboard_path = os.path.join(self.project_dir, 'colorful_dashboard.py')
            if os.path.exists(dashboard_path):
                print("🌈 Starting colorful dashboard...")
                print("🌐 Dashboard will be available at: http://127.0.0.1:8052")
                print("🔄 Auto-refreshes every 2 seconds with live data")
                print("👀 Watch the battery parameters change in real-time!")
                
                # Start dashboard
                subprocess.call([sys.executable, dashboard_path])
            else:
                print("❌ Dashboard not found")
        except KeyboardInterrupt:
            print("\n👋 Dashboard stopped by user")
        except Exception as e:
            print(f"❌ Error starting dashboard: {e}")
    
    def show_menu(self):
        """Show main menu"""
        menu = """
🎯 CHOOSE YOUR OPTION:

1️⃣  🚀 START COMPLETE SYSTEM (Recommended)
    ├── Live trip simulation with changing data
    ├── Colorful real-time dashboard
    └── Full analytics and monitoring

2️⃣  📊 DASHBOARD ONLY
    └── View dashboard with sample data

3️⃣  🔄 LIVE SIMULATOR ONLY
    └── Generate live trip data (background)

4️⃣  🧹 CLEANUP & RESET
    └── Clean old files and reset system

5️⃣  ❌ EXIT

Enter your choice (1-5): """
        
        while True:
            print(menu)
            choice = input().strip()
            
            if choice == '1':
                print("\n🚀 Starting Complete Battery Twin System...")
                self.cleanup_old_files()
                simulator_started = self.start_live_simulator()
                if simulator_started:
                    print("⏳ Waiting for live data generation...")
                    time.sleep(3)
                self.start_dashboard()
                break
                
            elif choice == '2':
                print("\n📊 Starting Dashboard Only...")
                self.start_dashboard()
                break
                
            elif choice == '3':
                print("\n🔄 Starting Live Simulator Only...")
                if self.start_live_simulator():
                    print("✅ Simulator running in background")
                    print("📂 Check 'live_trip_data.json' for generated data")
                    input("Press Enter to continue...")
                break
                
            elif choice == '4':
                print("\n🧹 Cleaning up...")
                self.cleanup_old_files()
                print("✅ Cleanup complete!")
                input("Press Enter to continue...")
                
            elif choice == '5':
                print("\n👋 Goodbye!")
                break
                
            else:
                print("❌ Invalid choice! Please enter 1-5")
    
    def run(self):
        """Run the launcher"""
        try:
            self.print_banner()
            print("🔍 Checking system requirements...")
            self.check_dependencies()
            print()
            self.show_menu()
        except KeyboardInterrupt:
            print("\n\n👋 Launcher stopped by user")
        except Exception as e:
            print(f"❌ Launcher error: {e}")

def main():
    """Main function"""
    launcher = BatteryTwinLauncher()
    launcher.run()

if __name__ == "__main__":
    main()
