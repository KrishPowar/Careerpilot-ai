from .data import TARGET_ROLES


def mentor_reply(message, target_role=None):
    normalized = (message or "").lower()
    role = target_role if target_role in TARGET_ROLES else "your target role"
    if "interview" in normalized:
        return (
            f"For {role} interviews, prepare a tight story for each project: problem, decision, trade-off, metric, and lesson. "
            "Then practice role-specific fundamentals and one system or case-style question daily."
        )
    if "salary" in normalized:
        return (
            "Use salary ranges as negotiation anchors, not fixed truth. Compare location, seniority, company stage, and total compensation, "
            "then prepare a range backed by market data and your strongest project evidence."
        )
    if "project" in normalized:
        return (
            f"Build one portfolio project that mirrors real {role} work: ingest data, make decisions explicit, test the result, deploy or demo it, "
            "and write a concise case study with measurable outcomes."
        )
    if "skill" in normalized or "learn" in normalized:
        skills = TARGET_ROLES.get(target_role, {}).get("skills", [])[:5]
        return f"Prioritize these first: {', '.join(skills)}. Learn by building small artifacts, then combine them into one polished capstone."
    return (
        "Start with the job description, map it to your resume evidence, and close the largest gap first. "
        "A strong weekly loop is: learn, build, document, practice, and revise your resume with measurable proof."
    )
