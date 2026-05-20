import os
import re
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from .db import init_db
from .routes.auth import auth_bp
from .routes.analysis import analysis_bp
from .routes.admin import admin_bp


def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.from_mapping(
        SECRET_KEY=os.getenv("SECRET_KEY", "dev-secret"),
        JWT_SECRET=os.getenv("JWT_SECRET") or os.getenv("JWT_SECRET_KEY", "dev-jwt-secret"),
        DATABASE_PATH=os.getenv("DATABASE_PATH", os.path.join(os.getcwd(), "careerpilot.db")),
        UPLOAD_FOLDER=os.getenv("UPLOAD_FOLDER", os.path.join(os.getcwd(), "uploads")),
        MAX_CONTENT_LENGTH=8 * 1024 * 1024,
    )
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    CORS(
        app,
        resources={r"/api/*": {"origins": _cors_origins()}},
        supports_credentials=True,
    )
    init_db(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(analysis_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.get("/health")
    def health_root():
        return jsonify({"status": "ok"})

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "CareerPilot AI"})

    @app.errorhandler(413)
    def file_too_large(_error):
        return jsonify({"error": "File is too large. Maximum upload size is 8 MB."}), 413

    @app.errorhandler(404)
    def not_found(_error):
        return jsonify({"error": "Endpoint not found."}), 404

    @app.errorhandler(500)
    def server_error(error):
        app.logger.exception(error)
        return jsonify({"error": "Unexpected server error."}), 500

    return app


def _cors_origins():
    configured = os.getenv("FRONTEND_ORIGINS") or os.getenv("FRONTEND_ORIGIN")
    frontend_url = (os.getenv("FRONTEND_URL") or "").strip()
    if configured:
        origins = []
        for item in configured.split(","):
            value = item.strip()
            if not value:
                continue
            if value.startswith("re:"):
                pattern = value.removeprefix("re:").strip()
                if pattern:
                    origins.append(re.compile(pattern))
            else:
                origins.append(value)
        return origins
    if frontend_url:
        return [frontend_url]
    if os.getenv("FLASK_ENV") == "production":
        # In production you should explicitly set FRONTEND_URL or FRONTEND_ORIGINS.
        return []
    return [
        re.compile(r"^http://localhost:\d+$"),
        re.compile(r"^http://127\.0\.0\.1:\d+$"),
        re.compile(r"^http://192\.168\.\d+\.\d+:\d+$"),
    ]
