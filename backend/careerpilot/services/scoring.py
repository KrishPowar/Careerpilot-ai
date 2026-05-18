import re

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:  # pragma: no cover
    TfidfVectorizer = None
    cosine_similarity = None

from .data import TARGET_ROLES


def analyze_resume(parsed, target_role):
    role = TARGET_ROLES[target_role]
    extracted = set(parsed.get("skills", []))
    required = set(role["skills"])
    matched = sorted(extracted & required)
    missing = sorted(required - extracted)

    section_score = _score_sections(parsed)
    contact_score = 10 if parsed.get("email") and parsed.get("phone") else 5 if parsed.get("email") else 0
    skill_score = round((len(matched) / max(len(required), 1)) * 45)
    depth_score = _score_depth(parsed)
    semantic_score = _semantic_similarity(parsed, role["skills"])
    ats_score = min(100, round(section_score + contact_score + skill_score + depth_score + semantic_score))

    strengths = []
    if contact_score >= 10:
        strengths.append("Clear contact information is present.")
    if parsed.get("experience"):
        strengths.append("Experience section is detectable and structured.")
    if len(matched) >= 4:
        strengths.append(f"Strong alignment with {target_role} skills: {', '.join(matched[:6])}.")
    if parsed.get("projects"):
        strengths.append("Project evidence gives recruiters proof of applied work.")

    weaknesses = []
    if missing:
        weaknesses.append(f"Missing role-critical skills: {', '.join(missing[:6])}.")
    if not parsed.get("projects"):
        weaknesses.append("Projects section is thin or missing.")
    if parsed.get("wordCount", 0) < 350:
        weaknesses.append("Resume appears short; add measurable achievements and impact.")
    if not parsed.get("education"):
        weaknesses.append("Education section was not clearly detected.")

    return {
        "atsScore": ats_score,
        "targetRole": target_role,
        "matchedSkills": matched,
        "missingSkills": missing,
        "strengths": strengths or ["Resume has a readable structure and enough text for analysis."],
        "weaknesses": weaknesses or ["No major structural gaps detected. Focus on quantified impact."],
        "sectionScore": section_score,
        "skillScore": skill_score,
        "semanticScore": semantic_score,
        "recommendation": _recommendation(ats_score),
    }


def _score_sections(parsed):
    score = 0
    for section in ["skills", "education", "experience", "projects"]:
        if parsed.get(section):
            score += 8
    return score


def _score_depth(parsed):
    word_count = parsed.get("wordCount", 0)
    if word_count >= 650:
        return 8
    if word_count >= 350:
        return 5
    return 2


def _semantic_similarity(parsed, required_skills):
    resume_doc = " ".join(parsed.get("summary", [])) + " " + " ".join(parsed.get("skills", []))
    role_doc = " ".join(required_skills)
    if not resume_doc.strip():
        return 0
    if TfidfVectorizer is not None and cosine_similarity is not None:
        vectorizer = TfidfVectorizer(stop_words="english")
        matrix = vectorizer.fit_transform([resume_doc, role_doc])
        return round(float(cosine_similarity(matrix[0], matrix[1])[0][0]) * 5)
    return _fallback_similarity(resume_doc, role_doc)


def _fallback_similarity(resume_doc, role_doc):
    resume_tokens = set(re.findall(r"[a-z0-9+#.-]+", resume_doc.lower()))
    role_tokens = set(re.findall(r"[a-z0-9+#.-]+", role_doc.lower()))
    if not resume_tokens or not role_tokens:
        return 0
    jaccard = len(resume_tokens & role_tokens) / max(len(resume_tokens | role_tokens), 1)
    return round(jaccard * 5)


def _recommendation(score):
    if score >= 85:
        return "Interview-ready. Fine-tune keywords for each job description."
    if score >= 70:
        return "Competitive. Add missing role skills and quantify more achievements."
    if score >= 50:
        return "Promising foundation. Strengthen projects, keywords, and measurable outcomes."
    return "Needs focused revision before applying to competitive roles."
