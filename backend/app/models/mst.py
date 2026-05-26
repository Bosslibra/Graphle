from typing import List

from pydantic import BaseModel, Field


class Node(BaseModel):
    """A node in the graph."""
    id: str = Field(description="Unique identifier for the node (typically a letter A-Z)")


class Edge(BaseModel):
    """An edge connecting two nodes in the graph."""
    id: str = Field(description="Unique identifier for the edge")
    source: str = Field(description="Node ID of the edge source")
    target: str = Field(description="Node ID of the edge target")
    weight: int = Field(description="Weight of the edge (1-15)")


class GraphResponse(BaseModel):
    """The generated graph response containing nodes, edges, and seed."""
    nodes: List[Node] = Field(description="List of nodes in the graph")
    edges: List[Edge] = Field(description="List of edges in the graph")
    seed: str = Field(description="Seed used to generate this graph")
