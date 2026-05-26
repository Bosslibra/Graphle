import random
import string
from typing import List

from app.models.mst import Edge, GraphResponse, Node


def generate_random_seed() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


def generate_graph(n_nodes: int, min_w: int, max_w: int, seed: str) -> GraphResponse:
    """Generate a random connected graph using Kruskal-style spanning tree plus extra edges."""
    rng = random.Random(seed)

    labels = rng.sample("ABCDEFGHIJKLMNOPQRSTUVWXYZ", n_nodes)
    nodes = [Node(id=label) for label in labels]

    edges: List[Edge] = []
    edge_counter = 1
    existing_pairs: set = set()

    connected = [labels[0]]
    unconnected = labels[1:]
    rng.shuffle(unconnected)

    for new_node in unconnected:
        target = rng.choice(connected)
        weight = rng.randint(min_w, max_w)

        edges.append(Edge(
            id=f"e{edge_counter}",
            source=new_node,
            target=target,
            weight=weight,
        ))

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
            edges.append(Edge(
                id=f"e{edge_counter}",
                source=u,
                target=v,
                weight=weight,
            ))
            existing_pairs.add(pair)
            extra_edges_needed -= 1
            edge_counter += 1

    return GraphResponse(nodes=nodes, edges=edges, seed=seed)
