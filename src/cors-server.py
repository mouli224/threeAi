import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import os
from urllib.error import HTTPError

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def do_POST(self):
        # Handle Hugging Face API proxy
        if self.path.startswith('/api/hf/'):
            self.handle_hf_proxy()
        else:
            super().do_POST()
    
    def handle_hf_proxy(self):
        try:
            # Extract model from path
            path_parts = self.path.split('/')
            if len(path_parts) < 4:
                self.send_error(400, "Invalid API path")
                return
            
            model = path_parts[3]
            
            # Map models to endpoints
            model_endpoints = {
                'shap-e': 'https://api-inference.huggingface.co/models/openai/shap-e',
                'point-e': 'https://api-inference.huggingface.co/models/openai/point-e',
                'stable-diffusion': 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2'
            }
            
            if model not in model_endpoints:
                self.send_error(400, f"Unknown model: {model}")
                return
            
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            request_body = self.rfile.read(content_length)
            
            # Get HF token (you'd normally get this from config)
            hf_token = "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"
            
            # Create request to Hugging Face
            req = urllib.request.Request(
                model_endpoints[model],
                data=request_body,
                headers={
                    'Authorization': f'Bearer {hf_token}',
                    'Content-Type': 'application/json'
                },
                method='POST'
            )
            
            # Make request to Hugging Face
            try:
                with urllib.request.urlopen(req) as response:
                    self.send_response(response.status)
                    
                    # Copy headers
                    for header, value in response.headers.items():
                        if header.lower() not in ['connection', 'transfer-encoding']:
                            self.send_header(header, value)
                    
                    self.end_headers()
                    
                    # Copy response body
                    while True:
                        chunk = response.read(8192)
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                        
            except HTTPError as e:
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                
                error_response = {
                    'error': f'Hugging Face API error: {e.reason}',
                    'status': e.code
                }
                self.wfile.write(json.dumps(error_response).encode())
                
        except Exception as e:
            self.send_error(500, f"Proxy error: {str(e)}")

if __name__ == "__main__":
    PORT = 8002
    
    with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
        print(f"🚀 Serving with CORS and HF proxy at http://localhost:{PORT}")
        print(f"📁 Serving files from: {os.getcwd()}")
        print(f"🤗 Hugging Face API proxy available at /api/hf/[model]")
        print("Available models: shap-e, point-e, stable-diffusion")
        httpd.serve_forever()
