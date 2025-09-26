import dash
from dash import dcc, html, Input, Output
import plotly.graph_objects as go
import pandas as pd
import json
import os
from datetime import datetime
import numpy as np

class FlexiEVDashboard:
    def __init__(self):
        """Initialize Flexi-EV themed dashboard with clean callbacks"""
        # Flexi-EV Color Scheme - Dark theme based on #00403C
        self.colors = {
            'primary': '#00403C',
            'primary_light': '#0A5A54',
            'primary_dark': '#002E2A',
            'accent': '#8FD6C2',
            'accent_light': '#A8E0D1',
            'accent_dark': '#6BB59E',
            'bg_primary': '#001C1A',
            'bg_secondary': '#002E2A',
            'bg_tertiary': '#00403C',
            'text_primary': '#FFFFFF',
            'text_secondary': '#B8E6D9',
            'text_muted': '#8FD6C2',
            'success': '#27ae60',
            'warning': '#f39c12',
            'danger': '#e74c3c'
        }
        
        # Initialize Dash app
        self.app = dash.Dash(__name__)
        self.app.title = "Flexi-EV Analytics"
        
        # Setup layout and callbacks
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
                return data
            else:
                print(f"Live data file not found at: {live_data_path}")
                return self.create_sample_data()
        except Exception as e:
            print(f"Error loading data: {e}")
            return self.create_sample_data()
    
    def create_sample_data(self):
        """Create sample data if no live data available"""
        import random
        import time
        
        # Create realistic sample data
        readings = []
        base_soc = 85
        base_voltage = 3.8
        base_temp = 25
        
        for i in range(10):
            # Simulate realistic battery behavior
            soc = max(20, base_soc - (i * 2) + random.uniform(-1, 1))
            voltage = base_voltage - (i * 0.02) + random.uniform(-0.05, 0.05)
            current = random.uniform(1.5, 3.0)
            temperature = base_temp + random.uniform(-2, 5)
            soh = max(70, 95 - (i * 0.5) + random.uniform(-1, 1))
            rul = max(500, 1500 - (i * 50) + random.uniform(-20, 20))
            
            phases = ['highway', 'city', 'parking']
            phase = phases[i % len(phases)]
            
            readings.append({
                "reading_number": i + 1,
                "voltage": round(voltage, 2),
                "current": round(current, 2),
                "temperature": round(temperature, 1),
                "soc": round(soc, 1),
                "soh": round(soh, 1),
                "rul": round(rul, 0),
                "trip_phase": phase
            })
        
        return {
            "name": "Sample Live Trip Data",
            "readings": readings,
            "current_phase": "city"
        }
    
    def setup_layout(self):
        """Setup Flexi-EV themed dashboard layout"""
        self.app.layout = html.Div([
            # Header with Flexi-EV theme
            html.Div([
                html.Div([
                    html.Div([
                        html.H1("Flexi-EV Analytics", 
                               style={
                                   'color': self.colors['text_primary'], 
                                   'margin': '0', 
                                   'display': 'inline-block',
                                   'fontFamily': 'Inter, sans-serif', 
                                   'fontWeight': '700'
                               })
                    ], style={
                        'display': 'flex', 
                        'alignItems': 'center', 
                        'justifyContent': 'center'
                    }),
                    html.H3("Live Battery Monitoring Dashboard", 
                           style={
                               'textAlign': 'center', 
                               'color': self.colors['text_secondary'], 
                               'marginTop': '10px', 
                               'marginBottom': '20px', 
                               'fontFamily': 'Inter, sans-serif', 
                               'fontWeight': '400'
                           }),
                    html.Div(id='live-status', style={
                        'textAlign': 'center', 
                        'color': self.colors['text_muted'], 
                        'fontSize': '16px', 
                        'fontFamily': 'Inter, sans-serif'
                    })
                ])
            ], style={
                'background': f'linear-gradient(135deg, {self.colors["primary"]} 0%, {self.colors["primary_light"]} 100%)',
                'padding': '30px',
                'marginBottom': '20px',
                'borderRadius': '0 0 20px 20px',
                'boxShadow': f'0 4px 20px rgba(0, 64, 60, 0.3)'
            }),
            
            # Main content with dark background
            html.Div([
                # Key Metrics Row
                html.Div([
                    # Battery Level Card
                    html.Div([
                        html.Div([
                            html.H3(id='battery-level', style={
                                'margin': '0', 
                                'color': self.colors['text_primary']
                            }),
                            html.P("Battery Level", style={
                                'margin': '5px 0 0 0', 
                                'color': self.colors['text_muted']
                            })
                        ], style={'textAlign': 'center'})
                    ], style={
                        'background': self.colors['primary_light'],
                        'padding': '20px',
                        'borderRadius': '16px',
                        'boxShadow': f'0 4px 15px rgba(0, 64, 60, 0.2)',
                        'border': f'1px solid {self.colors["accent_dark"]}'
                    }),
                    
                    # Range Card
                    html.Div([
                        html.Div([
                            html.H3(id='range-remaining', style={
                                'margin': '0', 
                                'color': self.colors['text_primary']
                            }),
                            html.P("Range Left", style={
                                'margin': '5px 0 0 0', 
                                'color': self.colors['text_muted']
                            })
                        ], style={'textAlign': 'center'})
                    ], style={
                        'background': self.colors['primary_light'],
                        'padding': '20px',
                        'borderRadius': '16px',
                        'boxShadow': f'0 4px 15px rgba(0, 64, 60, 0.2)',
                        'border': f'1px solid {self.colors["accent_dark"]}'
                    }),
                    
                    # Current Phase Card
                    html.Div([
                        html.Div([
                            html.H3(id='current-phase', style={
                                'margin': '0', 
                                'color': self.colors['text_primary']
                            }),
                            html.P("Trip Phase", style={
                                'margin': '5px 0 0 0', 
                                'color': self.colors['text_muted']
                            })
                        ], style={'textAlign': 'center'})
                    ], style={
                        'background': self.colors['primary_light'],
                        'padding': '20px',
                        'borderRadius': '16px',
                        'boxShadow': f'0 4px 15px rgba(0, 64, 60, 0.2)',
                        'border': f'1px solid {self.colors["accent_dark"]}'
                    }),
                    
                    # Health Status Card
                    html.Div([
                        html.Div([
                            html.H3(id='health-status', style={
                                'margin': '0', 
                                'color': self.colors['text_primary']
                            }),
                            html.P("Battery Health", style={
                                'margin': '5px 0 0 0', 
                                'color': self.colors['text_muted']
                            })
                        ], style={'textAlign': 'center'})
                    ], style={
                        'background': self.colors['primary_light'],
                        'padding': '20px',
                        'borderRadius': '16px',
                        'boxShadow': f'0 4px 15px rgba(0, 64, 60, 0.2)',
                        'border': f'1px solid {self.colors["accent_dark"]}'
                    })
                ], style={
                    'display': 'grid',
                    'gridTemplateColumns': 'repeat(auto-fit, minmax(200px, 1fr))',
                    'gap': '20px',
                    'marginBottom': '30px'
                }),
                
                # Charts Row
                html.Div([
                    # Voltage Chart
                    html.Div([
                        dcc.Graph(id='voltage-chart', config={'displayModeBar': False})
                    ], style={
                        'background': self.colors['bg_secondary'],
                        'borderRadius': '16px',
                        'padding': '20px',
                        'boxShadow': f'0 4px 15px rgba(0, 64, 60, 0.1)',
                        'border': f'1px solid {self.colors["primary_light"]}'
                    }),
                    
                    # Current Chart
                    html.Div([
                        dcc.Graph(id='current-chart', config={'displayModeBar': False})
                    ], style={
                        'background': self.colors['bg_secondary'],
                        'borderRadius': '16px',
                        'padding': '20px',
                        'boxShadow': f'0 4px 15px rgba(0, 64, 60, 0.1)',
                        'border': f'1px solid {self.colors["primary_light"]}'
                    })
                ], style={
                    'display': 'grid',
                    'gridTemplateColumns': '1fr 1fr',
                    'gap': '20px',
                    'marginBottom': '20px'
                }),
                
                # Temperature and SOC Charts
                html.Div([
                    html.Div([
                        dcc.Graph(id='temperature-chart', config={'displayModeBar': False})
                    ], style={
                        'background': self.colors['bg_secondary'],
                        'borderRadius': '16px',
                        'padding': '20px',
                        'boxShadow': f'0 4px 15px rgba(0, 64, 60, 0.1)',
                        'border': f'1px solid {self.colors["primary_light"]}'
                    }),
                    
                    html.Div([
                        dcc.Graph(id='soc-chart', config={'displayModeBar': False})
                    ], style={
                        'background': self.colors['bg_secondary'],
                        'borderRadius': '16px',
                        'padding': '20px',
                        'boxShadow': f'0 4px 15px rgba(0, 64, 60, 0.1)',
                        'border': f'1px solid {self.colors["primary_light"]}'
                    })
                ], style={
                    'display': 'grid',
                    'gridTemplateColumns': '1fr 1fr',
                    'gap': '20px'
                })
            ], style={
                'padding': '20px',
                'maxWidth': '1200px',
                'margin': '0 auto'
            }),
            
            # Auto-refresh component
            dcc.Interval(
                id='interval-component',
                interval=3000,  # Update every 3 seconds
                n_intervals=0
            )
        ], style={
            'background': f'linear-gradient(135deg, {self.colors["bg_primary"]} 0%, {self.colors["bg_secondary"]} 100%)',
            'minHeight': '100vh',
            'fontFamily': 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
        })

    def setup_callbacks(self):
        """Setup dashboard callbacks for real-time updates - CLEAN VERSION"""
        @self.app.callback(
            [Output('live-status', 'children'),
             Output('battery-level', 'children'),
             Output('range-remaining', 'children'),
             Output('current-phase', 'children'),
             Output('health-status', 'children'),
             Output('voltage-chart', 'figure'),
             Output('current-chart', 'figure'),
             Output('temperature-chart', 'figure'),
             Output('soc-chart', 'figure')],
            [Input('interval-component', 'n_intervals')]
        )
        def update_dashboard(n):
            """Main callback to update all dashboard components"""
            try:
                # Load latest data
                data = self.load_live_data()
                readings = data.get('readings', [])
                
                if not readings:
                    empty_fig = self.create_empty_chart("No Data Available")
                    return ("No data available", "N/A", "N/A", "N/A", "N/A", 
                           empty_fig, empty_fig, empty_fig, empty_fig)
                
                # Get latest reading
                latest = readings[-1]
                readings_count = len(readings)
                
                # Status text
                status = f"Live • Last updated: {datetime.now().strftime('%H:%M:%S')} • {readings_count} readings"
                
                # Key metrics
                battery_level = f"{latest.get('soc', 0):.1f}%"
                range_calc = latest.get('soc', 0) * 3.2  # Realistic range calculation
                range_remaining = f"{range_calc:.0f} km"
                current_phase = latest.get('trip_phase', 'unknown').title()
                health_status = f"{latest.get('soh', 0):.1f}%"
                
                # Create charts with recent data (last 10 readings)
                recent_readings = readings[-10:] if len(readings) > 10 else readings
                
                voltage_fig = self.create_line_chart(recent_readings, 'voltage', 'Voltage (V)', self.colors['accent'])
                current_fig = self.create_line_chart(recent_readings, 'current', 'Current (A)', self.colors['accent_light'])
                temp_fig = self.create_line_chart(recent_readings, 'temperature', 'Temperature (°C)', self.colors['accent_dark'])
                soc_fig = self.create_line_chart(recent_readings, 'soc', 'State of Charge (%)', self.colors['accent'])
                
                return (status, battery_level, range_remaining, current_phase, health_status,
                        voltage_fig, current_fig, temp_fig, soc_fig)
                
            except Exception as e:
                print(f"Callback error: {e}")
                error_fig = self.create_empty_chart("Error Loading Data")
                return (f"Error: {str(e)}", "Error", "Error", "Error", "Error",
                       error_fig, error_fig, error_fig, error_fig)

    def create_line_chart(self, readings, field, title, color):
        """Create a styled line chart using Flexi-EV theme"""
        if not readings:
            return self.create_empty_chart("No Data")
        
        try:
            x_data = list(range(len(readings)))
            y_data = [r.get(field, 0) for r in readings]
            
            fig = go.Figure()
            
            # Add line trace
            fig.add_trace(go.Scatter(
                x=x_data,
                y=y_data,
                mode='lines+markers',
                line=dict(color=color, width=3, shape='linear'),
                marker=dict(
                    color=color, 
                    size=6,
                    line=dict(color='white', width=1)
                ),
                fill='tozeroy',
                fillcolor=f'rgba({int(color[1:3], 16)}, {int(color[3:5], 16)}, {int(color[5:7], 16)}, 0.1)',
                name=title,
                hovertemplate=f'<b>{title}</b><br>Reading: %{{x}}<br>Value: %{{y}}<extra></extra>'
            ))
            
            # Update layout with Flexi-EV theme
            fig.update_layout(
                title=dict(
                    text=title,
                    font=dict(color=self.colors['text_primary'], size=16, family='Inter'),
                    x=0.5
                ),
                paper_bgcolor=self.colors['bg_secondary'],
                plot_bgcolor=self.colors['bg_secondary'],
                font=dict(color=self.colors['text_secondary'], family='Inter'),
                xaxis=dict(
                    gridcolor=self.colors['primary_light'],
                    zerolinecolor=self.colors['primary_light'],
                    color=self.colors['text_muted'],
                    title=dict(text="Reading", font=dict(size=12))
                ),
                yaxis=dict(
                    gridcolor=self.colors['primary_light'],
                    zerolinecolor=self.colors['primary_light'],
                    color=self.colors['text_muted'],
                    title=dict(text=title.split('(')[0].strip(), font=dict(size=12))
                ),
                margin=dict(l=50, r=30, t=50, b=40),
                showlegend=False,
                height=300
            )
            
            return fig
            
        except Exception as e:
            print(f"Chart creation error: {e}")
            return self.create_empty_chart("Chart Error")

    def create_empty_chart(self, message):
        """Create an empty chart with a message"""
        fig = go.Figure()
        fig.add_annotation(
            text=message,
            xref="paper", yref="paper",
            x=0.5, y=0.5,
            showarrow=False,
            font=dict(color=self.colors['text_muted'], size=16)
        )
        fig.update_layout(
            paper_bgcolor=self.colors['bg_secondary'],
            plot_bgcolor=self.colors['bg_secondary'],
            xaxis=dict(visible=False),
            yaxis=dict(visible=False),
            height=300
        )
        return fig

    def run(self, debug=False, port=8055):
        """Run the dashboard"""
        print("Starting Flexi-EV Analytics Dashboard...")
        print(f"Dashboard URL: http://127.0.0.1:{port}")
        print("Auto-updates every 3 seconds")
        print("Live Battery Analytics with Flexi-EV Theme")
        print("="*50)
        
        try:
            self.app.run(debug=debug, port=port, host='127.0.0.1')
        except Exception as e:
            print(f"Error starting dashboard: {e}")
            print("Please ensure port 8055 is available")

def main():
    """Main function to start the dashboard"""
    dashboard = FlexiEVDashboard()
    dashboard.run(debug=False)

if __name__ == "__main__":
    main()
