#!/usr/bin/env node
/**
 * SmartEV Battery Twin - Ultra Simple Server
 * Port: 8000 - Just GET endpoints with auto-updating battery data
 * Updates every 2 seconds with ML predictions
 */

const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 8000;

// Battery data that updates every 2 seconds
let batteryData = {
  voltage: 3.7,
  current: 2.0,
  temperature: 25.0,
  soc: 85.0,
  soh: 87.5,
  rul: 1250,
  health_status: "good",
  timestamp: new Date().toISOString(),
  range_km: 280,
  efficiency: 89,
  update_count: 0,
};

// Setup middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Simple GET endpoints
app.get("/battery", (req, res) => {
  res.json({
    success: true,
    data: batteryData,
    message: `Auto-updated every 2 seconds (Update #${batteryData.update_count})`,
  });
});

app.get("/battery/soh", (req, res) => {
  res.json({
    success: true,
    soh: batteryData.soh,
    status: batteryData.health_status,
    timestamp: batteryData.timestamp,
  });
});

app.get("/battery/rul", (req, res) => {
  res.json({
    success: true,
    rul_cycles: batteryData.rul,
    rul_days: Math.round(batteryData.rul / 1.5),
    rul_months: Math.round(batteryData.rul / 45),
    timestamp: batteryData.timestamp,
  });
});

app.get("/battery/metrics", (req, res) => {
  res.json({
    success: true,
    voltage: batteryData.voltage,
    current: batteryData.current,
    temperature: batteryData.temperature,
    soc: batteryData.soc,
    range_km: batteryData.range_km,
    timestamp: batteryData.timestamp,
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    server: "SmartEV Battery Twin (Ultra Simple)",
    port: port,
    auto_update: "Every 2 seconds",
    updates_completed: batteryData.update_count,
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "SmartEV Battery Twin - Ultra Simple Server",
    version: "3.0.0",
    auto_update: "Every 2 seconds",
    endpoints: {
      all_battery_data: "GET /battery",
      soh_only: "GET /battery/soh",
      rul_only: "GET /battery/rul",
      metrics_only: "GET /battery/metrics",
      health_check: "GET /health",
    },
    sample_usage: {
      get_battery: "curl http://localhost:8000/battery",
      get_soh: "curl http://localhost:8000/battery/soh",
      get_rul: "curl http://localhost:8000/battery/rul",
    },
    current_data: batteryData,
  });
});

// Update battery data every 2 seconds
function updateBatteryData() {
  const now = new Date();
  const timeOfDay = now.getHours() + now.getMinutes() / 60;

  // Simulate realistic battery changes
  let loadFactor = 1.0;
  if (timeOfDay >= 8 && timeOfDay <= 18) {
    loadFactor = 1.2; // Day usage
  } else if (timeOfDay >= 18 && timeOfDay <= 22) {
    loadFactor = 1.5; // Peak evening
  } else {
    loadFactor = 0.5; // Night
  }

  // Update parameters with realistic variations
  batteryData.voltage = 3.6 + Math.random() * 0.3;
  batteryData.current = (1.5 + Math.random() * 2.0) * loadFactor;
  batteryData.temperature = 20 + Math.random() * 15 + (loadFactor - 1) * 5;

  // SOC changes (charging vs discharging)
  if (Math.random() > 0.7) {
    // 30% chance charging
    batteryData.soc = Math.min(100, batteryData.soc + Math.random() * 2);
  } else {
    batteryData.soc = Math.max(
      20,
      batteryData.soc - Math.random() * 0.5 * loadFactor
    );
  }

  // Try ML prediction, fallback to simple calculation
  tryMLPrediction();

  batteryData.timestamp = now.toISOString();
  batteryData.update_count++;

  console.log(
    `🔄 Update #${batteryData.update_count}: SOH=${batteryData.soh}%, RUL=${
      batteryData.rul
    } cycles, SOC=${batteryData.soc.toFixed(1)}%`
  );
}

function tryMLPrediction() {
  const mlDir = path.join(__dirname, "model & ai", "ml");
  const pythonScript = path.join(mlDir, "quick_predict.py");
  const venvPython = path.join(mlDir, "mobility", "bin", "python");

  if (fs.existsSync(venvPython) && fs.existsSync(pythonScript)) {
    const inputData = JSON.stringify({
      voltage: batteryData.voltage,
      current: batteryData.current,
      temperature: batteryData.temperature,
      soc: batteryData.soc,
    });

    const command = `cd "${mlDir}" && "${venvPython}" quick_predict.py '${inputData}'`;

    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
      if (!error && stdout.trim()) {
        try {
          const result = JSON.parse(stdout.trim());
          if (result.success !== false) {
            batteryData.soh = result.soh || batteryData.soh;
            batteryData.rul = result.rul || batteryData.rul;
            batteryData.health_status = getHealthStatus(batteryData.soh);
            batteryData.range_km = calculateRange();
            batteryData.efficiency = calculateEfficiency();
            return; // ML prediction successful
          }
        } catch (e) {
          // JSON parse error, use fallback
        }
      }
      // Use fallback on any error
      useFallbackCalculation();
    });
  } else {
    // No ML available, use fallback
    useFallbackCalculation();
  }
}

function useFallbackCalculation() {
  // Simple calculations when ML is not available
  const { voltage, temperature, soc } = batteryData;

  // SOH based on voltage and temperature
  let soh =
    100 - Math.abs(temperature - 25) * 0.2 - Math.abs(voltage - 3.7) * 8;
  soh = Math.max(60, Math.min(100, soh + (Math.random() - 0.5) * 3));

  // RUL based on SOH
  let rul = soh * 18 + Math.random() * 300;
  rul = Math.max(100, Math.min(2000, rul));

  batteryData.soh = Math.round(soh * 10) / 10;
  batteryData.rul = Math.round(rul);
  batteryData.health_status = getHealthStatus(soh);
  batteryData.range_km = calculateRange();
  batteryData.efficiency = calculateEfficiency();
}

function getHealthStatus(soh) {
  if (soh >= 90) return "excellent";
  if (soh >= 80) return "good";
  if (soh >= 70) return "fair";
  if (soh >= 60) return "poor";
  return "critical";
}

function calculateRange() {
  const { soc, soh } = batteryData;
  return Math.round((soc / 100) * 400 * (soh / 100));
}

function calculateEfficiency() {
  const { voltage, temperature, soh } = batteryData;
  let eff = (soh / 100) * 50;
  eff += voltage > 3.6 ? 25 : voltage * 7;
  eff += temperature < 30 ? 25 : Math.max(0, 25 - (temperature - 30));
  return Math.round(Math.min(100, eff));
}

// Start the server
app.listen(port, () => {
  console.log("🚀 SmartEV Battery Twin - Ultra Simple Server");
  console.log("============================================");
  console.log(`🌐 Server: http://localhost:${port}`);
  console.log(`🔋 Battery: http://localhost:${port}/battery`);
  console.log(`📊 SOH: http://localhost:${port}/battery/soh`);
  console.log(`⏱️  RUL: http://localhost:${port}/battery/rul`);
  console.log("🔄 Auto-updating every 2 seconds");
  console.log("============================================");

  // Start auto-updates
  console.log("🔄 Starting auto-update cycle...");
  updateBatteryData(); // Initial update
  setInterval(updateBatteryData, 2000); // Update every 2 seconds
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  process.exit(0);
});
