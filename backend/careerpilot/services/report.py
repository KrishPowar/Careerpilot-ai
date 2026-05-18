from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def build_pdf_report(parsed, analysis, roadmap, courses):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=48, leftMargin=48, topMargin=48, bottomMargin=48)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("CareerPilot AI Career Analysis", styles["Title"]))
    story.append(Paragraph(f"Candidate: {parsed.get('name', 'Candidate')}", styles["Normal"]))
    story.append(Paragraph(f"Target role: {analysis['targetRole']}", styles["Normal"]))
    story.append(Paragraph(f"ATS score: {analysis['atsScore']}/100", styles["Heading2"]))
    story.append(Spacer(1, 12))

    _section(story, styles, "Strengths", analysis.get("strengths", []))
    _section(story, styles, "Weaknesses", analysis.get("weaknesses", []))
    _section(story, styles, "Matched Skills", analysis.get("matchedSkills", []))
    _section(story, styles, "Missing Skills", analysis.get("missingSkills", []))

    story.append(Paragraph("12-Week Roadmap", styles["Heading2"]))
    roadmap_rows = [["Week", "Focus", "Goal"]]
    for week in roadmap:
        roadmap_rows.append([week["week"], week["focus"], week["goal"]])
    table = Table(roadmap_rows, colWidths=[45, 120, 330])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("Recommended Courses", styles["Heading2"]))
    for course in courses:
        story.append(Paragraph(f"{course['title']} - {course['provider']} ({course['price']})", styles["Normal"]))

    doc.build(story)
    buffer.seek(0)
    return buffer


def _section(story, styles, title, items):
    story.append(Paragraph(title, styles["Heading2"]))
    if not items:
        story.append(Paragraph("None detected.", styles["Normal"]))
    for item in items:
        story.append(Paragraph(f"- {item}", styles["Normal"]))
    story.append(Spacer(1, 8))
