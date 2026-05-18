import re
from datetime import datetime

from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from ..db import get_db
from ..security import create_token, login_required

auth_bp = Blueprint("auth", __name__)


EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def serialize_user(user):
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "isAdmin": bool(user["is_admin"]),
        "createdAt": user["created_at"],
    }


@auth_bp.post("/signup")
def signup():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if len(name) < 2:
        return jsonify({"error": "Name must be at least 2 characters."}), 400
    if not EMAIL_PATTERN.match(email):
        return jsonify({"error": "Valid email is required."}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400

    db = get_db()
    try:
        db.execute(
            """
            INSERT INTO users (name, email, password_hash, is_admin, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (name, email, generate_password_hash(password), 0, datetime.utcnow().isoformat()),
        )
        db.commit()
    except Exception:
        return jsonify({"error": "An account with this email already exists."}), 409

    user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    return jsonify({"token": create_token(user), "user": serialize_user(user)}), 201


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    user = get_db().execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password."}), 401
    return jsonify({"token": create_token(user), "user": serialize_user(user)})


@auth_bp.get("/me")
@login_required
def me(user):
    return jsonify({"user": serialize_user(user)})
