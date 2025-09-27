#!/usr/bin/env node
/**
 * SmartEV Battery Twin - Express.js Server
 * Integrated ML Battery Models (SOH & RUL)
 * Port: 8000
 */

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

// Load environment variables
require("dotenv").config();

class SmartEVBatteryServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 8000;
    this.pythonApiUrl = process.env.PYTHON_API_URL || "http://127.0.0.1:5001";
    this.pythonProcess = null;

    // Initialize server
    this.setupMiddleware();
    this.setupRoutes();
    this.startPythonAPI();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.ALLOWED_ORIGINS?.split(",") || [
          "http://localhost:3000",
          "http://localhost:8000",
        ],
        credentials: true,
      })
    );

    // Logging
    this.app.use(morgan("combined"));

    // Body parsing
    this.app.use(bodyParser.json({ limit: "10mb" }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

    // Static files
    this.app.use(express.static(path.join(__dirname, "public")));
  }

  setupRoutes() {
    // Health check
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        server: "SmartEV Battery Twin Express Server",
        port: this.port,
        python_api_url: this.pythonApiUrl,
      });
    });

    // Root endpoint
    this.app.get("/", (req, res) => {
      res.json({
        message: "SmartEV Battery Twin API",
        version: "1.0.0",
        endpoints: {
          health: "GET /health",
          battery: {
            predict: "POST /api/battery/predict",
            soh: "POST /api/battery/soh",
            rul: "POST /api/battery/rul",
            analyze: "POST /api/battery/analyze",
            simulate: "POST /api/battery/simulate",
          },
          dashboard: "GET /dashboard",
          models: "GET /api/models/status",
        },
      });
    });

    // Battery API routes
    this.setupBatteryRoutes();

    // Dashboard routes
    this.setupDashboardRoutes();

    // Model management routes
    this.setupModelRoutes();

    // Error handling
    this.setupErrorHandling();
  }

  setupBatteryRoutes() {
    // Complete battery analysis
    this.app.post("/api/battery/predict", async (req, res) => {
      try {
        const response = await axios.post(
          `${this.pythonApiUrl}/predict/battery`,
          req.body
        );
        res.json({
          success: true,
          data: response.data,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Battery prediction error:", error.message);
        res.status(500).json({
          success: false,
          error: "Battery prediction failed",
          details: error.response?.data || error.message,
        });
      }
    });

    // SOH prediction
    this.app.post("/api/battery/soh", async (req, res) => {
      try {
        const response = await axios.post(
          `${this.pythonApiUrl}/predict/soh`,
          req.body
        );
        res.json({
          success: true,
          data: response.data,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("SOH prediction error:", error.message);
        res.status(500).json({
          success: false,
          error: "SOH prediction failed",
          details: error.response?.data || error.message,
        });
      }
    });

    // RUL prediction
    this.app.post("/api/battery/rul", async (req, res) => {
      try {
        const response = await axios.post(
          `${this.pythonApiUrl}/predict/rul`,
          req.body
        );
        res.json({
          success: true,
          data: response.data,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("RUL prediction error:", error.message);
        res.status(500).json({
          success: false,
          error: "RUL prediction failed",
          details: error.response?.data || error.message,
        });
      }
    });

    // Battery analysis with enhanced data
    this.app.post("/api/battery/analyze", async (req, res) => {
      try {
        const batteryData = {
          voltage: req.body.voltage || 3.7,
          current: req.body.current || 2.0,
          temperature: req.body.temperature || 25.0,
          soc: req.body.soc || 80.0,
          capacity: req.body.capacity || 2.5,
          cycle_count: req.body.cycle_count || 100,
        };

        // Get complete battery analysis
        const response = await axios.post(
          `${this.pythonApiUrl}/predict/battery`,
          batteryData
        );

        // Add additional calculations
        const analysis = response.data.battery_analysis;
        const enhancedAnalysis = {
          ...analysis,
          recommendations: this.generateRecommendations(analysis),
          alerts: this.generateAlerts(analysis),
          efficiency_score: this.calculateEfficiencyScore(analysis),
        };

        res.json({
          success: true,
          battery_id: req.body.battery_id || "default",
          analysis: enhancedAnalysis,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Battery analysis error:", error.message);
        res.status(500).json({
          success: false,
          error: "Battery analysis failed",
          details: error.response?.data || error.message,
        });
      }
    });

    // Trip simulation
    this.app.post("/api/battery/simulate", async (req, res) => {
      try {
        const response = await axios.post(
          `${this.pythonApiUrl}/simulate/trip`,
          req.body
        );
        res.json({
          success: true,
          data: response.data,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Trip simulation error:", error.message);
        res.status(500).json({
          success: false,
          error: "Trip simulation failed",
          details: error.response?.data || error.message,
        });
      }
    });
  }

  setupDashboardRoutes() {
    // Dashboard data endpoint
    this.app.get("/api/dashboard/data", async (req, res) => {
      try {
        // Generate sample dashboard data
        const dashboardData = {
          live_metrics: {
            voltage: 3.7 + Math.random() * 0.2,
            current: 2.0 + Math.random() * 0.5,
            temperature: 25 + Math.random() * 10,
            soc: 80 + Math.random() * 15,
            charging_status: Math.random() > 0.5 ? "charging" : "discharging",
          },
          fleet_summary: {
            total_batteries: 150,
            healthy_batteries: 142,
            warning_batteries: 6,
            critical_batteries: 2,
            avg_soh: 87.3,
          },
          recent_alerts: [
            {
              id: 1,
              type: "warning",
              message: "Battery #45 temperature elevated",
              timestamp: new Date().toISOString(),
            },
            {
              id: 2,
              type: "info",
              message: "Charging cycle completed for Battery #23",
              timestamp: new Date().toISOString(),
            },
          ],
        };

        res.json({
          success: true,
          data: dashboardData,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Dashboard data error:", error.message);
        res.status(500).json({
          success: false,
          error: "Failed to fetch dashboard data",
          details: error.message,
        });
      }
    });

    // Serve dashboard HTML
    this.app.get("/dashboard", (req, res) => {
      res.send(this.generateDashboardHTML());
    });
  }

  setupModelRoutes() {
    // Model status
    this.app.get("/api/models/status", async (req, res) => {
      try {
        const response = await axios.get(`${this.pythonApiUrl}/health`);
        res.json({
          success: true,
          python_api_status: "connected",
          data: response.data,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Model status error:", error.message);
        res.status(503).json({
          success: false,
          python_api_status: "disconnected",
          error: "Python ML API not available",
          details: error.message,
        });
      }
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        error: "Endpoint not found",
        requested_path: req.originalUrl,
        available_endpoints: [
          "GET /",
          "GET /health",
          "GET /dashboard",
          "POST /api/battery/predict",
          "POST /api/battery/analyze",
          "GET /api/models/status",
        ],
      });
    });

    // Global error handler
    this.app.use((err, req, res, next) => {
      console.error("Global error:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Something went wrong",
      });
    });
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    const soh = analysis.soh.percentage;
    const rul = analysis.rul.cycles;

    if (soh < 80) {
      recommendations.push("Consider battery maintenance or replacement soon");
    }
    if (rul < 200) {
      recommendations.push("Plan for battery replacement within 6 months");
    }
    if (analysis.current_metrics.temperature > 35) {
      recommendations.push("Monitor cooling system - temperature elevated");
    }

    return recommendations;
  }

  generateAlerts(analysis) {
    const alerts = [];
    const soh = analysis.soh.percentage;
    const temp = analysis.current_metrics.temperature;

    if (soh < 70) {
      alerts.push({
        level: "critical",
        message: "Battery health critically low",
      });
    } else if (soh < 80) {
      alerts.push({ level: "warning", message: "Battery health declining" });
    }

    if (temp > 40) {
      alerts.push({
        level: "critical",
        message: "Battery temperature too high",
      });
    } else if (temp > 35) {
      alerts.push({
        level: "warning",
        message: "Battery temperature elevated",
      });
    }

    return alerts;
  }

  calculateEfficiencyScore(analysis) {
    const soh = analysis.soh.percentage;
    const temp = analysis.current_metrics.temperature;
    const voltage = analysis.current_metrics.voltage;

    // Simple efficiency calculation
    let score = (soh / 100) * 40; // Max 40 points for health
    score += temp < 30 ? 30 : Math.max(0, 30 - (temp - 30) * 2); // Max 30 points for temperature
    score += voltage > 3.5 ? 30 : voltage * 8.57; // Max 30 points for voltage

    return Math.round(Math.min(100, score));
  }

  generateDashboardHTML() {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>SmartEV Battery Twin Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .container { max-width: 1200px; margin: 0 auto; }
                .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
                .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .metric-value { font-size: 2em; font-weight: bold; color: #2c3e50; }
                .metric-label { color: #7f8c8d; margin-top: 5px; }
                .status { padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                button { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
                button:hover { background: #2980b9; }
                .test-results { margin-top: 20px; padding: 15px; background: #ecf0f1; border-radius: 4px; white-space: pre-wrap; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔋 SmartEV Battery Twin Dashboard</h1>
                    <p>Real-time Battery Monitoring & ML Predictions</p>
                </div>
                
                <div class="metrics" id="metrics">
                    <div class="metric-card">
                        <div class="metric-value" id="soh">--</div>
                        <div class="metric-label">State of Health (%)</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" id="rul">--</div>
                        <div class="metric-label">Remaining Life (cycles)</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" id="temp">--</div>
                        <div class="metric-label">Temperature (°C)</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" id="voltage">--</div>
                        <div class="metric-label">Voltage (V)</div>
                    </div>
                </div>
                
                <div class="status">
                    <h3>Battery Analysis Test</h3>
                    <button onclick="testBatteryPrediction()">Test SOH & RUL Prediction</button>
                    <button onclick="testTripSimulation()">Test Trip Simulation</button>
                    <button onclick="checkModelStatus()">Check Model Status</button>
                    <div class="test-results" id="results"></div>
                </div>
            </div>
            
            <script>
                async function testBatteryPrediction() {
                    document.getElementById('results').textContent = 'Testing battery prediction...';
                    
                    try {
                        const response = await fetch('/api/battery/analyze', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                voltage: 3.7,
                                current: 2.2,
                                temperature: 28,
                                soc: 85,
                                capacity: 2.5,
                                cycle_count: 150
                            })
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            const analysis = data.analysis;
                            document.getElementById('soh').textContent = analysis.soh.percentage + '%';
                            document.getElementById('rul').textContent = analysis.rul.cycles;
                            document.getElementById('temp').textContent = analysis.current_metrics.temperature;
                            document.getElementById('voltage').textContent = analysis.current_metrics.voltage;
                            
                            document.getElementById('results').textContent = 
                                'Battery Analysis Results:\\n' +
                                '========================\\n' +
                                'SOH: ' + analysis.soh.percentage + '% (' + analysis.soh.status + ')\\n' +
                                'RUL: ' + analysis.rul.cycles + ' cycles (~' + analysis.rul.months + ' months)\\n' +
                                'Efficiency Score: ' + analysis.efficiency_score + '/100\\n' +
                                'Recommendations: ' + (analysis.recommendations?.join(', ') || 'None') + '\\n' +
                                'Alerts: ' + (analysis.alerts?.map(a => a.message).join(', ') || 'None');
                        } else {
                            document.getElementById('results').textContent = 'Error: ' + data.error;
                        }
                    } catch (error) {
                        document.getElementById('results').textContent = 'Request failed: ' + error.message;
                    }
                }
                
                async function testTripSimulation() {
                    document.getElementById('results').textContent = 'Running trip simulation...';
                    
                    try {
                        const response = await fetch('/api/battery/simulate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                duration_minutes: 30,
                                type: 'city',
                                initial_soc: 90
                            })
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            const sim = data.data.trip_simulation;
                            document.getElementById('results').textContent = 
                                'Trip Simulation Results:\\n' +
                                '======================\\n' +
                                'Duration: ' + sim.duration_minutes + ' minutes\\n' +
                                'Type: ' + sim.trip_type + '\\n' +
                                'Initial SOC: ' + sim.summary.initial_soc + '%\\n' +
                                'Final SOC: ' + sim.summary.final_soc + '%\\n' +
                                'Energy Consumed: ' + sim.summary.energy_consumed + '%\\n' +
                                'Avg Temperature: ' + sim.summary.avg_temperature + '°C\\n' +
                                'Data Points: ' + sim.data_points;
                        } else {
                            document.getElementById('results').textContent = 'Error: ' + data.error;
                        }
                    } catch (error) {
                        document.getElementById('results').textContent = 'Request failed: ' + error.message;
                    }
                }
                
                async function checkModelStatus() {
                    document.getElementById('results').textContent = 'Checking model status...';
                    
                    try {
                        const response = await fetch('/api/models/status');
                        const data = await response.json();
                        
                        if (data.success) {
                            document.getElementById('results').textContent = 
                                'Model Status:\\n' +
                                '=============\\n' +
                                'Python API: ' + data.python_api_status + '\\n' +
                                'Models Loaded: ' + data.data.models_loaded + '\\n' +
                                'Available Models: ' + data.data.available_models.join(', ');
                        } else {
                            document.getElementById('results').textContent = 'Model Status: DISCONNECTED\\n' + data.error;
                        }
                    } catch (error) {
                        document.getElementById('results').textContent = 'Status check failed: ' + error.message;
                    }
                }
                
                // Auto-refresh metrics every 10 seconds
                setInterval(() => {
                    if (document.getElementById('soh').textContent !== '--') {
                        testBatteryPrediction();
                    }
                }, 10000);
            </script>
        </body>
        </html>
        `;
  }

  async startPythonAPI() {
    console.log("🐍 Starting Python ML API server...");

    const mlDir = path.join(__dirname, "model & ai", "ml");
    const activateScript = path.join(mlDir, "mobility", "bin", "activate");
    const pythonScript = path.join(mlDir, "battery_api_server.py");

    // Check if files exist
    if (!fs.existsSync(pythonScript)) {
      console.error("❌ Python API script not found:", pythonScript);
      return;
    }

    // Start Python process
    const command = `cd "${mlDir}" && source mobility/bin/activate && python battery_api_server.py`;

    this.pythonProcess = spawn("bash", ["-c", command], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: mlDir,
    });

    this.pythonProcess.stdout.on("data", (data) => {
      console.log("🐍 Python API:", data.toString().trim());
    });

    this.pythonProcess.stderr.on("data", (data) => {
      const message = data.toString().trim();
      if (
        !message.includes("WARNING") &&
        !message.includes("InconsistentVersionWarning")
      ) {
        console.error("🐍 Python API Error:", message);
      }
    });

    this.pythonProcess.on("close", (code) => {
      console.log(`🐍 Python API process exited with code ${code}`);
    });

    // Wait for API to start
    console.log("⏳ Waiting for Python API to start...");
    await this.waitForPythonAPI();
  }

  async waitForPythonAPI(maxAttempts = 30, interval = 1000) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await axios.get(`${this.pythonApiUrl}/health`, {
          timeout: 2000,
        });
        if (response.status === 200) {
          console.log("✅ Python ML API is ready!");
          return true;
        }
      } catch (error) {
        // API not ready yet, continue waiting
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    console.warn("⚠️  Python ML API failed to start within timeout");
    return false;
  }

  start() {
    this.app.listen(this.port, () => {
      console.log("🚀 SmartEV Battery Twin Server Started");
      console.log("==========================================");
      console.log(`🌐 Server URL: http://localhost:${this.port}`);
      console.log(`📊 Dashboard: http://localhost:${this.port}/dashboard`);
      console.log(`🔍 Health Check: http://localhost:${this.port}/health`);
      console.log(
        `🔋 Battery API: http://localhost:${this.port}/api/battery/predict`
      );
      console.log("==========================================");
    });

    // Graceful shutdown
    process.on("SIGTERM", this.shutdown.bind(this));
    process.on("SIGINT", this.shutdown.bind(this));
  }

  shutdown() {
    console.log("\n🛑 Shutting down SmartEV Battery Twin Server...");

    if (this.pythonProcess) {
      console.log("🐍 Stopping Python ML API...");
      this.pythonProcess.kill("SIGTERM");
    }

    process.exit(0);
  }
}

// Start the server
const server = new SmartEVBatteryServer();
server.start();
