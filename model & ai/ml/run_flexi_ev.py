#!/usr/bin/env python3
"""
Simple HTTP Server for Flexi-EV Chatbot
Serves the chatbot UI on localhost
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

class FlexiEVServer:
    def __init__(self, port=8053):
        self.port = port
        self.directory = os.path.dirname(os.path.abspath(__file__))
        
    def start_server(self):
        """Start the HTTP server"""
        os.chdir(self.directory)
        
        handler = http.server.SimpleHTTPRequestHandler
        
        with socketserver.TCPServer(("", self.port), handler) as httpd:
            print("=" * 60)
            print("🚗 FLEXI-EV CHATBOT SERVER")
            print("=" * 60)
            print(f"🌐 Server running at: http://localhost:{self.port}")
            print(f"📱 Chatbot URL: http://localhost:{self.port}/flexi-ev-chatbot.html")
            print("🔄 Auto-opening browser...")
            print("💡 Press Ctrl+C to stop the server") 
            print("=" * 60)
            
            # Auto-open browser
            webbrowser.open(f'http://localhost:{self.port}/flexi-ev-chatbot.html')
            
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n🛑 Server stopped!")
                sys.exit(0)

def main():
    """Main function"""
    server = FlexiEVServer()
    server.start_server()

if __name__ == "__main__":
    main()
