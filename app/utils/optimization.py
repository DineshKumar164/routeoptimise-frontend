from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def create_data_model(distance_matrix):
    """Creates the data model for the problem."""
    data = {}
    data['distance_matrix'] = distance_matrix
    data['num_vehicles'] = 1
    data['depot'] = 0
    return data

def get_solution(data):
    """Solve the TSP problem."""
    # Create the routing index manager
    manager = pywrapcp.RoutingIndexManager(
        len(data['distance_matrix']),
        data['num_vehicles'],
        data['depot']
    )

    # Create Routing Model
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        """Returns the distance between the two nodes."""
        # Convert from routing variable Index to distance matrix NodeIndex
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['distance_matrix'][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)

    # Define cost of each arc
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Setting first solution heuristic
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.CHRISTOFIDES
    )
    
    # Add local search metaheuristics
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 30
    search_parameters.solution_limit = 100

    # Solve the problem
    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        index = []
        total_distance = 0
        index_node = routing.Start(0)
        
        while not routing.IsEnd(index_node):
            index.append(manager.IndexToNode(index_node))
            previous_index = index_node
            index_node = solution.Value(routing.NextVar(index_node))
            total_distance += routing.GetArcCostForVehicle(previous_index, index_node, 0)
            
        index.append(manager.IndexToNode(index_node))
        
        return {
            'route': index,
            'total_distance': total_distance
        }
    
    return None 