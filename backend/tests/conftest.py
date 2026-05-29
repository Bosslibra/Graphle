import pytest

from app import create_app


@pytest.fixture
def app():
    app = create_app()
    app.config.update(
        TESTING=True,
        SECRET_KEY="test_secret_key"  # <--- needed for session / login_user()
    )
    return app


@pytest.fixture
def client(app):
    return app.test_client()
