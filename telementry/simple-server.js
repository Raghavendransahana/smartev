#!/usr/bin/env node
/**
 * SmartEV Battery Twin - Simplified Express Server with Integrated ML
 * Port: 8000 (Single server with ML models embedded)
 * Auto-updates every 2 seconds
 */

const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

class SmartEVBatteryServer {
  constructor() {
    this.app = express();
    this.port = 8000;

    // Battery data that updates every 2 seconds
    this.currentBatteryData = {
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
    };

    this.setupMiddleware();
    this.setupRoutes();
    this.startDataUpdates();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static("public"));
  }

  setupRoutes() {
    // Simple GET endpoint for current battery data
    this.app.get("/battery", (req, res) => {
      res.json({
        success: true,
        data: this.currentBatteryData,
        message: "Current battery status (auto-updates every 2 seconds)",
      });
    });

    // GET endpoint for specific metrics
    this.app.get("/battery/soh", (req, res) => {
      res.json({
        success: true,
        soh: this.currentBatteryData.soh,
        status: this.currentBatteryData.health_status,
        timestamp: this.currentBatteryData.timestamp,
      });
    });

    this.app.get("/battery/rul", (req, res) => {
      res.json({
        success: true,
        rul_cycles: this.currentBatteryData.rul,
        rul_days: Math.round(this.currentBatteryData.rul / 1.5),
        rul_months: Math.round(this.currentBatteryData.rul / 45),
        timestamp: this.currentBatteryData.timestamp,
      });
    });

    this.app.get("/battery/metrics", (req, res) => {
      res.json({
        success: true,
        voltage: this.currentBatteryData.voltage,
        current: this.currentBatteryData.current,
        temperature: this.currentBatteryData.temperature,
        soc: this.currentBatteryData.soc,
        range_km: this.currentBatteryData.range_km,
        timestamp: this.currentBatteryData.timestamp,
      });
    });

    // POST endpoint to manually update battery input
    this.app.post("/battery/update", (req, res) => {
      const { voltage, current, temperature, soc } = req.body;

      if (voltage) this.currentBatteryData.voltage = parseFloat(voltage);
      if (current) this.currentBatteryData.current = parseFloat(current);
      if (temperature)
        this.currentBatteryData.temperature = parseFloat(temperature);
      if (soc) this.currentBatteryData.soc = parseFloat(soc);

      // Trigger immediate ML prediction
      this.runMLPrediction();

      res.json({
        success: true,
        message: "Battery data updated and new predictions generated",
        data: this.currentBatteryData,
      });
    });

    // Health check
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        server: "SmartEV Battery Twin (Integrated ML)",
        port: this.port,
        auto_update_interval: "2 seconds",
      });
    });

    // Root endpoint with API documentation
    this.app.get("/", (req, res) => {
      res.json({
        message: "SmartEV Battery Twin - ML Integrated Server",
        version: "2.0.0",
        auto_update: "Every 2 seconds",
        endpoints: {
          current_data: "GET /battery",
          soh_only: "GET /battery/soh",
          rul_only: "GET /battery/rul",
          metrics_only: "GET /battery/metrics",
          manual_update: "POST /battery/update",
          health_check: "GET /health",
        },
        sample_usage: {
          get_battery_data: "curl http://localhost:8000/battery",
          get_soh: "curl http://localhost:8000/battery/soh",
          update_battery:
            'curl -X POST http://localhost:8000/battery/update -H "Content-Type: application/json" -d \'{"voltage": 3.8, "soc": 90}\'',
        },
      });
    });

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        error: "Endpoint not found",
        available_endpoints: [
          "/battery",
          "/battery/soh",
          "/battery/rul",
          "/battery/metrics",
          "/health",
        ],
      });
    });
  }

  startDataUpdates() {
    console.log("🔄 Starting auto-update cycle (every 2 seconds)...");

    // Update every 2 seconds
    setInterval(() => {
      this.simulateRealTimeData();
      this.runMLPrediction();
    }, 2000);

    // Initial prediction
    this.runMLPrediction();
  }

  simulateRealTimeData() {
    // Simulate realistic battery parameter changes
    const now = new Date();
    const timeOfDay = now.getHours() + now.getMinutes() / 60;

    // Simulate daily usage patterns
    let loadFactor = 1.0;
    if (timeOfDay >= 8 && timeOfDay <= 18) {
      loadFactor = 1.2; // Higher load during day
    } else if (timeOfDay >= 18 && timeOfDay <= 22) {
      loadFactor = 1.5; // Peak load evening
    } else {
      loadFactor = 0.5; // Low load at night
    }

    // Add some realistic variation
    this.currentBatteryData.voltage = 3.6 + Math.random() * 0.3;
    this.currentBatteryData.current = (1.5 + Math.random() * 2.0) * loadFactor;
    this.currentBatteryData.temperature =
      20 + Math.random() * 15 + (loadFactor - 1) * 5;

    // SOC decreases during high load, increases during charging periods
    if (Math.random() > 0.7) {
      // 30% chance of charging
      this.currentBatteryData.soc = Math.min(
        100,
        this.currentBatteryData.soc + Math.random() * 2
      );
    } else {
      this.currentBatteryData.soc = Math.max(
        20,
        this.currentBatteryData.soc - Math.random() * 0.5 * loadFactor
      );
    }

    this.currentBatteryData.timestamp = now.toISOString();
  }

  runMLPrediction() {
    // Run Python ML prediction script using the virtual environment
    const mlDir = path.join(__dirname, "model & ai", "ml");
    const pythonScript = path.join(mlDir, "quick_predict.py");
    const venvPython = path.join(mlDir, "mobility", "bin", "python");

    // Create input data for ML model
    const inputData = {
      voltage: this.currentBatteryData.voltage,
      current: this.currentBatteryData.current,
      temperature: this.currentBatteryData.temperature,
      soc: this.currentBatteryData.soc,
    };

    // Check if virtual environment python exists
    if (!fs.existsSync(venvPython)) {
      console.log(
        "⚠️  Virtual environment not found, using fallback calculations"
      );
      this.calculateFallbackPredictions();
      return;
    }

    // Run Python prediction using virtual environment
    const pythonProcess = spawn(
      venvPython,
      [pythonScript, JSON.stringify(inputData)],
      {
        cwd: mlDir,
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    let result = "";
    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code === 0 && result.trim()) {
        try {
          const prediction = JSON.parse(result.trim());
          this.updateMLResults(prediction);
        } catch (error) {
          // Use fallback calculation if ML fails
          this.calculateFallbackPredictions();
        }
      } else {
        // Use fallback calculation
        this.calculateFallbackPredictions();
      }
    });

    pythonProcess.stderr.on("data", (data) => {
      // Ignore warnings, use fallback on errors
      if (!data.toString().includes("WARNING")) {
        this.calculateFallbackPredictions();
      }
    });
  }

  updateMLResults(prediction) {
    this.currentBatteryData.soh = prediction.soh || this.currentBatteryData.soh;
    this.currentBatteryData.rul = prediction.rul || this.currentBatteryData.rul;
    this.currentBatteryData.health_status = this.getHealthStatus(
      this.currentBatteryData.soh
    );
    this.currentBatteryData.range_km = this.calculateRange();
    this.currentBatteryData.efficiency = this.calculateEfficiency();
  }

  calculateFallbackPredictions() {
    // Simple fallback calculations when ML is not available
    const { voltage, temperature, soc } = this.currentBatteryData;

    // Simple SOH calculation based on voltage and temperature
    let soh = 100 - (40 - temperature) * 0.1 - (3.8 - voltage) * 10;
    soh = Math.max(60, Math.min(100, soh + (Math.random() - 0.5) * 2));

    // Simple RUL calculation
    let rul = soh * 20 + Math.random() * 200;
    rul = Math.max(100, Math.min(2000, rul));

    this.currentBatteryData.soh = Math.round(soh * 10) / 10;
    this.currentBatteryData.rul = Math.round(rul);
    this.currentBatteryData.health_status = this.getHealthStatus(soh);
    this.currentBatteryData.range_km = this.calculateRange();
    this.currentBatteryData.efficiency = this.calculateEfficiency();
  }

  getHealthStatus(soh) {
    if (soh >= 90) return "excellent";
    if (soh >= 80) return "good";
    if (soh >= 70) return "fair";
    if (soh >= 60) return "poor";
    return "critical";
  }

  calculateRange() {
    const { soc, soh } = this.currentBatteryData;
    return Math.round((soc / 100) * 400 * (soh / 100));
  }

  calculateEfficiency() {
    const { voltage, temperature, soh } = this.currentBatteryData;
    let efficiency = (soh / 100) * 50;
    efficiency += voltage > 3.6 ? 25 : voltage * 7;
    efficiency += temperature < 30 ? 25 : Math.max(0, 25 - (temperature - 30));
    return Math.round(Math.min(100, efficiency));
  }

  start() {
    this.app.listen(this.port, () => {
      console.log("🚀 SmartEV Battery Twin - Integrated ML Server");
      console.log("===============================================");
      console.log(`🌐 Server URL: http://localhost:${this.port}`);
      console.log(`🔋 Battery Data: http://localhost:${this.port}/battery`);
      console.log(`📊 SOH Data: http://localhost:${this.port}/battery/soh`);
      console.log(`⏱️  RUL Data: http://localhost:${this.port}/battery/rul`);
      console.log(`📈 Metrics: http://localhost:${this.port}/battery/metrics`);
      console.log("🔄 Auto-updating every 2 seconds with ML predictions");
      console.log("===============================================");
    });

    // Graceful shutdown
    process.on("SIGTERM", () => process.exit(0));
    process.on("SIGINT", () => process.exit(0));
  }
}

// Start the server
const server = new SmartEVBatteryServer();
server.start();
