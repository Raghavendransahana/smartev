# ============================================================================
# 🌈 COLORFUL LIVE DASHBOARD - Real-Time Battery Monitoring
# ============================================================================

import dash
from dash import dcc, html, Input, Output
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
import json
import os
from datetime import datetime
import numpy as np

class ColorfulLiveDashboard:
    def __init__(self):
        """Initialize colorful live dashboard"""
        # Color schemes - MUST be defined first
        self.colors = {
            'primary': '#2c3e50',
            'secondary': '#34495e',
            'success': '#27ae60',
            'danger': '#e74c3c',
            'warning': '#f39c12',
            'info': '#3498db',
            'light': '#ecf0f1',
            'dark': '#2c3e50'
        }
        
        self.gradient_colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ]
        
        self.app = dash.Dash(__name__)
        self.setup_layout()
        self.setup_callbacks()
    
    def load_live_data(self):
        """Load live trip data - always reload from file for real-time updates"""
        try:
            # Get the directory where this script is located
            script_dir = os.path.dirname(os.path.abspath(__file__))
            live_data_path = os.path.join(script_dir, "live_trip_data.json")
            
            if os.path.exists(live_data_path):
                # Always reload the file to get the latest data
                with open(live_data_path, 'r') as f:
                    data = json.load(f)
                readings_count = len(data.get('readings', []))
                print(f"🔄 Reloaded live data: {readings_count} readings")
                return data
            else:
                print(f"⚠️ Live data file not found, using sample data")
                return self.create_sample_data()
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            return self.create_sample_data()
    
    def create_sample_data(self):
        """Create sample data if no live data available"""
        return {
            "name": "Sample Live Trip",
            "readings": [
                {"reading_number": 1, "voltage": 3.8, "current": 2.1, "temperature": 28, "soc": 80, "soh": 78, "rul": 1200, "trip_phase": "highway"},
                {"reading_number": 2, "voltage": 3.76, "current": 2.3, "temperature": 29, "soc": 78, "soh": 77.8, "rul": 1195, "trip_phase": "highway"},
                {"reading_number": 3, "voltage": 3.72, "current": 1.8, "temperature": 30, "soc": 76, "soh": 77.5, "rul": 1190, "trip_phase": "city"}
            ],
            "current_phase": "city"
        }
    
    def get_phase_color(self, phase):
        """Get color for trip phase"""
        phase_colors = {
            'highway': '#3498db',  # Blue
            'city': '#e67e22',     # Orange  
            'parking': '#95a5a6',  # Gray
            'charging': '#27ae60'  # Green
        }
        return phase_colors.get(phase, '#7f8c8d')
    
    def get_status_color(self, soh):
        """Get color based on SOH status"""
        if soh >= 80:
            return '#27ae60'  # Green
        elif soh >= 70:
            return '#f39c12'  # Orange
        elif soh >= 60:
            return '#e67e22'  # Dark Orange
        else:
            return '#e74c3c'  # Red
    
    def setup_layout(self):
        """Setup colorful dashboard layout"""
        self.app.layout = html.Div([
            # Header with gradient background
            html.Div([
                html.H1("🔋 Live Battery Trip Monitor", 
                       style={'textAlign': 'center', 'color': 'white', 'marginBottom': '10px',
                             'textShadow': '2px 2px 4px rgba(0,0,0,0.5)'}),
                html.H3("🚗 Real-Time Highway Journey", 
                       style={'textAlign': 'center', 'color': '#ecf0f1', 'marginBottom': '20px'}),
                html.Div(id='live-status', style={'textAlign': 'center', 'color': '#bdc3c7', 'fontSize': '16px'})
            ], style={
                'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'padding': '30px',
                'marginBottom': '20px',
                'borderRadius': '15px',
                'boxShadow': '0 10px 30px rgba(0,0,0,0.3)'
            }),
            
            # Key Metrics with colorful cards
            html.Div([
                # Voltage Card
                html.Div([
                    html.Div([
                        html.I(className="fas fa-bolt", style={'fontSize': '30px', 'color': 'white', 'marginBottom': '10px'}),
                        html.H3("⚡ Voltage", style={'color': 'white', 'margin': '0', 'fontSize': '18px'}),
                        html.H1(id='voltage-card', children="--", style={'color': 'white', 'margin': '10px 0', 'fontSize': '36px', 'fontWeight': 'bold'})
                    ], style={'textAlign': 'center'})
                ], style={
                    'width': '18%', 'display': 'inline-block', 'margin': '1%',
                    'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'padding': '25px', 'borderRadius': '15px',
                    'boxShadow': '0 8px 25px rgba(102,126,234,0.4)',
                    'transform': 'translateY(0px)',
                    'transition': 'all 0.3s ease'
                }),
                
                # SOH Card
                html.Div([
                    html.Div([
                        html.H3("🔋 SOH", style={'color': 'white', 'margin': '0', 'fontSize': '18px'}),
                        html.H1(id='soh-card', children="--", style={'color': 'white', 'margin': '10px 0', 'fontSize': '36px', 'fontWeight': 'bold'})
                    ], style={'textAlign': 'center'})
                ], style={
                    'width': '18%', 'display': 'inline-block', 'margin': '1%',
                    'background': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    'padding': '25px', 'borderRadius': '15px',
                    'boxShadow': '0 8px 25px rgba(240,147,251,0.4)',
                    'transition': 'all 0.3s ease'
                }),
                
                # Temperature Card
                html.Div([
                    html.Div([
                        html.H3("🌡️ Temperature", style={'color': 'white', 'margin': '0', 'fontSize': '18px'}),
                        html.H1(id='temp-card', children="--", style={'color': 'white', 'margin': '10px 0', 'fontSize': '36px', 'fontWeight': 'bold'})
                    ], style={'textAlign': 'center'})
                ], style={
                    'width': '18%', 'display': 'inline-block', 'margin': '1%',
                    'background': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    'padding': '25px', 'borderRadius': '15px',
                    'boxShadow': '0 8px 25px rgba(79,172,254,0.4)',
                    'transition': 'all 0.3s ease'
                }),
                
                # Current Card
                html.Div([
                    html.Div([
                        html.H3("🔄 Current", style={'color': 'white', 'margin': '0', 'fontSize': '18px'}),
                        html.H1(id='current-card', children="--", style={'color': 'white', 'margin': '10px 0', 'fontSize': '36px', 'fontWeight': 'bold'})
                    ], style={'textAlign': 'center'})
                ], style={
                    'width': '18%', 'display': 'inline-block', 'margin': '1%',
                    'background': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    'padding': '25px', 'borderRadius': '15px',
                    'boxShadow': '0 8px 25px rgba(250,112,154,0.4)',
                    'transition': 'all 0.3s ease'
                }),
                
                # Status Card
                html.Div([
                    html.Div([
                        html.H3("🎯 Status", style={'color': 'white', 'margin': '0', 'fontSize': '18px'}),
                        html.H2(id='status-card', children="--", style={'color': 'white', 'margin': '10px 0', 'fontSize': '24px', 'fontWeight': 'bold'})
                    ], style={'textAlign': 'center'})
                ], style={
                    'width': '18%', 'display': 'inline-block', 'margin': '1%',
                    'background': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    'padding': '25px', 'borderRadius': '15px',
                    'boxShadow': '0 8px 25px rgba(168,237,234,0.4)',
                    'transition': 'all 0.3s ease'
                })
            ], style={'marginBottom': '30px'}),
            
            # Main Charts with colorful styling
            html.Div([
                dcc.Graph(id='live-charts', 
                         style={'borderRadius': '15px', 'overflow': 'hidden',
                               'boxShadow': '0 10px 30px rgba(0,0,0,0.1)'})
            ], style={'marginBottom': '30px'}),
            
            # Trip Phase Indicator
            html.Div([
                html.H3("🚗 Current Trip Phase", style={'color': self.colors['primary'], 'marginBottom': '20px'}),
                html.Div(id='phase-indicator')
            ], style={
                'padding': '25px', 'backgroundColor': '#f8f9fa', 'borderRadius': '15px',
                'marginBottom': '30px', 'boxShadow': '0 5px 15px rgba(0,0,0,0.1)'
            }),
            
            # Auto-refresh
            dcc.Interval(
                id='interval-component',
                interval=2000,  # Update every 2 seconds
                n_intervals=0
            ),
            
            # Store for data
            dcc.Store(id='live-data-store')
        ], style={
            'fontFamily': '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            'backgroundColor': '#f5f6fa',
            'minHeight': '100vh',
            'padding': '20px'
        })
    
    def setup_callbacks(self):
        """Setup dashboard callbacks"""
        
        @self.app.callback(
            Output('live-data-store', 'data'),
            Input('interval-component', 'n_intervals')
        )
        def update_data_store(n):
            """Update data store with latest live data"""
            return self.load_live_data()
        
        @self.app.callback(
            [Output('voltage-card', 'children'),
             Output('soh-card', 'children'),
             Output('temp-card', 'children'),
             Output('current-card', 'children'),
             Output('status-card', 'children'),
             Output('live-status', 'children')],
            Input('live-data-store', 'data')
        )
        def update_metric_cards(data):
            """Update metric cards"""
            if not data or 'readings' not in data or not data['readings']:
                return "--", "--", "--", "--", "--", "⚠️ No live data available"
            
            latest = data['readings'][-1]
            total_readings = len(data['readings'])
            
            voltage = f"{latest['voltage']:.2f}V"
            soh = f"{latest['soh']:.1f}%"
            temp = f"{latest['temperature']:.1f}°C"
            current = f"{latest['current']:.1f}A"
            
            # Status based on SOH
            if latest['soh'] >= 70:
                status = "REUSE 🟢"
            elif latest['soh'] >= 60:
                status = "REFURBISH 🟡"
            else:
                status = "RECYCLE 🟠"
            
            # Live status
            phase_emoji = {
                'highway': '🛣️',
                'city': '🏙️',
                'parking': '🅿️',
                'charging': '🔌'
            }
            
            current_phase = data.get('current_phase', 'unknown')
            phase_display = phase_emoji.get(current_phase, '🚗')
            
            live_status = f"📊 {total_readings} readings • {phase_display} {current_phase.upper()} • 🕐 {datetime.now().strftime('%H:%M:%S')}"
            
            return voltage, soh, temp, current, status, live_status
        
        @self.app.callback(
            Output('live-charts', 'figure'),
            Input('live-data-store', 'data')
        )
        def update_live_charts(data):
            """Update live charts with colorful styling"""
            if not data or 'readings' not in data or not data['readings']:
                return go.Figure()
            
            df = pd.DataFrame(data['readings'])
            
            # Create subplots with improved spacing
            fig = make_subplots(
                rows=2, cols=3,
                subplot_titles=(
                    '⚡ Voltage Trend', '🌡️ Temperature Evolution', '🔋 State of Health',
                    '⏰ Remaining Life', '🔄 Current Flow', '📊 State of Charge'
                ),
                vertical_spacing=0.12,
                horizontal_spacing=0.08
            )
            
            # Voltage trend with gradient
            fig.add_trace(
                go.Scatter(
                    x=df['reading_number'], 
                    y=df['voltage'],
                    mode='lines+markers',
                    name='Voltage',
                    line=dict(color='#667eea', width=4),
                    marker=dict(size=8, color='#764ba2', line=dict(width=2, color='white')),
                    fill='tonexty',
                    fillcolor='rgba(102,126,234,0.1)'
                ),
                row=1, col=1
            )
            
            # Temperature with color-coded markers
            colors = ['#4ECDC4' if t < 30 else '#F39C12' if t < 40 else '#E74C3C' for t in df['temperature']]
            fig.add_trace(
                go.Scatter(
                    x=df['reading_number'], 
                    y=df['temperature'],
                    mode='lines+markers',
                    name='Temperature',
                    line=dict(color='#4facfe', width=4),
                    marker=dict(size=10, color=colors, line=dict(width=2, color='white'))
                ),
                row=1, col=2
            )
            
            # SOH with status colors
            soh_colors = [self.get_status_color(soh) for soh in df['soh']]
            fig.add_trace(
                go.Scatter(
                    x=df['reading_number'], 
                    y=df['soh'],
                    mode='lines+markers',
                    name='SOH',
                    line=dict(color='#27ae60', width=4),
                    marker=dict(size=10, color=soh_colors, line=dict(width=2, color='white')),
                    fill='tozeroy',
                    fillcolor='rgba(39,174,96,0.1)'
                ),
                row=1, col=3
            )
            
            # RUL with gradient
            fig.add_trace(
                go.Scatter(
                    x=df['reading_number'], 
                    y=df['rul'],
                    mode='lines+markers',
                    name='RUL',
                    line=dict(color='#f093fb', width=4),
                    marker=dict(size=8, color='#f5576c', line=dict(width=2, color='white'))
                ),
                row=2, col=1
            )
            
            # Current with phase-based colors
            if 'trip_phase' in df.columns:
                phase_colors = [self.get_phase_color(phase) for phase in df['trip_phase']]
            else:
                phase_colors = '#fa709a'
                
            fig.add_trace(
                go.Scatter(
                    x=df['reading_number'], 
                    y=df['current'],
                    mode='lines+markers',
                    name='Current',
                    line=dict(color='#fa709a', width=4),
                    marker=dict(size=10, color=phase_colors, line=dict(width=2, color='white'))
                ),
                row=2, col=2
            )
            
            # SOC with battery-like visualization
            fig.add_trace(
                go.Scatter(
                    x=df['reading_number'], 
                    y=df['soc'],
                    mode='lines+markers',
                    name='SOC',
                    line=dict(color='#a8edea', width=4),
                    marker=dict(size=10, color='#fed6e3', line=dict(width=2, color='white')),
                    fill='tozeroy',
                    fillcolor='rgba(168,237,234,0.2)'
                ),
                row=2, col=3
            )
            
            # Update layout with modern styling
            fig.update_layout(
                height=700,
                title_text="📊 Live Battery Parameters Dashboard",
                title_x=0.5,
                title_font=dict(size=24, color='#2c3e50'),
                showlegend=False,
                font=dict(size=12, color='#2c3e50'),
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)'
            )
            
            # Style axes
            for i in range(1, 4):
                for j in range(1, 3):
                    fig.update_xaxes(
                        gridcolor='rgba(0,0,0,0.1)',
                        showgrid=True,
                        zeroline=False,
                        row=j, col=i
                    )
                    fig.update_yaxes(
                        gridcolor='rgba(0,0,0,0.1)',
                        showgrid=True,
                        zeroline=False,
                        row=j, col=i
                    )
            
            # Update axis labels
            fig.update_yaxes(title_text="Voltage (V)", row=1, col=1)
            fig.update_yaxes(title_text="Temperature (°C)", row=1, col=2)
            fig.update_yaxes(title_text="SOH (%)", row=1, col=3)
            fig.update_yaxes(title_text="RUL (cycles)", row=2, col=1)
            fig.update_yaxes(title_text="Current (A)", row=2, col=2)
            fig.update_yaxes(title_text="SOC (%)", row=2, col=3)
            
            return fig
        
        @self.app.callback(
            Output('phase-indicator', 'children'),
            Input('live-data-store', 'data')
        )
        def update_phase_indicator(data):
            """Update trip phase indicator"""
            if not data or 'readings' not in data or not data['readings']:
                return html.Div("⚠️ No phase data", style={'color': '#7f8c8d'})
            
            current_phase = data.get('current_phase', 'unknown')
            
            phase_info = {
                'highway': {
                    'emoji': '🛣️',
                    'title': 'Highway Driving',
                    'description': 'High-speed cruising • Steady discharge • Moderate warming',
                    'color': '#3498db'
                },
                'city': {
                    'emoji': '🏙️',
                    'title': 'City Driving',
                    'description': 'Stop-and-go traffic • Variable discharge • Urban conditions',
                    'color': '#e67e22'
                },
                'parking': {
                    'emoji': '🅿️',
                    'title': 'Parked',
                    'description': 'Vehicle stationary • Minimal drain • Cooling down',
                    'color': '#95a5a6'
                },
                'charging': {
                    'emoji': '🔌',
                    'title': 'Charging',
                    'description': 'Battery charging • Voltage rising • SOC increasing',
                    'color': '#27ae60'
                }
            }
            
            info = phase_info.get(current_phase, {
                'emoji': '🚗',
                'title': 'Unknown Phase',
                'description': 'Phase information not available',
                'color': '#7f8c8d'
            })
            
            return html.Div([
                html.Div([
                    html.H2(f"{info['emoji']} {info['title']}", 
                           style={'color': 'white', 'margin': '0', 'fontSize': '28px'}),
                    html.P(info['description'], 
                          style={'color': '#ecf0f1', 'margin': '10px 0', 'fontSize': '16px'})
                ], style={'textAlign': 'center'})
            ], style={
                'background': f'linear-gradient(135deg, {info["color"]} 0%, {info["color"]}AA 100%)',
                'padding': '30px',
                'borderRadius': '15px',
                'boxShadow': f'0 8px 25px {info["color"]}40'
            })
    
    def run(self, host='127.0.0.1', port=8052, debug=False):
        """Run the colorful dashboard"""
        print(f"🌈 Starting Colorful Live Dashboard...")
        print(f"🌐 Access at: http://{host}:{port}")
        print(f"🔄 Auto-updates every 2 seconds")
        print(f"📊 Displays live battery trip simulation")
        
        self.app.run(host=host, port=port, debug=debug)

def main():
    """Main function"""
    try:
        dashboard = ColorfulLiveDashboard()
        dashboard.run()
    except Exception as e:
        print(f"❌ Dashboard error: {e}")

if __name__ == "__main__":
    main()
