""" Iniitialize Flask app and register blueprints. """

from flask import Flask


def create_app():
    """Create the Flask app."""
    app = Flask(__name__, static_folder='/tech_stack_tracker/static', template_folder='/tech_stack_tracker/home/templates')
    app.config.from_object("config.Config")

    with app.app_context():
        # Import the parts of the application

        # Page-serving blueprints

        # API blueprints
        from app.api import auth, health_check

        # Register the blueprints
        app.register_blueprint(health_check.health_check_bp)

    return app
