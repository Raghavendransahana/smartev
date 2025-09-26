# ============================================================================
# 🔄 LIVE DATA SIMULATOR - Real-Time Battery Trip Simulation
# ============================================================================

import json
import time
import random
import math
from datetime import datetime, timedelta
import threading
import os

class LiveBatterySimulator:
    def __init__(self):
        """Initialize live battery data simulator"""
        self.is_running = False
        self.trip_data = {
            "name": "Live Highway Trip",
            "start_time": datetime.now().isoformat(),
            "readings": []
        }
        self.reading_count = 0
        self.simulation_thread = None
        
        # Initial realistic values
        self.voltage = 3.75
        self.current = 1.8
        self.temperature = 25.0
        self.cycle_count = 450
        self.soc = 85.0
        self.soh = 78.5
        self.rul = 1200.0
        
        # Simulation parameters
        self.trip_phase = "highway"  # highway, city, parking, charging
        self.phase_duration = 0
        self.phase_timer = 0
        
    def simulate_real_trip_conditions(self):
        """Simulate realistic battery conditions during different trip phases"""
        
        # Change trip phase periodically
        self.phase_timer += 1
        if self.phase_timer >= self.phase_duration:
            self.change_trip_phase()
        
        if self.trip_phase == "highway":
            # Highway driving: steady discharge, warming up
            self.voltage += random.uniform(-0.02, -0.01)  # Gradual voltage drop
            self.current = random.uniform(2.5, 3.5)       # High discharge
            self.temperature += random.uniform(0.1, 0.3)   # Warming up
            self.soc -= random.uniform(1.0, 2.0)          # Fast SOC drop
            
        elif self.trip_phase == "city":
            # City driving: variable discharge, moderate warming
            self.voltage += random.uniform(-0.01, 0.01)    # Variable voltage
            self.current = random.uniform(1.0, 2.5)        # Variable discharge
            self.temperature += random.uniform(0.0, 0.2)   # Moderate warming
            self.soc -= random.uniform(0.5, 1.2)          # Moderate SOC drop
            
        elif self.trip_phase == "parking":
            # Parked: minimal drain, cooling down
            self.voltage += random.uniform(-0.005, 0.005)  # Stable voltage
            self.current = random.uniform(0.1, 0.3)        # Low drain
            self.temperature -= random.uniform(0.1, 0.2)   # Cooling down
            self.soc -= random.uniform(0.1, 0.3)          # Minimal SOC drop
            
        elif self.trip_phase == "charging":
            # Charging: voltage rising, warming, SOC increasing
            self.voltage += random.uniform(0.01, 0.02)     # Voltage rising
            self.current = random.uniform(-2.5, -1.5)      # Negative (charging)
            self.temperature += random.uniform(0.2, 0.4)   # Warming during charge
            self.soc += random.uniform(2.0, 4.0)          # SOC increasing
        
        # Apply realistic constraints
        self.voltage = max(3.2, min(4.1, self.voltage))
        self.temperature = max(15.0, min(45.0, self.temperature))
        self.soc = max(10.0, min(100.0, self.soc))
        
        # SOH gradually decreases with cycles (very slowly)
        if random.random() < 0.1:  # 10% chance per reading
            self.soh -= random.uniform(0.01, 0.05)
            self.rul -= random.uniform(1.0, 3.0)
        
        self.soh = max(50.0, min(100.0, self.soh))
        self.rul = max(500.0, min(2000.0, self.rul))
        
        # Cycle count increases occasionally
        if random.random() < 0.05:  # 5% chance
            self.cycle_count += 1
    
    def change_trip_phase(self):
        """Change to a different trip phase"""
        phases = ["highway", "city", "parking", "charging"]
        current_index = phases.index(self.trip_phase)
        
        # Weighted random selection for realistic transitions
        if self.trip_phase == "highway":
            self.trip_phase = random.choice(["city", "parking"])
        elif self.trip_phase == "city":
            self.trip_phase = random.choice(["highway", "parking", "charging"])
        elif self.trip_phase == "parking":
            self.trip_phase = random.choice(["city", "charging"])
        elif self.trip_phase == "charging":
            self.trip_phase = random.choice(["city", "highway"])
        
        # Set duration for new phase (5-15 readings)
        self.phase_duration = random.randint(5, 15)
        self.phase_timer = 0
        
        print(f"🔄 Trip phase changed to: {self.trip_phase.upper()}")
    
    def classify_battery(self, soh):
        """Classify battery based on SOH"""
        if soh >= 70:
            return {"decision": "REUSE", "color": "🟢", "value": f"${int(soh * 3)}/kWh"}
        elif soh >= 60:
            return {"decision": "REFURBISH", "color": "🟡", "value": f"${int(soh * 2)}/kWh"}
        elif soh >= 40:
            return {"decision": "RECYCLE", "color": "🟠", "value": "$25/kWh"}
        else:
            return {"decision": "DISPOSE", "color": "🔴", "value": "$50 disposal fee"}
    
    def generate_reading(self):
        """Generate a single realistic reading"""
        self.reading_count += 1
        self.simulate_real_trip_conditions()
        
        reading = {
            "reading_number": self.reading_count,
            "timestamp": datetime.now().isoformat(),
            "voltage": round(self.voltage, 2),
            "current": round(self.current, 1),
            "temperature": round(self.temperature, 1),
            "cycle_count": self.cycle_count,
            "soc": round(self.soc, 1),
            "soh": round(self.soh, 1),
            "rul": round(self.rul, 0),
            "classification": self.classify_battery(self.soh),
            "trip_phase": self.trip_phase
        }
        
        return reading
    
    def save_live_data(self):
        """Save current trip data to JSON file"""
        filename = "live_trip_data.json"
        
        # Update trip metadata
        self.trip_data["readings"] = self.trip_data["readings"][-50:]  # Keep last 50 readings
        self.trip_data["last_updated"] = datetime.now().isoformat()
        self.trip_data["total_readings"] = self.reading_count
        self.trip_data["current_phase"] = self.trip_phase
        
        with open(filename, 'w') as f:
            json.dump(self.trip_data, f, indent=2)
    
    def run_simulation(self):
        """Run continuous simulation"""
        print("🚗 Starting Live Battery Trip Simulation...")
        print("📊 Generating realistic data every 2 seconds")
        print("🔄 Trip phases: Highway → City → Parking → Charging")
        
        # Initialize first phase
        self.change_trip_phase()
        
        while self.is_running:
            try:
                # Generate new reading
                reading = self.generate_reading()
                self.trip_data["readings"].append(reading)
                
                # Save to file
                self.save_live_data()
                
                # Display current status
                status_emoji = {
                    "highway": "🛣️",
                    "city": "🏙️", 
                    "parking": "🅿️",
                    "charging": "🔌"
                }
                
                print(f"{status_emoji.get(self.trip_phase, '🚗')} Reading #{self.reading_count}: "
                      f"V={reading['voltage']:.2f}V, I={reading['current']:.1f}A, "
                      f"T={reading['temperature']:.1f}°C, SOC={reading['soc']:.1f}%, "
                      f"SOH={reading['soh']:.1f}% [{self.trip_phase}]")
                
                # Wait 2 seconds
                time.sleep(2)
                
            except Exception as e:
                print(f"⚠️ Simulation error: {e}")
                time.sleep(2)
    
    def start(self):
        """Start the simulation in background"""
        if not self.is_running:
            self.is_running = True
            self.simulation_thread = threading.Thread(target=self.run_simulation)
            self.simulation_thread.daemon = True
            self.simulation_thread.start()
            print("✅ Live simulation started!")
    
    def stop(self):
        """Stop the simulation"""
        self.is_running = False
        if self.simulation_thread:
            self.simulation_thread.join(timeout=5)
        print("🛑 Live simulation stopped!")

def main():
    """Main function"""
    print("🔄 LIVE BATTERY DATA SIMULATOR")
    print("="*50)
    
    simulator = LiveBatterySimulator()
    
    try:
        simulator.start()
        
        print("\n📊 Simulation running! Press Ctrl+C to stop.")
        print("📁 Data saved to: live_trip_data.json")
        print("🌐 Use this data in your dashboard!")
        
        # Keep main thread alive
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping simulation...")
        simulator.stop()
        print("👋 Simulation stopped!")

if __name__ == "__main__":
    main()
