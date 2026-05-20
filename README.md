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

Recommended: Python 3.11 or 3.12.

Python 3.14 can run the backend too, but some optional NLP/ML dependencies (spaCy / scikit-learn) may be skipped if wheels are not available yet; the app will fall back to simpler logic in those cases.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
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

Configure the frontend to point at the backend using:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Notes:

- `VITE_API_BASE_URL` should NOT include `/api` (the app appends it internally).
- `VITE_API_URL` is still accepted for backward compatibility.

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

## Production Deployment (Render + Vercel)

This repo includes:

- Render Blueprint: [render.yaml](render.yaml)
- Vercel SPA routing: [frontend/vercel.json](frontend/vercel.json)

### Backend on Render (Flask API)

- Create a new **Web Service** from this repo (or use the Blueprint).
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn --bind 0.0.0.0:$PORT wsgi:app`
- Health check path: `/api/health`

Render environment variables (minimum):

- `JWT_SECRET_KEY` (required)
- `OPENROUTER_API_KEY` (required for AI chat)
- `FRONTEND_URL` (your Vercel URL, required for CORS)

Optional:

- `FRONTEND_ORIGINS` (comma-separated allowlist, e.g. `https://yourapp.vercel.app,https://yourdomain.com`)

You can also include regex entries by prefixing with `re:`. Example:

- `FRONTEND_ORIGINS` = `re:^https://careerpilot-.*\\.vercel\\.app$,https://careerpilot-7hdxi6kqu-krishpowars-projects.vercel.app`

### Frontend on Vercel (React/Vite)

- Import the repo into Vercel
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Vercel environment variables:

- `VITE_API_BASE_URL` = `https://<your-render-service>.onrender.com` (used for local dev and optional for direct calls)

By default, in production the frontend uses the same-origin `/api/*` proxy (recommended).

Recommended (avoids browser CORS issues):

- `CAREERPILOT_BACKEND_URL` = `https://<your-render-service>.onrender.com`

This repo includes a Vercel serverless proxy at `frontend/api/[...path].js`. In production, the frontend calls same-origin `/api/*` by default, and Vercel forwards those requests to `CAREERPILOT_BACKEND_URL`.

If you want the browser to call Render directly (not recommended), set:

- `VITE_FORCE_DIRECT_API` = `true`

And ensure Render CORS allows your Vercel domain via `FRONTEND_URL` / `FRONTEND_ORIGINS`.

After both are deployed:

- Confirm backend CORS allows your Vercel domain (`FRONTEND_URL` / `FRONTEND_ORIGINS`).
- Confirm API is reachable: `GET https://<render>.onrender.com/health` and `GET https://<render>.onrender.com/api/health`.

If your Vercel URL shows `401 Unauthorized` or redirects to a Vercel login page, disable Vercel **Deployment Protection** (or make the deployment public) so end users can access the site.
