# SingFlow AI Demo Data

This document describes the Phase 2D demo database bootstrap for the SingFlow AI backend.

The bootstrap is designed for local Docker/PostgreSQL verification and portfolio-safe API demos. It uses deterministic mock metadata only.

## Demo Data Goals

- Create 96 fictional songs for the demo catalog.
- Create 6 fictional demo users with taste profiles.
- Create 3 karaoke sessions covering `ktv`, `car`, and `home_party`.
- Create group members, generated playlists, playlist items, recommendation reasons, feedback logs, Agent Runs, and Agent Steps.
- Keep the full flow database-backed while staying in `LLM_PROVIDER=mock`.

## Song Coverage

The song catalog is generated from `apps/api/app/data/demo_songs.py`.

Coverage:

- Languages: `en`, `zh`, `cantonese`, `mixed`
- Scene tags: `ktv`, `car`, `home_party`, `warmup`, `chorus`, `nostalgic`, `high_energy`, `late_night`
- Metadata: genres, moods, scene tags, energy, danceability, vocal difficulty, popularity, duration, BPM, release year, and abstract cover visual seeds
- Rights: `source_type=mock`, `rights_status=demo_safe`

`cover_visual_seed` is only an abstract CSS/display seed. It is not an image URL.

## Demo Graph

The bootstrap creates:

- 96 fictional songs
- 6 fictional users
- 12 taste profiles
- 3 karaoke sessions
- 11 group members
- 2 generated playlists
- 15 playlist items
- 15 recommendation reasons
- 13 feedback logs
- 3 Agent Runs, including 1 failed mock run for dashboard recent failure inspection
- 17 Agent Steps with sanitized summaries only

## Safety Boundary

The demo data does not include lyrics, audio files, karaoke backing tracks, MV files, external music-platform links, commercial album art, copied brand assets, or scraped platform data.

All recommendation reasons are original explanatory text. Agent summaries are safe input/output summaries and do not include hidden reasoning traces.

The bootstrap does not call external APIs and does not call an LLM provider.

## Dry Run

From inside the API container or from a local backend environment with dependencies installed:

```bash
python -m app.scripts.bootstrap_demo_data --dry-run
```

The dry run does not connect to the database and does not write records. It checks:

- song count
- language coverage
- scene tag coverage
- forbidden metadata keys
- planned users, sessions, playlists, feedback logs, Agent Runs, and Agent Steps

## Bootstrap

Run after PostgreSQL is available and Alembic migrations have been applied:

```bash
python -m app.scripts.bootstrap_demo_data
```

The script is idempotent. It uses stable natural keys such as song title plus artist display name, user display name plus avatar seed, session title plus scene type, and seeded Agent Run objectives.

There is intentionally no reset flag in Phase 2D.

## Docker Verification

From the repository root:

```bash
docker compose up -d postgres redis
docker compose build api
docker compose up -d api
docker compose exec api alembic upgrade head
docker compose exec api python -m app.scripts.bootstrap_demo_data --dry-run
docker compose exec api python -m app.scripts.bootstrap_demo_data
```

Then verify:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/health
curl http://localhost:8000/api/v1/songs
curl http://localhost:8000/api/v1/demo-users
curl http://localhost:8000/api/v1/karaoke-sessions
curl http://localhost:8000/api/v1/dashboard/overview
curl http://localhost:8000/api/v1/agent-runs
```

PowerShell alternative:

```powershell
Invoke-RestMethod http://localhost:8000/api/v1/songs
```

## API Demo Flow

1. Run the bootstrap.
2. List songs with `GET /api/v1/songs`.
3. List demo users with `GET /api/v1/demo-users`.
4. List sessions with `GET /api/v1/karaoke-sessions`.
5. Get one session with `GET /api/v1/karaoke-sessions/{session_id}`.
6. Generate a deterministic mock playlist with `POST /api/v1/playlists/generate`.
7. Get playlist detail with `GET /api/v1/playlists/{playlist_id}`.
8. Post feedback with `POST /api/v1/feedback`.
9. List session feedback with `GET /api/v1/karaoke-sessions/{session_id}/feedback`.
10. List Agent Runs with `GET /api/v1/agent-runs`.
11. Inspect dashboard overview with `GET /api/v1/dashboard/overview`.

## Known Limits

- No commercial or copyrighted music content is included.
- No real LLM provider is connected.
- No advanced recommendation algorithm is implemented.
- Feedback logs are created, but Phase 2D does not implement a true taste-memory delta loop.
- Agent Runs and Agent Steps are persisted demo records, not live Agent workflow execution.
- Do not run pytest in the currently unstable Windows/PowerShell shell documented in the project handoff.

