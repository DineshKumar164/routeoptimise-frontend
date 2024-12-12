from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    # Import and register blueprints
    from app.routes import route_optimization
    app.register_blueprint(route_optimization.bp)
    
    # Add a root route
    @app.route('/')
    def index():
        return 'Welcome to Route Optimization API. Use /api/ for the API endpoints.'
    
    return app 