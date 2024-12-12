from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
import osmnx as ox
import networkx as nx
from ortools.constraint_solver import pywrapcp
from ortools.constraint_solver import routing_enums_pb2
from app.utils.optimization import create_data_model, get_solution
import logging
from shapely.geometry import LineString
from shapely.ops import linemerge

bp = Blueprint('route_optimization', __name__, url_prefix='/api')

def simplify_path(coords, tolerance=0.00001):
    """Simplify a path using Shapely's simplification."""
    if len(coords) < 2:
        return coords
    line = LineString(coords)
    simplified = line.simplify(tolerance, preserve_topology=True)
    return list(simplified.coords)

def get_clean_route(G, start_node, end_node):
    """Get a clean route between two nodes."""
    try:
        # Get the shortest path
        path = nx.shortest_path(G, start_node, end_node, weight='length')
        
        # Get the coordinates for the path
        coords = []
        for node in path:
            coords.append((float(G.nodes[node]['x']), float(G.nodes[node]['y'])))
        
        # Simplify the path
        simplified = simplify_path(coords)
        
        # Convert to lat/lon pairs
        return [[y, x] for x, y in simplified]
    except Exception as e:
        print(f"Error getting route: {str(e)}")
        return None

@bp.route('/', methods=['GET'])
def index():
    return jsonify({
        'status': 'success',
        'message': 'Route Optimization API is running'
    })

@bp.route('/optimize', methods=['POST'])
def optimize_route():
    try:
        print("Received optimization request")
        data = request.get_json()
        
        if not data or 'locations' not in data:
            return jsonify({
                'status': 'error',
                'message': 'No locations provided'
            }), 400
            
        locations = pd.DataFrame(data['locations'])
        print(f"Processing {len(locations)} locations")
        
        if len(locations) < 2:
            return jsonify({
                'status': 'error',
                'message': 'At least 2 locations are required'
            }), 400
            
        required_columns = ['stop_lat', 'stop_lon', 'stop_name']
        if not all(col in locations.columns for col in required_columns):
            return jsonify({
                'status': 'error',
                'message': f'Missing required columns. Required: {required_columns}'
            }), 400
            
        # Create road network graph
        print("Creating road network graph...")
        G = ox.graph_from_bbox(
            locations['stop_lat'].max() + 0.01,
            locations['stop_lat'].min() - 0.01,
            locations['stop_lon'].max() + 0.01,
            locations['stop_lon'].min() - 0.01,
            network_type='drive',
            simplify=True
        )
        
        # Clean the graph
        G = ox.utils_graph.get_largest_component(G, strongly=True)
        
        # Calculate distance matrix
        print("Calculating distance matrix...")
        distance_matrix = []
        node_pairs = {}
        
        for i, row1 in locations.iterrows():
            row_distances = []
            for j, row2 in locations.iterrows():
                if i == j:
                    row_distances.append(0)
                else:
                    try:
                        orig_node = ox.nearest_nodes(G, row1['stop_lon'], row1['stop_lat'])
                        dest_node = ox.nearest_nodes(G, row2['stop_lon'], row2['stop_lat'])
                        
                        try:
                            distance = nx.shortest_path_length(G, orig_node, dest_node, weight='length')
                            row_distances.append(int(distance))
                            node_pairs[(i, j)] = (orig_node, dest_node)
                        except nx.NetworkXNoPath:
                            print(f"No path found between nodes {orig_node} and {dest_node}")
                            row_distances.append(1000000)
                    except Exception as e:
                        print(f"Error calculating distance: {str(e)}")
                        row_distances.append(1000000)
            distance_matrix.append(row_distances)
        
        print("Distance matrix calculated")
        
        # Create data model for OR-Tools
        data_model = create_data_model(distance_matrix)
        
        # Get solution using OR-Tools
        print("Solving optimization problem...")
        solution = get_solution(data_model)
        
        if solution:
            print("Solution found")
            route = []
            path_coordinates = []
            index = solution['route']
            
            # Build the complete route
            for i in range(len(index) - 1):
                current_idx = index[i]
                next_idx = index[i + 1]
                
                # Get nodes for this segment
                node_pair = node_pairs.get((current_idx, next_idx))
                if node_pair:
                    start_node, end_node = node_pair
                    segment_coords = get_clean_route(G, start_node, end_node)
                    
                    if segment_coords:
                        if not path_coordinates:
                            path_coordinates.extend(segment_coords)
                        else:
                            # Only add new coordinates if they're significantly different
                            path_coordinates.extend(segment_coords[1:])
            
            # Add route points for markers
            for node in index:
                route.append({
                    'stop_lat': float(locations.iloc[node]['stop_lat']),
                    'stop_lon': float(locations.iloc[node]['stop_lon']),
                    'stop_name': locations.iloc[node]['stop_name']
                })
            
            # Final path simplification
            if path_coordinates:
                path_coordinates = simplify_path([[x, y] for x, y in path_coordinates], tolerance=0.00001)
            
            return jsonify({
                'status': 'success',
                'route': route,
                'path_coordinates': path_coordinates,
                'total_distance': solution['total_distance']
            })
        else:
            print("No solution found")
            return jsonify({
                'status': 'error',
                'message': 'No solution found'
            }), 400
            
    except Exception as e:
        print(f"Error in optimization: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 