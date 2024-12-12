# Route Optimization API

A Flask-based backend API for route optimization using OR-Tools and OSMnx.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python run.py
```

The server will start on http://localhost:5001

## API Endpoints

### GET /api/
Health check endpoint that returns API status.

Response:
```json
{
    "status": "success",
    "message": "Route Optimization API is running"
}
```

### POST /api/optimize

Optimizes a route for given locations.

Request body:
```json
{
    "locations": [
        {
            "stop_lat": 28.614614,
            "stop_lon": 76.978024,
            "stop_name": "Location 1"
        },
        {
            "stop_lat": 28.615000,
            "stop_lon": 76.979000,
            "stop_name": "Location 2"
        }
    ]
}
```

Response:
```json
{
    "status": "success",
    "route": [
        {
            "stop_lat": 28.614614,
            "stop_lon": 76.978024,
            "stop_name": "Location 1"
        },
        {
            "stop_lat": 28.615000,
            "stop_lon": 76.979000,
            "stop_name": "Location 2"
        }
    ],
    "total_distance": 1234
}
```

## Features

- Route optimization using Google OR-Tools
- Real road network distances using OSMnx
- RESTful API endpoints
- Error handling and validation
- CORS support 