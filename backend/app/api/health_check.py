from flask_openapi3 import APIBlueprint, Tag
from flask import jsonify

health_tag = Tag(name="Health Check")
health_check_bp = APIBlueprint("health_check", __name__, url_prefix="/api")


# Health check route
@health_check_bp.get("/health", tags=[health_tag])
def health():
    """
    Simple health check endpoint to verify that the server is running.

    Behaviour:
        - Does not perform any deep check.

    Returns:
        200 OK with JSON containing a status message.
    """

    # Here I should app services health checks, as db and similar
    # Overkill for now

    return jsonify({"status": "ok"}), 200
