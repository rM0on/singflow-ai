# SingFlow AI

SingFlow AI is an **AI Native Karaoke & Music Workflow Studio** for KTV, in-car entertainment, and home music scenarios.

It is designed as a flagship portfolio project for scene playlist planning, group preference orchestration, recommendation reasoning, feedback memory, and future Agent workflow visualization.

## Features Planned

- Natural language music scene planning.
- Licensed or fictional metadata-only song catalog search.
- Multi-person taste profile fusion.
- Scene playlist generation with recommendation reasons.
- Feedback logs and preference memory.
- Agent Run and Agent Step visualization.
- Dashboard for sessions, feedback, and workflow health.
- Docker Compose local demo with web, API, PostgreSQL, and Redis.

Phase 0 only initializes the project skeleton. It does not implement playlist generation, taste fusion, feedback memory, or Agent Console business logic.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui structure |
| Frontend libraries | Framer Motion, Recharts, TanStack Table, TanStack Query, Zustand |
| Backend | FastAPI, Pydantic, SQLAlchemy |
| Database | PostgreSQL |
| Cache | Redis |
| Migrations | Alembic |
| Testing | pytest, TypeScript typecheck |
| DevOps | Docker Compose, GitHub Actions |

## Project Structure

```text
singflow-ai/
  apps/
    web/                 # Next.js App Router frontend
    api/                 # FastAPI backend
  docs/                  # Product, design, architecture, API, schema, roadmap
  packages/              # Future shared packages
  .github/workflows/     # CI workflows
  AGENTS.md              # Required Codex development rules
  docker-compose.yml
  .env.example
  README.md
  LICENSE
```

## Local Development

### Prerequisites

- Node.js 22+
- npm 10+
- Python 3.12+
- Docker Desktop, if using Docker Compose

### Install Frontend Dependencies

```bash
npm install
```

### Run Frontend

```bash
npm run dev:web
```

Frontend URL:

```text
http://localhost:3000
```

### Install Backend Dependencies

From the repository root:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r apps/api/requirements.txt
```

On macOS/Linux, activate with:

```bash
source .venv/bin/activate
```

### Run Backend

```bash
npm run dev:api
```

Backend URLs:

```text
http://localhost:8000/health
http://localhost:8000/api/v1/health
http://localhost:8000/docs
```

## Docker Compose

Copy the root environment example if you want local overrides:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Start the full local stack:

```bash
docker compose up --build
```

Expected services:

- Web: `http://localhost:3000`
- API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Environment Variables

Root `.env.example` provides shared local defaults.

| Variable | Purpose |
| --- | --- |
| `APP_ENV` | Local, demo, or production environment label |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `LLM_PROVIDER` | Defaults to `mock` |
| `OPENAI_API_KEY` | Placeholder only; never commit real keys |
| `NEXT_PUBLIC_API_BASE_URL` | API base URL for the frontend |

App-specific examples also exist:

- `apps/web/.env.example`
- `apps/api/.env.example`

## Testing

Frontend typecheck:

```bash
npm run typecheck:web
```

Backend tests should be retried later from a clean Python 3.12 virtual environment:

```bash
pip install -r apps/api/requirements.txt
python -m pytest
```

Run both from the root after dependencies are installed and the local Python environment is healthy:

```bash
npm run test
```

### Current Local Verification Notes

The Phase 0 source files were generated successfully, but the current local shell has environment-specific test limitations:

- Current local Node.js is `v20.13.1`; the project target is Node.js `22+`.
- Current local Python is `3.9.13` from Anaconda; the project target is Python `3.12+`.
- `pytest` commands hang in the current Windows / PowerShell / Anaconda shell.
- Backend tests should be retried later in a clean Python 3.12 virtual environment with `python -m pytest`.
- CI is configured to validate in a clean environment with Node.js 22 and Python 3.12.

Verified locally:

- `npm install` succeeded with an engine warning because local Node.js is older than the project target.
- `npm run typecheck:web` succeeded.
- `python -m pip show pytest` partially reported pytest installation information before the shell timed out.

Temporarily do not run in the current shell:

```bash
pytest --version
python -m pytest --version
pytest
```

Recommended clean verification path:

```bash
nvm use 22
npm install
npm run typecheck:web
```

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r apps/api/requirements.txt
python -m pytest
```

Then verify the full stack:

```bash
docker compose up --build
```

## Phase Roadmap

- Phase 0: Project initialization and minimum runnable skeleton.
- Phase 1: Screenshot-grade frontend static prototype with mock data.
- Phase 2: Backend, database schema, Redis, migrations, and seed data.
- Phase 3: AI playlist generation workflow.
- Phase 4: Multi-person taste fusion.
- Phase 5: Agent Console.
- Phase 6: Feedback memory loop.
- Phase 7: GitHub open-source packaging and deployment polish.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full plan.

## Copyright / Content Safety Notice

This repository must not include copyrighted lyrics, audio files, karaoke backing tracks, music videos, unauthorized album art, pirated links, brand logos, or scraped music-platform assets.

Demo content must use fictional song titles, fictional artist names, and metadata-only records unless a future licensed source is explicitly documented.

## Current Phase 0 Status

Completed:

- Monorepo directories: `apps/web`, `apps/api`, `packages`.
- Minimal Next.js App Router frontend.
- Tailwind CSS and shadcn/ui-compatible structure.
- Frontend dependency declarations for Framer Motion, Recharts, TanStack Table, TanStack Query, and Zustand.
- Minimal FastAPI backend with `/health` and `/api/v1/health`.
- Pydantic settings, SQLAlchemy session structure, Redis client structure.
- Alembic scaffold with no business tables yet.
- pytest health checks.
- Docker Compose services for web, API, PostgreSQL, and Redis.
- GitHub Actions workflow for frontend typecheck and backend pytest.
- MIT License.

Environment and verification status:

- Local frontend dependency install and typecheck have been verified.
- Local backend pytest execution is blocked by the current Windows / PowerShell / Anaconda shell behavior described above.
- Git initialization has not been performed. According to `docs/ROADMAP.md` and `AGENTS.md`, Git initialization requires owner approval and must not modify existing Git history.

Not implemented in Phase 0:

- Business database tables.
- Song catalog APIs.
- Playlist generation.
- Multi-person preference fusion.
- Feedback memory.
- Agent Console real logic.
