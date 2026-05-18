import sqlite3
from datetime import datetime
from flask import current_app, g
from werkzeug.security import generate_password_hash


SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    parsed_json TEXT NOT NULL,
    target_role TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    resume_id INTEGER NOT NULL,
    target_role TEXT NOT NULL,
    ats_score INTEGER NOT NULL,
    analysis_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(resume_id) REFERENCES resumes(id)
);
"""


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE_PATH"])
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(_error=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db(app):
    with app.app_context():
        db = sqlite3.connect(app.config["DATABASE_PATH"])
        db.executescript(SCHEMA)
        admin = db.execute("SELECT id FROM users WHERE email = ?", ("admin@careerpilot.ai",)).fetchone()
        if not admin:
            db.execute(
                """
                INSERT INTO users (name, email, password_hash, is_admin, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    "CareerPilot Admin",
                    "admin@careerpilot.ai",
                    generate_password_hash("Admin@12345"),
                    1,
                    datetime.utcnow().isoformat(),
                ),
            )
        db.commit()
        db.close()
    app.teardown_appcontext(close_db)
