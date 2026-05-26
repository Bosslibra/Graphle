""" Iniitialize Flask app and register blueprints. """


import os
from flask_openapi3 import OpenAPI, Info

from config import config_by_name, Env

info = Info(
    title="Graphle API",
    version="0.0.1",
    description="API for Graphle puzzle game"
)


def create_app():
    """Create the Flask app."""

    # 1. Resolve environment
    env = os.getenv("ENVIRONMENT", Env.PRODUCTION)

    # 2. Load config class
    config_class = config_by_name.get(env, config_by_name[Env.PRODUCTION])

    # Use OpenAPI instead of Flask to get automatic API documentation
    app = OpenAPI(
        __name__,
        info=info
    )

    app.config.from_object(config_class)

    with app.app_context():
        # Import the parts of the application
        # API blueprints
        from app.api import health_check, mst

        # Register the blueprints
        app.register_api(health_check.health_check_bp)
        app.register_api(mst.mst_bp)

    if app.config.get("ENABLE_SCALAR"):
        print("API docs available at: http://127.0.0.1:5000/openapi/scalar")

    return app
