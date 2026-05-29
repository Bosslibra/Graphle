from typing import Optional

from flask_openapi3 import APIBlueprint, Tag
from pydantic import BaseModel, Field, field_validator
import re

from app.models.mst import GraphResponse
from app.service.mst import generate_graph, generate_random_seed

from app.models.errors import ErrorDetail, ValidationErrorResponse

mst_tag = Tag(name="Graph")
mst_bp = APIBlueprint("mst", __name__, url_prefix="/api")


class GraphQuery(BaseModel):
    """Query parameters for graph generation."""
    seed: Optional[str] = Field(
        None,
        min_length=6,
        max_length=6,
        description="Optional seed for reproducible graph generation. If not provided, a random one is generated."
    )

    @field_validator("seed")
    @classmethod
    def seed_must_be_alphanumeric(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not re.fullmatch(r"[A-Za-z0-9]+", v):
            raise ValueError("Seed must be alphanumeric.")
        return v


@mst_bp.get("/graph", tags=[mst_tag],
            responses={
        "200": GraphResponse,
        "422": ValidationErrorResponse,   # shown in Scalar under "Responses"
        "500": ErrorDetail,
    })
def get_graph(query: GraphQuery):
    """Generate a random MST graph with the given seed."""
    seed = query.seed or generate_random_seed()

    graph = generate_graph(n_nodes=6, min_w=1, max_w=15, seed=seed)
    return graph.model_dump()
