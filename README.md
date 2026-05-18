# CareerPilot AI

CareerPilot AI is a full-stack resume analyzer and career roadmap generator. It includes JWT authentication, PDF/DOCX resume upload, spaCy-based parsing, scikit-learn scoring support, role skill-gap analysis, roadmap generation, course recommendations, salary/job trend charts, an AI career mentor, LinkedIn optimization suggestions, PDF reports, and an admin dashboard.

## Tech Stack

- Frontend: React, Tailwind CSS, Framer Motion, Chart.js
- Backend: Python Flask REST API
- NLP: spaCy
- ML: scikit-learn
- Database: SQLite
- PDF generation: ReportLab
- Deployment: Docker and docker-compose

## Project Structure

```text
backend/
  app.py
  careerpilot/
    routes/
    services/
  requirements.txt
frontend/
  src/
  package.json
docs/
  API.md
sample_data/
docker-compose.yml
```

## Local Development

### Backend

Use Python 3.11 or 3.12. Python 3.14 is not recommended yet because spaCy and scikit-learn may not provide compatible wheels.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
copy .env.example .env
python app.py
```

The API runs at `http://localhost:5000/api`.

OpenRouter mentor chat requires these backend environment variables:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct
OPENROUTER_SITE_URL=http://localhost:5173
OPENROUTER_APP_NAME=CareerPilot AI
JWT_SECRET_KEY=change-me-too
```

If `OPENROUTER_API_KEY` is missing or still set to the placeholder value, `POST /api/chat` returns a `503` with code `MISSING_OPENROUTER_API_KEY`.

Default admin account:

- Email: `admin@careerpilot.ai`
- Password: `Admin@12345`

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The web app runs at `http://localhost:5173`.

## Docker

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000/api`

## Notes

- Uploads accept `.pdf` and `.docx` files up to 8 MB.
- The app uses deterministic mentor responses and local analysis logic so it can run without a paid LLM API.
- The primary AI mentor endpoint uses OpenRouter at `POST /api/chat`. The older deterministic `/api/mentor/chat` endpoint is kept as a local fallback/demo route.
- For production, set strong `SECRET_KEY` and `JWT_SECRET_KEY`, configure HTTPS, back up SQLite or move to Postgres, and serve uploads from durable storage.
- On Windows OneDrive folders, if SQLite or Python bytecode writes are blocked by sync permissions, set `DATABASE_PATH` and `UPLOAD_FOLDER` to a normal local application-data directory.

## API Documentation

See [docs/API.md](docs/API.md).
