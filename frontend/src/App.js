import React, { useState, useEffect } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Slider, Grid } from '@mui/material';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { sampleRouteData } from './data/sampleData';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom bus icon
const busIcon = new L.Icon({
  iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMDItMTJUMTU6NDc6NDctMDU6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDItMTJUMTU6NDc6NDctMDU6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTAyLTEyVDE1OjQ3OjQ3LTA1OjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjk5ZGNiNzM5LTY3ZDAtNDY0ZC1hMjBmLTlmYjNjZjM2OTBkNyIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjI0ZjQ5ZmIwLTZhMDAtYzU0OC1i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',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Bus simulation component
function BusSimulation({ route, pathCoordinates, isSimulating, progress, onPositionUpdate }) {
  const [position, setPosition] = useState(null);
  const [currentStop, setCurrentStop] = useState(0);
  const map = useMap();

  useEffect(() => {
    if (!route || route.length < 2 || !isSimulating || !pathCoordinates.length) return;

    // Calculate total path length
    let totalLength = 0;
    const segmentLengths = [];
    for (let i = 0; i < pathCoordinates.length - 1; i++) {
      const length = calculateDistance(
        { stop_lat: pathCoordinates[i][0], stop_lon: pathCoordinates[i][1] },
        { stop_lat: pathCoordinates[i + 1][0], stop_lon: pathCoordinates[i + 1][1] }
      );
      segmentLengths.push(length);
      totalLength += length;
    }

    // Calculate cumulative distances
    const cumulativeDistances = [];
    let cumDistance = 0;
    segmentLengths.forEach(length => {
      cumDistance += length;
      cumulativeDistances.push(cumDistance);
    });

    // Find current position on path
    const targetDistance = totalLength * progress;
    let currentSegment = 0;
    while (currentSegment < cumulativeDistances.length && cumulativeDistances[currentSegment] < targetDistance) {
      currentSegment++;
    }

    if (currentSegment < pathCoordinates.length - 1) {
      // Calculate position within current segment
      const prevCumDistance = currentSegment > 0 ? cumulativeDistances[currentSegment - 1] : 0;
      const segmentProgress = (targetDistance - prevCumDistance) / segmentLengths[currentSegment];
      
      const start = pathCoordinates[currentSegment];
      const end = pathCoordinates[currentSegment + 1];
      
      const newLat = start[0] + (end[0] - start[0]) * segmentProgress;
      const newLng = start[1] + (end[1] - start[1]) * segmentProgress;
      
      setPosition([newLat, newLng]);

      // Find current stop
      let stopIndex = 0;
      while (stopIndex < route.length - 1 && 
             calculateDistance(
               { stop_lat: newLat, stop_lon: newLng },
               route[stopIndex]
             ) > 0.1) {
        stopIndex++;
      }
      setCurrentStop(stopIndex);

      // Update position info
      const remainingDistance = totalLength * (1 - progress);
      const speed = totalLength * 0.001 * 3600; // km/h

      onPositionUpdate({
        currentStop: stopIndex,
        nextStop: stopIndex + 1,
        speed: speed.toFixed(1),
        remainingDistance: remainingDistance.toFixed(1),
        progress: (progress * 100).toFixed(1)
      });

      map.setView([newLat, newLng], map.getZoom());
    }
  }, [route, progress, isSimulating, map, onPositionUpdate, pathCoordinates]);

  return position ? (
    <Marker position={position} icon={busIcon}>
    </Marker>
  ) : null;
}

// Calculate distance between two points in kilometers
function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.stop_lat - point1.stop_lat) * Math.PI / 180;
  const dLon = (point2.stop_lon - point1.stop_lon) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.stop_lat * Math.PI / 180) * Math.cos(point2.stop_lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function App() {
  const [locations, setLocations] = useState([
    { stop_lat: '', stop_lon: '', stop_name: '' }
  ]);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [pathCoordinates, setPathCoordinates] = useState([]);
  const [error, setError] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [busInfo, setBusInfo] = useState({
    currentStop: 0,
    nextStop: 1,
    speed: '0.0',
    remainingDistance: '0.0',
    progress: '0.0'
  });

  useEffect(() => {
    let interval;
    if (isSimulating && optimizedRoute) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + (0.001 * simulationSpeed);
          if (next >= 1) {
            setIsSimulating(false);
            return 0;
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, optimizedRoute]);

  const handleAddLocation = () => {
    setLocations([...locations, { stop_lat: '', stop_lon: '', stop_name: '' }]);
  };

  const handleLocationChange = (index, field, value) => {
    const newLocations = [...locations];
    newLocations[index][field] = value;
    setLocations(newLocations);
  };

  const handleLoadSampleData = () => {
    const formattedData = sampleRouteData.map(location => ({
      stop_lat: location.stop_lat.toString(),
      stop_lon: location.stop_lon.toString(),
      stop_name: location.stop_name
    }));
    setLocations(formattedData);
  };

  const handleOptimize = async () => {
    try {
      setError('');
      console.log('Sending optimization request...');
      
      const locationsData = locations.map(loc => ({
        ...loc,
        stop_lat: parseFloat(loc.stop_lat),
        stop_lon: parseFloat(loc.stop_lon)
      }));

      console.log('Request payload:', { locations: locationsData });

      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locations: locationsData }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        setOptimizedRoute(data.route);
        setPathCoordinates(data.path_coordinates || []);
        setError('');
      } else {
        setError(data.message || 'Failed to optimize route');
      }
    } catch (err) {
      console.error('Error during optimization:', err);
      setError(`Failed to connect to server: ${err.message}`);
    }
  };

  const handleStartSimulation = () => {
    setProgress(0);
    setIsSimulating(true);
  };

  const handleStopSimulation = () => {
    setIsSimulating(false);
    setProgress(0);
  };

  const center = locations[0]?.stop_lat && locations[0]?.stop_lon
    ? [parseFloat(locations[0].stop_lat), parseFloat(locations[0].stop_lon)]
    : [12.9716, 77.5946];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Route Optimization
        </Typography>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleLoadSampleData} 
              sx={{ mr: 1 }}
            >
              Load Sample Data
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => setLocations([{ stop_lat: '', stop_lon: '', stop_name: '' }])} 
              sx={{ mr: 1 }}
            >
              Clear All
            </Button>
          </Box>

          {locations.map((location, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="h6">Location {index + 1}</Typography>
              <TextField
                label="Name"
                value={location.stop_name}
                onChange={(e) => handleLocationChange(index, 'stop_name', e.target.value)}
                sx={{ mr: 1, mb: 1 }}
              />
              <TextField
                label="Latitude"
                type="number"
                value={location.stop_lat}
                onChange={(e) => handleLocationChange(index, 'stop_lat', e.target.value)}
                sx={{ mr: 1, mb: 1 }}
              />
              <TextField
                label="Longitude"
                type="number"
                value={location.stop_lon}
                onChange={(e) => handleLocationChange(index, 'stop_lon', e.target.value)}
                sx={{ mb: 1 }}
              />
            </Box>
          ))}

          <Button variant="outlined" onClick={handleAddLocation} sx={{ mr: 1 }}>
            Add Location
          </Button>
          <Button 
            variant="contained" 
            onClick={handleOptimize}
            disabled={locations.some(loc => !loc.stop_lat || !loc.stop_lon || !loc.stop_name)}
            sx={{ mr: 1 }}
          >
            Optimize Route
          </Button>

          {optimizedRoute && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={handleStartSimulation}
                disabled={isSimulating}
                sx={{ mr: 1 }}
              >
                Start Simulation
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleStopSimulation}
                disabled={!isSimulating}
              >
                Stop Simulation
              </Button>
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Simulation Speed</Typography>
                <Slider
                  value={simulationSpeed}
                  onChange={(e, newValue) => setSimulationSpeed(newValue)}
                  min={1}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  sx={{ width: 200 }}
                />
              </Box>
            </>
          )}

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Paper>

        <Paper sx={{ height: '500px', width: '100%', overflow: 'hidden', mb: 2 }}>
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '600px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {optimizedRoute && optimizedRoute.map((location, index) => (
              <Marker
                key={index}
                position={[location.stop_lat, location.stop_lon]}
              >
              </Marker>
            ))}

            {pathCoordinates.length > 0 && (
              <Polyline
                positions={pathCoordinates}
                color="blue"
                weight={3}
                opacity={0.7}
              />
            )}

            {isSimulating && optimizedRoute && (
              <BusSimulation
                route={optimizedRoute}
                pathCoordinates={pathCoordinates}
                isSimulating={isSimulating}
                progress={progress}
                onPositionUpdate={setBusInfo}
              />
            )}
          </MapContainer>
        </Paper>

        {/* Real-time Dashboard */}
        {optimizedRoute && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Real-time Bus Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Location
                  </Typography>
                  <Typography variant="h6">
                    {optimizedRoute[busInfo.currentStop]?.stop_name || 'Starting Point'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Next Stop
                  </Typography>
                  <Typography variant="h6">
                    {optimizedRoute[busInfo.nextStop]?.stop_name || 'Final Destination'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Speed
                  </Typography>
                  <Typography variant="h6">
                    {busInfo.speed} km/h
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Distance to Next Stop
                  </Typography>
                  <Typography variant="h6">
                    {busInfo.remainingDistance} km
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Route Progress
                  </Typography>
                  <Typography variant="h6">
                    {busInfo.progress}%
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default App;
