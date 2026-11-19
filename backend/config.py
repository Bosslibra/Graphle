"""Class-based Flask app configuration."""

from datetime import timedelta
from os import environ, path
from dotenv import load_dotenv

BASE_DIR = path.abspath(path.dirname(__file__))
load_dotenv(path.join(BASE_DIR, ".env"))


def _is_truthy(value, default=False):
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


class Config:
    """Base configuration loaded from environment variables."""

    # General
    ENVIRONMENT = None  # Set by subclasses

    # Flask Core
    SECRET_KEY = environ.get("SECRET_KEY")
    FLASK_DEBUG = _is_truthy(environ.get("FLASK_DEBUG"), False)
    FLASK_APP = "wsgi.py"

    # Static / Templates
    STATIC_FOLDER = "static"
    TEMPLATES_FOLDER = "templates"

    # Session & Security
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Strict"
    SESSION_COOKIE_SECURE = _is_truthy(
            environ.get("COOKIE_SECURE"),
            True
        )
    PERMANENT_SESSION_LIFETIME = timedelta(hours=8)

    # Request limits
    MAX_CONTENT_LENGTH = 1024 * 1024  # 1MB

    # OpenAPI Docs visiibility
    ENABLE_SCALAR = False

    # Security Headers (custom block)
    SECURITY_HEADERS = {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "same-origin",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
        "Cache-Control": "no-store",
        "Content-Security-Policy": (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self'; "
            "font-src 'self'; "
            "img-src 'self'; "
            "connect-src 'self'; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        ),
    }


class DevelopmentConfig(Config):
    """Development configuration."""
    ENVIRONMENT = "development"
    FLASK_DEBUG = True
    ENABLE_SCALAR = True


class StagingConfig(Config):
    """Staging configuration."""
    ENVIRONMENT = "staging"
    FLASK_DEBUG = True
    ENABLE_SCALAR = True


class ProductionConfig(Config):
    """Production configuration."""
    ENVIRONMENT = "production"
    FLASK_DEBUG = False
    ENABLE_SCALAR = False


class Env:
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


config_by_name = {
    Env.DEVELOPMENT: DevelopmentConfig,
    Env.STAGING: StagingConfig,
    Env.PRODUCTION: ProductionConfig,
}
