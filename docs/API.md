# CareerPilot AI API

Base URL: `http://localhost:5000/api`

Authenticated endpoints require:

```http
Authorization: Bearer <jwt>
```

## Health

### GET `/health`

Returns service health.

## Authentication

### POST `/auth/signup`

Request:

```json
{
  "name": "Krish",
  "email": "krish@example.com",
  "password": "Password123"
}
```

Response: `201`

```json
{
  "token": "jwt",
  "user": {
    "id": 1,
    "name": "Krish",
    "email": "krish@example.com",
    "isAdmin": false,
    "createdAt": "2026-05-18T10:00:00"
  }
}
```

### POST `/auth/login`

Request:

```json
{
  "email": "admin@careerpilot.ai",
  "password": "Admin@12345"
}
```

### GET `/auth/me`

Returns the current user.

## Roles

### GET `/roles`

Returns supported target roles and required skills.

## Resume Upload

### POST `/resumes/upload`

Content-Type: `multipart/form-data`

Fields:

- `resume`: PDF or DOCX file
- `targetRole`: one of `Data Scientist`, `AI Engineer`, `Machine Learning Engineer`, `Software Engineer`, `Full Stack Developer`

Response includes `resumeId`, parsed contact details, skills, education, experience, projects, certifications, and word count.

## Analysis

### POST `/analysis/analyze`

Request:

```json
{
  "resumeId": 1,
  "targetRole": "Machine Learning Engineer"
}
```

Response includes:

- `analysisId`
- parsed resume fields
- ATS score
- matched and missing skills
- strengths and weaknesses
- 12-week roadmap
- course recommendations
- LinkedIn headline and about suggestions

## Roadmap

### GET `/roadmap/<target_role>?missing=python,mlops`

Returns a 12-week roadmap.

## Courses

### GET `/courses?role=AI Engineer`

Returns free and paid course recommendations.

## Trends

### GET `/trends`

Returns salary and demand time series for dashboard charts.

## AI Mentor

### POST `/chat`

Uses OpenRouter to answer career, resume, interview, project, salary, and roadmap questions. Requires `OPENROUTER_API_KEY`.

Request:

```json
{
  "message": "What project should I build next?",
  "targetRole": "Machine Learning Engineer",
  "history": [
    { "role": "user", "content": "How should I prepare?" },
    { "role": "assistant", "content": "Start with..." }
  ],
  "parsed": {
    "skills": ["python", "react", "sql"]
  },
  "analysis": {
    "atsScore": 72,
    "missingSkills": ["mlops", "pytorch"]
  }
}
```

Response:

```json
{
  "reply": "...",
  "model": "meta-llama/llama-3.1-8b-instruct"
}
```

If the API key is missing:

```json
{
  "error": "OPENROUTER_API_KEY is not configured.",
  "code": "MISSING_OPENROUTER_API_KEY"
}
```

## Local Mentor Fallback

### POST `/mentor/chat`

Request:

```json
{
  "message": "How should I prepare for interviews?",
  "targetRole": "Software Engineer"
}
```

Response:

```json
{
  "reply": "..."
}
```

## LinkedIn

### POST `/linkedin`

Generates a headline and about section from parsed resume and analysis data.

## Report

### GET `/reports/<analysis_id>`

Downloads a PDF report for the authenticated user.

## Admin

### GET `/admin/metrics`

Admin only. Returns total users, uploaded resumes, average ATS score, and popular target roles.
