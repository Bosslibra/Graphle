""" Iniitialize Flask app and register blueprints. """

from flask import Flask
from flask_openapi3 import OpenAPI, Info

info = Info(
    title="Graphle API",
    version="0.0.1",
    description="API for Graphle puzzle game"
)


def create_app():
    """Create the Flask app."""
    # Use OpenAPI instead of Flask to get automatic API documentation
    app = OpenAPI(
        __name__,
        info=info
    )

    # Load configuration from config.py
    app.config.from_object("config.Config")

    with app.app_context():
        # Import the parts of the application
        # API blueprints
        from app.api import health_check, mst

        # Register the blueprints
        app.register_api(health_check.health_check_bp)
        app.register_api(mst.mst_bp)
    
    if app.config.get("ENV") != "production":
        print("API docs available at: http://127.0.0.1:5000/openapi/scalar")

    return app
