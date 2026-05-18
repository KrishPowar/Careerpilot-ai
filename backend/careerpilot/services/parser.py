import re
from pathlib import Path

from docx import Document
from PyPDF2 import PdfReader
try:
    import spacy
    from spacy.matcher import PhraseMatcher
except ImportError:  # pragma: no cover
    spacy = None
    PhraseMatcher = None

from .data import TECHNICAL_SKILLS


if spacy is not None:
    try:
        NLP = spacy.load("en_core_web_sm")
    except OSError:
        NLP = spacy.blank("en")

    MATCHER = PhraseMatcher(NLP.vocab, attr="LOWER")
    MATCHER.add("SKILL", [NLP.make_doc(skill) for skill in TECHNICAL_SKILLS])
else:
    NLP = None
    MATCHER = None


def extract_text(path):
    suffix = Path(path).suffix.lower()
    if suffix == ".pdf":
        reader = PdfReader(path)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if suffix == ".docx":
        document = Document(path)
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    raise ValueError("Unsupported file type. Upload a PDF or DOCX resume.")


def parse_resume(text):
    clean_text = re.sub(r"\n{3,}", "\n\n", text).strip()
    if NLP is not None and MATCHER is not None:
        doc = NLP(clean_text)
        matches = MATCHER(doc)
        skills = sorted({doc[start:end].text.lower() for _, start, end in matches})
    else:
        doc = None
        skills = _fallback_skill_match(clean_text)

    email = _first_match(r"[\w.\-+]+@[\w\-]+\.[\w.\-]+", clean_text)
    phone = _first_match(r"(\+?\d[\d\s().-]{8,}\d)", clean_text)
    name = _extract_name(clean_text, doc)

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "education": _section_lines(clean_text, ["education", "academic"]),
        "experience": _section_lines(clean_text, ["experience", "employment", "work history"]),
        "projects": _section_lines(clean_text, ["projects", "portfolio"]),
        "certifications": _section_lines(clean_text, ["certifications", "certificates"]),
        "summary": _summarize(clean_text),
        "wordCount": len(re.findall(r"\w+", clean_text)),
    }


def _first_match(pattern, text):
    match = re.search(pattern, text, flags=re.IGNORECASE)
    return match.group(0).strip() if match else ""


def _extract_name(text, doc):
    if doc is not None:
        for ent in getattr(doc, "ents", []):
            if ent.label_ == "PERSON" and 2 <= len(ent.text.split()) <= 4:
                return ent.text.strip()
    for line in text.splitlines()[:8]:
        candidate = line.strip()
        if 2 <= len(candidate.split()) <= 4 and not any(char.isdigit() for char in candidate):
            if "@" not in candidate and len(candidate) < 60:
                return candidate
    return "Candidate"


def _fallback_skill_match(text):
    lowered = text.lower()
    matched = set()
    for skill in TECHNICAL_SKILLS:
        token = skill.lower().strip()
        if not token:
            continue

        # Prefer word-boundary matches for single tokens to reduce false positives.
        if re.fullmatch(r"[a-z0-9+.#-]+", token):
            if re.search(rf"\b{re.escape(token)}\b", lowered):
                matched.add(token)
        else:
            if token in lowered:
                matched.add(token)
    return sorted(matched)


def _section_lines(text, headings):
    lines = [line.strip(" -•\t") for line in text.splitlines() if line.strip()]
    collected = []
    capture = False
    heading_pattern = re.compile(r"^[A-Z][A-Za-z\s/&+-]{2,30}:?$")
    for line in lines:
        lowered = line.lower().rstrip(":")
        if any(key in lowered for key in headings):
            capture = True
            continue
        if capture and heading_pattern.match(line) and len(collected) > 0:
            break
        if capture:
            collected.append(line)
        if len(collected) >= 8:
            break
    return collected


def _summarize(text):
    sentences = re.split(r"(?<=[.!?])\s+", text)
    usable = [sentence.strip() for sentence in sentences if 40 <= len(sentence) <= 220]
    return usable[:3]
