from .data import COURSES, TARGET_ROLES


def generate_roadmap(target_role, missing_skills=None):
    role_skills = TARGET_ROLES[target_role]["skills"]
    priority = list(dict.fromkeys((missing_skills or []) + role_skills))
    weeks = []
    for index in range(12):
        skill = priority[index % len(priority)]
        weeks.append(
            {
                "week": index + 1,
                "focus": skill.title(),
                "goal": f"Build practical confidence with {skill} for {target_role} roles.",
                "milestones": [
                    f"Complete one focused module or tutorial on {skill}.",
                    "Add one measurable bullet or project artifact to your portfolio.",
                    "Practice two interview questions tied to this topic.",
                ],
            }
        )
    return weeks


def course_recommendations(target_role):
    return COURSES[target_role]


def linkedin_suggestions(parsed, target_role, analysis):
    skills = analysis.get("matchedSkills", [])[:4] or parsed.get("skills", [])[:4]
    skill_phrase = ", ".join(skill.title() for skill in skills) or "modern engineering"
    headline = f"{target_role} Candidate | {skill_phrase} | Building measurable product impact"
    about = (
        f"I am a {target_role} focused on turning technical skill into practical outcomes. "
        f"My background includes {skill_phrase}, with projects that demonstrate structured problem solving, "
        "clear communication, and continuous learning. I am currently strengthening my portfolio around "
        f"{target_role.lower()} workflows and preparing for roles where I can contribute to high-quality, data-informed products."
    )
    return {"headline": headline, "about": about}
