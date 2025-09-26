#!/usr/bin/env python3
"""
Battery Twin ML API Server
Flask API to serve SOH and RUL models for Express.js integration
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import torch
import joblib
import numpy as np
import pandas as pd
import json
import os
import logging
import traceback
from datetime import datetime
import warnings

# Suppress sklearn version warnings
warnings.filterwarnings("ignore", category=UserWarning)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BatteryMLAPI:
    def __init__(self):
        """Initialize the Battery ML API"""
        self.app = Flask(__name__)
        CORS(self.app)  # Enable CORS for Express.js communication
        
        # Model storage
        self.models = {}
        self.scaler = None
        
        # Load models on startup
        self.load_models()
        
        # Setup routes
        self.setup_routes()
    
    def load_models(self):
        """Load all ML models"""
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            models_dir = os.path.join(script_dir, 'models')
            
            logger.info("Loading ML models...")
            
            # Load SOH Random Forest model
            soh_path = os.path.join(models_dir, 'soh_rf_model.pkl')
            self.models['soh'] = joblib.load(soh_path)
            logger.info("✅ SOH Random Forest model loaded")
            
            # Load RUL models
            rul_gru_path = os.path.join(models_dir, 'rul_gru.pth')
            rul_gru_norm_path = os.path.join(models_dir, 'rul_gru_normalized.pth')
            rul_lstm_path = os.path.join(models_dir, 'rul_lstm_model.pth')
            
            self.models['rul_gru'] = torch.load(rul_gru_path, map_location='cpu')
            self.models['rul_gru_norm'] = torch.load(rul_gru_norm_path, map_location='cpu')
            self.models['rul_lstm'] = torch.load(rul_lstm_path, map_location='cpu')
            
            logger.info("✅ RUL models loaded (GRU, GRU_norm, LSTM)")
            
            # Load scaler
            scaler_path = os.path.join(models_dir, 'rul_scaler.pkl')
            self.scaler = joblib.load(scaler_path)
            logger.info("✅ RUL scaler loaded")
            
            logger.info("🎉 All models loaded successfully!")
            
        except Exception as e:
            logger.error(f"❌ Error loading models: {e}")
            raise
    
    def setup_routes(self):
        """Setup Flask routes"""
        
        @self.app.route('/health', methods=['GET'])
        def health_check():
            """Health check endpoint"""
            return jsonify({
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'models_loaded': len(self.models),
                'available_models': list(self.models.keys())
            })
        
        @self.app.route('/predict/soh', methods=['POST'])
        def predict_soh():
            """Predict State of Health"""
            try:
                data = request.get_json()
                
                # Extract features for SOH prediction
                # Typical features: voltage, current, temperature, capacity, cycle_count
                features = np.array([[
                    data.get('voltage', 3.7),
                    data.get('current', 2.0),
                    data.get('temperature', 25.0),
                    data.get('capacity', 2.5),
                    data.get('cycle_count', 100)
                ]])
                
                # Predict SOH
                soh_prediction = self.models['soh'].predict(features)[0]
                soh_percentage = max(0, min(100, float(soh_prediction)))
                
                # Health status classification
                if soh_percentage >= 90:
                    health_status = 'excellent'
                elif soh_percentage >= 80:
                    health_status = 'good'
                elif soh_percentage >= 70:
                    health_status = 'fair'
                elif soh_percentage >= 60:
                    health_status = 'poor'
                else:
                    health_status = 'critical'
                
                return jsonify({
                    'soh_percentage': round(soh_percentage, 2),
                    'health_status': health_status,
                    'model_used': 'random_forest',
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as e:
                logger.error(f"SOH prediction error: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/predict/rul', methods=['POST'])
        def predict_rul():
            """Predict Remaining Useful Life"""
            try:
                data = request.get_json()
                model_type = data.get('model', 'gru')  # default to GRU
                
                # Extract features for RUL prediction
                features = np.array([[
                    data.get('voltage', 3.7),
                    data.get('current', 2.0),
                    data.get('temperature', 25.0),
                    data.get('soc', 80.0),
                    data.get('soh', 85.0)
                ]])
                
                # Scale features
                scaled_features = self.scaler.transform(features)
                
                # Convert to tensor for PyTorch models
                tensor_features = torch.tensor(scaled_features, dtype=torch.float32)
                
                # Select model and predict
                if model_type == 'gru_norm':
                    model = self.models['rul_gru_norm']
                elif model_type == 'lstm':
                    model = self.models['rul_lstm']
                else:
                    model = self.models['rul_gru']
                
                # Set model to evaluation mode
                model.eval()
                
                with torch.no_grad():
                    if hasattr(model, 'predict'):
                        rul_prediction = model.predict(tensor_features)
                    else:
                        rul_prediction = model(tensor_features)
                    
                    if isinstance(rul_prediction, torch.Tensor):
                        rul_cycles = float(rul_prediction.item())
                    else:
                        rul_cycles = float(rul_prediction)
                
                # Ensure reasonable bounds
                rul_cycles = max(0, min(2000, rul_cycles))
                
                # Convert to time estimates
                rul_days = rul_cycles / 1.5  # Assuming ~1.5 cycles per day
                rul_months = rul_days / 30
                
                return jsonify({
                    'rul_cycles': round(rul_cycles, 0),
                    'rul_days': round(rul_days, 0),
                    'rul_months': round(rul_months, 1),
                    'model_used': model_type,
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as e:
                logger.error(f"RUL prediction error: {e}")
                traceback.print_exc()
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/predict/battery', methods=['POST'])
        def predict_battery_complete():
            """Complete battery analysis - SOH + RUL"""
            try:
                data = request.get_json()
                
                # Get SOH prediction
                soh_features = np.array([[
                    data.get('voltage', 3.7),
                    data.get('current', 2.0),
                    data.get('temperature', 25.0),
                    data.get('capacity', 2.5),
                    data.get('cycle_count', 100)
                ]])
                
                soh_prediction = self.models['soh'].predict(soh_features)[0]
                soh_percentage = max(0, min(100, float(soh_prediction)))
                
                # Get RUL prediction
                rul_features = np.array([[
                    data.get('voltage', 3.7),
                    data.get('current', 2.0),
                    data.get('temperature', 25.0),
                    data.get('soc', 80.0),
                    soh_percentage
                ]])
                
                scaled_rul_features = self.scaler.transform(rul_features)
                tensor_features = torch.tensor(scaled_rul_features, dtype=torch.float32)
                
                model = self.models['rul_gru']
                model.eval()
                
                with torch.no_grad():
                    rul_prediction = model(tensor_features)
                    rul_cycles = max(0, min(2000, float(rul_prediction.item())))
                
                # Health status
                if soh_percentage >= 90:
                    health_status = 'excellent'
                elif soh_percentage >= 80:
                    health_status = 'good'
                elif soh_percentage >= 70:
                    health_status = 'fair'
                else:
                    health_status = 'poor'
                
                # Calculate range estimate (simplified)
                range_km = (data.get('soc', 80) / 100) * 400 * (soh_percentage / 100)
                
                return jsonify({
                    'battery_analysis': {
                        'soh': {
                            'percentage': round(soh_percentage, 2),
                            'status': health_status
                        },
                        'rul': {
                            'cycles': round(rul_cycles, 0),
                            'days': round(rul_cycles / 1.5, 0),
                            'months': round(rul_cycles / 45, 1)
                        },
                        'current_metrics': {
                            'voltage': data.get('voltage', 3.7),
                            'current': data.get('current', 2.0),
                            'temperature': data.get('temperature', 25.0),
                            'soc': data.get('soc', 80.0),
                            'estimated_range_km': round(range_km, 1)
                        },
                        'timestamp': datetime.now().isoformat()
                    }
                })
                
            except Exception as e:
                logger.error(f"Complete battery prediction error: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/simulate/trip', methods=['POST'])
        def simulate_trip():
            """Simulate a battery trip with predictions"""
            try:
                data = request.get_json()
                trip_duration = data.get('duration_minutes', 60)
                trip_type = data.get('type', 'city')  # city, highway, mixed
                
                # Generate trip simulation data
                trip_data = []
                base_soc = data.get('initial_soc', 90)
                
                for minute in range(0, trip_duration, 5):  # Every 5 minutes
                    # Simulate battery degradation during trip
                    current_soc = base_soc - (minute / trip_duration) * 30  # Consume ~30% over trip
                    
                    if trip_type == 'highway':
                        voltage = 3.6 + np.random.normal(0, 0.1)
                        current = 3.0 + np.random.normal(0, 0.3)
                        temp = 28 + minute * 0.1  # Temperature increases
                    elif trip_type == 'city':
                        voltage = 3.7 + np.random.normal(0, 0.05)
                        current = 2.2 + np.random.normal(0, 0.5)
                        temp = 25 + minute * 0.05
                    else:  # mixed
                        voltage = 3.65 + np.random.normal(0, 0.08)
                        current = 2.6 + np.random.normal(0, 0.4)
                        temp = 26 + minute * 0.08
                    
                    # Get real-time predictions
                    soh_features = np.array([[voltage, current, temp, 2.5, 150]])
                    soh = float(self.models['soh'].predict(soh_features)[0])
                    
                    trip_data.append({
                        'time_minutes': minute,
                        'voltage': round(voltage, 2),
                        'current': round(current, 2),
                        'temperature': round(temp, 1),
                        'soc': round(current_soc, 1),
                        'soh': round(soh, 1),
                        'phase': trip_type
                    })
                
                return jsonify({
                    'trip_simulation': {
                        'duration_minutes': trip_duration,
                        'trip_type': trip_type,
                        'data_points': len(trip_data),
                        'readings': trip_data,
                        'summary': {
                            'initial_soc': base_soc,
                            'final_soc': trip_data[-1]['soc'],
                            'energy_consumed': base_soc - trip_data[-1]['soc'],
                            'avg_temperature': round(np.mean([d['temperature'] for d in trip_data]), 1)
                        }
                    }
                })
                
            except Exception as e:
                logger.error(f"Trip simulation error: {e}")
                return jsonify({'error': str(e)}), 500
    
    def run(self, host='127.0.0.1', port=5001, debug=False):
        """Run the Flask API server"""
        logger.info(f"🚀 Starting Battery ML API Server on {host}:{port}")
        logger.info("📋 Available endpoints:")
        logger.info("  GET  /health - Health check")
        logger.info("  POST /predict/soh - SOH prediction")
        logger.info("  POST /predict/rul - RUL prediction") 
        logger.info("  POST /predict/battery - Complete battery analysis")
        logger.info("  POST /simulate/trip - Trip simulation")
        logger.info("="*50)
        
        self.app.run(host=host, port=port, debug=debug, threaded=True)

def main():
    """Main function"""
    try:
        api = BatteryMLAPI()
        api.run(debug=False)
    except Exception as e:
        logger.error(f"Failed to start API server: {e}")

if __name__ == "__main__":
    main()