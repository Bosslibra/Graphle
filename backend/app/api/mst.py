import random
import string

from flask import jsonify, request
from flask_openapi3 import APIBlueprint, Tag

mst_tag = Tag(name="Graph")
mst_bp = APIBlueprint("mst", __name__, url_prefix="/api")


@mst_bp.get("/graph", tags=[mst_tag])
def get_graph():
    """
    Generate a random MST graph with the given seed.
    
    Returns:
        200 OK with JSON containing the graph nodes and edges.
    """
    user_seed = request.args.get("seed")

    # 2. If they didn't provide a seed, create a random one
    # Note: If you want to force them to always have a seed in the URL,
    # you would redirect them instead of doing this silently.
    if not user_seed:
        user_seed = generate_random_seed()

    # 3. Generate the graph using the seed
    puzzle_data = generate_graph(n_nodes=6, min_w=1, max_w=15, seed=user_seed)

    # 4. Attach the seed to the response so the frontend knows what it is!
    puzzle_data["seed"] = user_seed

    return jsonify(puzzle_data)


def generate_random_seed():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


def generate_graph(n_nodes: int, min_w: int, max_w: int, seed: str):
    """
    Generate a random MST graph with n_nodes and a random seed
    """
    # 1. Create an isolated random number generator just for this graph
    rng = random.Random(seed)

    # 2. Use 'rng' instead of 'random' for all choices
    labels = rng.sample("ABCDEFGHIJKLMNOPQRSTUVWXYZ", n_nodes)
    nodes = [{"id": label} for label in labels]

    edges = []
    edge_counter = 1
    existing_pairs = set()

    connected = [labels[0]]
    unconnected = labels[1:]
    rng.shuffle(unconnected)  # Use rng here too!

    for new_node in unconnected:
        target = rng.choice(connected)
        weight = rng.randint(min_w, max_w)

        edges.append({"id": f"e{edge_counter}", "source": new_node, "target": target, "weight": weight})

        existing_pairs.add(tuple(sorted([new_node, target])))
        connected.append(new_node)
        edge_counter += 1

    extra_edges_needed = n_nodes
    attempts = 0

    while extra_edges_needed > 0 and attempts < 100:
        attempts += 1
        u, v = rng.sample(labels, 2)
        pair = tuple(sorted([u, v]))

        if pair not in existing_pairs:
            weight = rng.randint(min_w, max_w)
            edges.append({"id": f"e{edge_counter}", "source": u, "target": v, "weight": weight})
            existing_pairs.add(pair)
            extra_edges_needed -= 1
            edge_counter += 1

    return {"nodes": nodes, "edges": edges}
