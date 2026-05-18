import json
import os
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request, send_file
from werkzeug.utils import secure_filename

from ..db import get_db
from ..security import login_required
from ..services.chatbot import mentor_reply
from ..services.data import TARGET_ROLES
from ..services.parser import extract_text, parse_resume
from ..services.report import build_pdf_report
from ..services.roadmap import course_recommendations, generate_roadmap, linkedin_suggestions
from ..services.scoring import analyze_resume
from services.openrouter_client import OpenRouterAPIError, OpenRouterConfigError, chat_with_mentor

analysis_bp = Blueprint("analysis", __name__)

ALLOWED_EXTENSIONS = {".pdf", ".docx"}


@analysis_bp.get("/roles")
def roles():
    return jsonify(
        {
            "roles": [
                {"name": name, "requiredSkills": data["skills"]}
                for name, data in TARGET_ROLES.items()
            ]
        }
    )


@analysis_bp.post("/resumes/upload")
@login_required
def upload_resume(user):
    if "resume" not in request.files:
        return jsonify({"error": "Resume file is required."}), 400
    file = request.files["resume"]
    target_role = request.form.get("targetRole") or "Data Scientist"
    if target_role not in TARGET_ROLES:
        return jsonify({"error": "Invalid target role."}), 400
    if not file.filename:
        return jsonify({"error": "Filename is required."}), 400

    original = secure_filename(file.filename)
    extension = os.path.splitext(original)[1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        return jsonify({"error": "Only PDF and DOCX resumes are supported."}), 400

    stored_name = f"{user['id']}_{int(datetime.utcnow().timestamp())}_{original}"
    path = os.path.join(current_app.config["UPLOAD_FOLDER"], stored_name)
    file.save(path)

    try:
        raw_text = extract_text(path)
        if len(raw_text.strip()) < 80:
            return jsonify({"error": "Could not extract enough text from this resume."}), 422
        parsed = parse_resume(raw_text)
    except Exception as exc:
        current_app.logger.exception(exc)
        return jsonify({"error": str(exc)}), 422

    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO resumes (user_id, filename, original_filename, raw_text, parsed_json, target_role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user["id"],
            stored_name,
            original,
            raw_text,
            json.dumps(parsed),
            target_role,
            datetime.utcnow().isoformat(),
        ),
    )
    db.commit()

    return jsonify({"resumeId": cursor.lastrowid, "parsed": parsed, "targetRole": target_role}), 201


@analysis_bp.post("/analysis/analyze")
@login_required
def analyze(user):
    payload = request.get_json(silent=True) or {}
    resume_id = payload.get("resumeId")
    target_role = payload.get("targetRole")
    if target_role not in TARGET_ROLES:
        return jsonify({"error": "Valid target role is required."}), 400

    db = get_db()
    resume = db.execute(
        "SELECT * FROM resumes WHERE id = ? AND user_id = ?",
        (resume_id, user["id"]),
    ).fetchone()
    if not resume:
        return jsonify({"error": "Resume not found."}), 404

    parsed = json.loads(resume["parsed_json"])
    analysis = analyze_resume(parsed, target_role)
    roadmap = generate_roadmap(target_role, analysis["missingSkills"])
    courses = course_recommendations(target_role)
    linkedin = linkedin_suggestions(parsed, target_role, analysis)
    result = {
        "parsed": parsed,
        "analysis": analysis,
        "roadmap": roadmap,
        "courses": courses,
        "linkedin": linkedin,
    }
    cursor = db.execute(
        """
        INSERT INTO analyses (user_id, resume_id, target_role, ats_score, analysis_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            user["id"],
            resume_id,
            target_role,
            analysis["atsScore"],
            json.dumps(result),
            datetime.utcnow().isoformat(),
        ),
    )
    db.commit()
    result["analysisId"] = cursor.lastrowid
    return jsonify(result)


@analysis_bp.get("/roadmap/<target_role>")
@login_required
def roadmap(_user, target_role):
    if target_role not in TARGET_ROLES:
        return jsonify({"error": "Invalid target role."}), 400
    missing = [skill for skill in request.args.get("missing", "").split(",") if skill]
    return jsonify({"roadmap": generate_roadmap(target_role, missing)})


@analysis_bp.get("/courses")
@login_required
def courses(_user):
    target_role = request.args.get("role", "Data Scientist")
    if target_role not in TARGET_ROLES:
        return jsonify({"error": "Invalid target role."}), 400
    return jsonify({"courses": course_recommendations(target_role)})


@analysis_bp.get("/trends")
@login_required
def trends(_user):
    return jsonify(
        {
            "labels": ["2023", "2024", "2025", "2026"],
            "roles": [
                {
                    "name": name,
                    "salary": data["salary"],
                    "demand": data["demand"],
                }
                for name, data in TARGET_ROLES.items()
            ],
        }
    )


@analysis_bp.post("/mentor/chat")
@login_required
def mentor(_user):
    payload = request.get_json(silent=True) or {}
    message = (payload.get("message") or "").strip()
    target_role = payload.get("targetRole")
    if not message:
        return jsonify({"error": "Message is required."}), 400
    return jsonify({"reply": mentor_reply(message, target_role)})


@analysis_bp.post("/chat")
@login_required
def chat(_user):
    payload = request.get_json(silent=True) or {}
    message = (payload.get("message") or "").strip()
    target_role = payload.get("targetRole")
    if not message:
        return jsonify({"error": "Message is required."}), 400
    if target_role and target_role not in TARGET_ROLES:
        return jsonify({"error": "Invalid target role."}), 400

    try:
        result = chat_with_mentor(
            message=message,
            target_role=target_role,
            history=payload.get("history") or [],
            parsed=payload.get("parsed") or {},
            analysis=payload.get("analysis") or {},
        )
    except OpenRouterConfigError as exc:
        return jsonify({"error": str(exc), "code": "MISSING_OPENROUTER_API_KEY"}), 503
    except OpenRouterAPIError as exc:
        current_app.logger.warning("OpenRouter chat failed: %s", exc)
        return jsonify({"error": str(exc), "code": "OPENROUTER_REQUEST_FAILED"}), exc.status_code

    return jsonify(result)


@analysis_bp.post("/linkedin")
@login_required
def linkedin(_user):
    payload = request.get_json(silent=True) or {}
    parsed = payload.get("parsed") or {}
    analysis = payload.get("analysis") or {}
    target_role = payload.get("targetRole")
    if target_role not in TARGET_ROLES:
        return jsonify({"error": "Invalid target role."}), 400
    return jsonify(linkedin_suggestions(parsed, target_role, analysis))


@analysis_bp.get("/reports/<int:analysis_id>")
@login_required
def report(user, analysis_id):
    row = get_db().execute(
        "SELECT * FROM analyses WHERE id = ? AND user_id = ?",
        (analysis_id, user["id"]),
    ).fetchone()
    if not row:
        return jsonify({"error": "Analysis not found."}), 404
    data = json.loads(row["analysis_json"])
    pdf = build_pdf_report(data["parsed"], data["analysis"], data["roadmap"], data["courses"])
    return send_file(
        pdf,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"careerpilot-analysis-{analysis_id}.pdf",
    )
