import os

import requests


OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "meta-llama/llama-3.1-8b-instruct"


class OpenRouterConfigError(RuntimeError):
    pass


class OpenRouterAPIError(RuntimeError):
    def __init__(self, message, status_code=502):
        super().__init__(message)
        self.status_code = status_code


def chat_with_mentor(message, target_role=None, history=None, parsed=None, analysis=None):
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    if not api_key or api_key == "your_new_api_key_here":
        raise OpenRouterConfigError("OPENROUTER_API_KEY is not configured.")

    model = os.getenv("OPENROUTER_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL
    messages = _build_messages(message, target_role, history, parsed, analysis)
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.45,
        "max_tokens": 520,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": os.getenv("OPENROUTER_SITE_URL", "http://localhost:5173"),
        "X-Title": os.getenv("OPENROUTER_APP_NAME", "CareerPilot AI"),
    }

    try:
        response = requests.post(OPENROUTER_URL, json=payload, headers=headers, timeout=30)
    except requests.RequestException as exc:
        raise OpenRouterAPIError("Could not reach OpenRouter. Please try again.") from exc

    if response.status_code >= 400:
        raise OpenRouterAPIError(_extract_error(response), status_code=_map_status(response.status_code))

    data = response.json()
    try:
        reply = data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise OpenRouterAPIError("OpenRouter returned an unexpected response.") from exc

    if not reply:
        raise OpenRouterAPIError("OpenRouter returned an empty response.")
    return {"reply": reply, "model": model}


def _build_messages(message, target_role, history, parsed, analysis):
    role_line = f"Target role: {target_role}" if target_role else "Target role: not selected"
    skills = ", ".join((parsed or {}).get("skills", [])[:12])
    missing = ", ".join((analysis or {}).get("missingSkills", [])[:12])
    ats_score = (analysis or {}).get("atsScore")
    context = [
        role_line,
        f"Extracted skills: {skills or 'unknown'}",
        f"Missing skills: {missing or 'unknown'}",
        f"ATS score: {ats_score if ats_score is not None else 'unknown'}",
    ]

    messages = [
        {
            "role": "system",
            "content": (
                "You are CareerPilot AI, a practical career mentor for resume improvement, "
                "interview preparation, skill roadmaps, projects, salary strategy, and LinkedIn positioning. "
                "Give concise, specific, actionable guidance. Do not invent credentials or job history. "
                "When resume context is thin, say what evidence the candidate should add."
            ),
        },
        {"role": "system", "content": "\n".join(context)},
    ]

    for item in (history or [])[-10:]:
        role = item.get("role") or item.get("from")
        content = (item.get("content") or item.get("text") or "").strip()
        if not content:
            continue
        if role == "you":
            role = "user"
        if role == "mentor":
            role = "assistant"
        if role in {"user", "assistant"}:
            messages.append({"role": role, "content": content[:1200]})

    messages.append({"role": "user", "content": message[:2000]})
    return messages


def _extract_error(response):
    try:
        body = response.json()
    except ValueError:
        return f"OpenRouter request failed with status {response.status_code}."

    error = body.get("error")
    if isinstance(error, dict):
        return error.get("message") or error.get("code") or "OpenRouter request failed."
    if isinstance(error, str):
        return error
    return body.get("message") or f"OpenRouter request failed with status {response.status_code}."


def _map_status(status_code):
    if status_code in {401, 403}:
        return 502
    if status_code == 429:
        return 429
    if 400 <= status_code < 500:
        return 400
    return 502
