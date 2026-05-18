from flask import Blueprint, jsonify

from ..db import get_db
from ..security import admin_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.get("/metrics")
@admin_required
def metrics(_user):
    db = get_db()
    total_users = db.execute("SELECT COUNT(*) AS count FROM users").fetchone()["count"]
    uploaded_resumes = db.execute("SELECT COUNT(*) AS count FROM resumes").fetchone()["count"]
    role_rows = db.execute(
        """
        SELECT target_role, COUNT(*) AS count
        FROM analyses
        GROUP BY target_role
        ORDER BY count DESC
        """
    ).fetchall()
    average_score = db.execute("SELECT AVG(ats_score) AS average FROM analyses").fetchone()["average"] or 0
    return jsonify(
        {
            "totalUsers": total_users,
            "uploadedResumes": uploaded_resumes,
            "averageAtsScore": round(average_score, 1),
            "popularRoles": [
                {"role": row["target_role"], "count": row["count"]}
                for row in role_rows
            ],
        }
    )
