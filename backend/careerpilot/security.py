from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import current_app, jsonify, request

from .db import get_db


def create_token(user):
    payload = {
        "sub": str(user["id"]),
        "email": user["email"],
        "is_admin": bool(user["is_admin"]),
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm="HS256")


def current_user_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    user = get_db().execute("SELECT * FROM users WHERE id = ?", (payload["sub"],)).fetchone()
    return user


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = current_user_from_token()
        if not user:
            return jsonify({"error": "Authentication required."}), 401
        return fn(user, *args, **kwargs)

    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = current_user_from_token()
        if not user:
            return jsonify({"error": "Authentication required."}), 401
        if not user["is_admin"]:
            return jsonify({"error": "Admin access required."}), 403
        return fn(user, *args, **kwargs)

    return wrapper
