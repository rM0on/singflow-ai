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

Phase 0 initializes the project skeleton. Phase 1 adds a frontend-only static prototype with mock data. The project still does not implement playlist generation, taste fusion, feedback memory, or Agent Console backend business logic.

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

### Phase 1 Prototype Routes

The current frontend prototype is static and uses mock data only:

| Page | Route | Purpose |
| --- | --- | --- |
| Studio Home | `/` | Studio-first hero surface, scene prompt composer, playlist preview, Agent preview |
| AI Session Planner | `/planner` | Natural language scene input, constraint chips, mock generation state |
| Playlist Timeline | `/timeline` | Full KTV session timeline with fictional song metadata and reasons |
| Demo Session Alias | `/sessions/demo` | Portfolio-friendly session route using the same timeline surface |
| Group Taste Mixer | `/mixer` | Demo member preferences, group fusion chart, conflicts and compromises |
| Agent Console Preview | `/agent-runs/demo` | Mock tool-call timeline with sanitized input and output summaries |
| Dashboard / Feedback Memory | `/dashboard` | Mock feedback, taste evolution, and Agent performance charts |

No Phase 1 page calls a real backend API, LLM provider, database, or Agent service.

## Screenshots

Phase 1.2 prepares the frontend for README and portfolio screenshots. Add captured images to a future `docs/screenshots/` directory after visual approval.

Recommended screenshot set:

| Screenshot | Route | Suggested Use |
| --- | --- | --- |
| Studio Home | `/` | README first hero image and portfolio cover |
| Planner | `/planner` | AI command planning and constraint preview |
| Timeline | `/timeline` | Music workflow, energy curve, and recommendation reasons |
| Mixer | `/mixer` | Group preference fusion and compromise matrix |
| Agent Console | `/agent-runs/demo` | Tool-call trace with safe summaries |
| Dashboard | `/dashboard` | Feedback memory and product insight loop |

Current screenshot status:

- Static mock prototype only.
- Fictional song metadata and CSS-only abstract cover visuals.
- No real lyrics, audio, MV, album cover, brand logo, scraped data, or external AI call.

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
- Phase 1 frontend typecheck succeeded after adding the static prototype and `lucide-react`.
- `python -m pip show pytest` partially reported pytest installation information before the shell timed out.

Known dependency notes:

- Local Node.js still reports the documented engine warning until the machine is upgraded to Node.js 22+.
- `npm install` currently reports two moderate npm audit findings in transitive frontend dependencies. Do not run `npm audit fix --force` without owner review because it can introduce breaking dependency changes.

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
- Git initialization and Phase 0 checkpoint commit after owner approval.

Environment and verification status:

- Local frontend dependency install and typecheck have been verified.
- Local backend pytest execution is blocked by the current Windows / PowerShell / Anaconda shell behavior described above.
- Git initialization was performed only after owner approval. Future Git history changes still require explicit owner direction.

Not implemented in Phase 0:

- Business database tables.
- Song catalog APIs.
- Playlist generation.
- Multi-person preference fusion.
- Feedback memory.
- Agent Console real logic.

## Current Phase 1 Static Prototype Status

Completed:

- Studio Home with portfolio-grade Hero Studio visual, scene prompt composer, scene entries, playlist preview, and mock Agent preview.
- AI Session Planner with natural language prompt input, constraint chips, energy curve controls, mock loading state, and generated flow structure.
- Playlist Timeline and `/sessions/demo` alias with Warmup, Build-up, Peak, Nostalgic, and Finale phases.
- Group Taste Mixer with demo members, language and difficulty preferences, radar chart, and compromise notes.
- Agent Console Preview with the required mock tool sequence and sanitized summaries only.
- Dashboard / Feedback Memory with mock metrics, feedback distribution, taste evolution, and Agent performance charts.
- Shared mock data in `apps/web/lib/mock-data.ts`.
- Shared frontend state in `apps/web/lib/studio-store.ts`.
- Empty, loading, hover, and responsive layout states across the six screenshot-grade pages.

Phase 1.1 visual polish:

- Studio Home has a more portfolio-ready Hero Studio composition, command-style prompt surface, music cover grid, and workflow-focused Agent preview.
- App shell, sidebar active states, typography rhythm, status badges, and global dark surfaces were refined to feel closer to a premium AI music workstation.
- Playlist Timeline now emphasizes phase rail, energy curve, sticky session inspector, and music-first song cards.
- Group Taste Mixer, Agent Console, and Dashboard were adjusted away from generic dashboard/table patterns toward product-specific fusion, trace, and memory surfaces.
- Cover placeholders remain CSS-only original abstract visuals; no real cover art, lyrics, audio, MV, or brand assets are included.

Phase 1 boundaries:

- No real FastAPI business routes were added.
- No database tables, Alembic business migrations, LLM calls, API keys, lyrics, audio, MV files, real album covers, or brand assets were added.
- The prototype is designed for screenshot review before any Git commit for Phase 1.

## Current Phase 2A Backend Foundation Status

Completed:

- SQLAlchemy model definitions for the Phase 2 core business tables.
- Alembic migration scaffold for the Phase 2 core database schema.
- Pydantic schema modules for future typed API routers.

Phase 2A boundaries:

- Existing `/health` and `/api/v1/health` routes remain the only active API routes.
- No repositories, services, business routers, seed data, real LLM provider integration, recommendation algorithm, frontend visual changes, lyrics, audio, MV links, real album covers, copied brand assets, or unauthorized media assets were added.

## Current Phase 2B Backend Foundation Status

Completed:

- Repository and service foundation modules for Phase 2 backend workflows.
- Lightweight business error classes, metadata safety helpers, and pagination helpers.
- Deterministic mock-only service foundations for playlist persistence, taste fusion, feedback logging, agent runs, and dashboard aggregates.

Phase 2B boundaries:

- No business API routers, seed data, real LLM provider integration, real recommendation algorithm, frontend visual changes, lyrics, audio, MV links, real album covers, copied brand assets, or unauthorized media assets were added.
- `pytest` remains blocked in the current unstable local shell and should not be run here.

## Phase 2C-1 API Wiring Checkpoint Status

Completed:

- Basic FastAPI routers for songs, demo users, taste profiles, karaoke sessions, group members, and deterministic mock taste fusion.
- Lightweight API dependency and error-envelope helpers.

Phase 2C-1 boundaries:

- At the Phase 2C-1 checkpoint, playlist, feedback, Agent Run, and dashboard routers were still pending for Phase 2C-2.
- `GET /users/{user_id}/feedback-summary` currently supports range aggregation only; `scene_type` filtering remains pending until the feedback/dashboard service expansion.
- No seed data, real LLM provider integration, frontend visual changes, lyrics, audio, MV links, real album covers, copied brand assets, or unauthorized media assets were added.
- `pytest` remains blocked in the current unstable local shell and should not be run here.

## Current Phase 2C-2 API Wiring Status

Completed:

- FastAPI routers for playlists, feedback logs, Agent Runs, and dashboard aggregates.
- `POST /playlists/generate` remains deterministic mock-only and may return a structured fallback error until Phase 2D seed data exists.
- Dashboard `range` is accepted for API shape, but Phase 2C-2 still uses basic database-wide aggregates without complex time filtering.

Phase 2C-2 boundaries:

- No seed data, real LLM provider integration, real recommendation algorithm, real Agent workflow execution, frontend visual changes, lyrics, audio, MV links, real album covers, copied brand assets, or unauthorized media assets were added.
- `pytest` remains blocked in the current unstable local shell and should not be run here.
