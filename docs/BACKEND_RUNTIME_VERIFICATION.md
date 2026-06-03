# Backend Runtime Verification

This document describes the Phase 2E/2G runtime verification path for the SingFlow AI backend.

Phase 2G verified that the mock/database-backed backend can run locally with Docker Compose, PostgreSQL, Redis, Alembic migrations, demo bootstrap data, and API smoke checks.

It does not introduce real LLM calls, real AI playlist generation, advanced recommendation logic, live Agent workflow execution, or copyrighted music assets.

## Goals

- Confirm Docker can parse and start the backend runtime services.
- Start PostgreSQL and Redis for the local demo stack.
- Build and start the FastAPI API container.
- Apply Alembic migrations to the demo PostgreSQL database.
- Run the deterministic demo data dry-run and bootstrap.
- Verify health and core API endpoints return database-backed demo data.
- Keep `LLM_PROVIDER=mock`.

## Safety Boundary

The Phase 2E/2G verification flow uses fictional metadata only.

The repository and demo database must not include real lyrics, audio files, karaoke tracks, MV files, commercial album covers, copied brand assets, pirated links, scraped platform data, or hard-coded API keys.

Do not run destructive database commands during this verification. In particular, do not run `docker compose down -v`.

Do not run pytest in the currently unstable local shell documented by the project handoff.

## Current Local Verification Status

Phase 2G backend runtime verification passed in local Docker on June 3, 2026.

This was local Docker verification only. It was not a cloud release and did not connect any real LLM or music provider.

Verified:

- `docker compose config` passed.
- PostgreSQL and Redis started and reported healthy.
- API image built and the API container started.
- `alembic upgrade head` passed.
- `python -m app.scripts.bootstrap_demo_data --dry-run` passed.
- `python -m app.scripts.bootstrap_demo_data` wrote demo records to Docker PostgreSQL.
- `GET /health` passed.
- `GET /api/v1/health` passed and reported `llm_provider=mock`.
- Core API smoke checks passed.
- Dynamic API smoke checks passed.

Not run:

- `pytest`
- `python -m pytest`
- `docker compose down -v`
- destructive database commands

No Docker volume was deleted.

## Phase 2G Verification Result

Commands verified:

```bash
docker compose config
docker compose up -d postgres redis
docker compose build api
docker compose up -d api
docker compose exec api alembic upgrade head
docker compose exec api python -m app.scripts.bootstrap_demo_data --dry-run
docker compose exec api python -m app.scripts.bootstrap_demo_data
```

Demo data written by bootstrap normal mode:

| Record type | Created |
| --- | ---: |
| Songs | 96 |
| Users | 6 |
| Taste profiles | 12 |
| Karaoke sessions | 3 |
| Group members | 11 |
| Playlists | 2 |
| Playlist items | 15 |
| Recommendation reasons | 15 |
| Feedback logs | 13 |
| Agent runs | 3 |
| Agent steps | 17 |

Core API smoke checks passed:

- `GET /api/v1/songs`
- `GET /api/v1/demo-users`
- `GET /api/v1/karaoke-sessions`
- `GET /api/v1/dashboard/overview`
- `GET /api/v1/agent-runs`

Dynamic API smoke checks passed:

- `GET /api/v1/users/{user_id}/taste-profiles`
- `GET /api/v1/karaoke-sessions/{session_id}/members`
- `POST /api/v1/karaoke-sessions/{session_id}/taste-fusion`
- `POST /api/v1/playlists/generate`
- `GET /api/v1/playlists/{playlist_id}`
- `POST /api/v1/feedback`
- `GET /api/v1/karaoke-sessions/{session_id}/feedback`
- `GET /api/v1/dashboard/agent-runs`
- `GET /api/v1/dashboard/agent-performance`

The smoke flow used IDs returned by the running API. Full response JSON is intentionally not recorded here.

## 1. Docker Environment Check

From the repository root:

```bash
docker --version
docker compose version
```

Expected result:

- Docker returns a version.
- Docker Compose returns a version.

If either command is unavailable, stop the Docker runtime verification and use this document as a checklist only. Continue with non-Docker static validation such as documentation review and `git diff --check`.

## 2. Compose Config Check

```bash
docker compose config
```

Expected result:

- `postgres`, `redis`, `api`, and `web` services are present.
- The `api` service has `LLM_PROVIDER=mock`.
- PostgreSQL and Redis health checks are present.
- No real API key is present in the rendered configuration.

If config parsing fails, record the error and do not continue to service startup.

## 3. Start PostgreSQL And Redis

```bash
docker compose up -d postgres redis
docker compose ps
```

Expected result:

- PostgreSQL is running and healthy.
- Redis is running and healthy.

If either service does not become healthy in a reasonable time, inspect recent logs:

```bash
docker compose logs postgres --tail 100
docker compose logs redis --tail 100
```

Do not delete volumes as part of this check.

## 4. Build And Start API

```bash
docker compose build api
docker compose up -d api
docker compose ps
```

Expected result:

- The API image builds from `apps/api/Dockerfile`.
- The API container starts on port `8000`.
- The API uses the Docker database URL and `LLM_PROVIDER=mock`.

If the build fails because Docker, network access, or dependency installation is unavailable, record the failure and stop runtime verification.

## 5. Apply Alembic Migration

```bash
docker compose exec api alembic upgrade head
```

Expected result:

- Alembic applies the Phase 2 core table migration.
- No downgrade or destructive database command is executed.

## 6. Demo Bootstrap

Run the dry-run first:

```bash
docker compose exec api python -m app.scripts.bootstrap_demo_data --dry-run
```

Expected result:

- 96 fictional songs are detected.
- Languages cover `en`, `zh`, `cantonese`, and `mixed`.
- Required scene tags are covered.
- Forbidden content fields are rejected by validation.
- No database write is performed.

Then run the normal bootstrap:

```bash
docker compose exec api python -m app.scripts.bootstrap_demo_data
```

Expected result:

- Demo songs, users, taste profiles, sessions, members, playlists, recommendation reasons, feedback logs, Agent Runs, and Agent Steps are inserted or updated idempotently.
- The script does not call external APIs or LLM providers.
- No reset flag is used.

## 7. Health Smoke Checks

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/health
```

PowerShell alternative:

```powershell
Invoke-RestMethod http://localhost:8000/health
Invoke-RestMethod http://localhost:8000/api/v1/health
```

Expected result:

- Both endpoints return `status=ok`.
- `/api/v1/health` reports `llm_provider=mock`.

## 8. Core API Smoke Checks

```bash
curl http://localhost:8000/api/v1/songs
curl "http://localhost:8000/api/v1/songs?language=en"
curl "http://localhost:8000/api/v1/songs?scene_tag=ktv"
curl http://localhost:8000/api/v1/demo-users
curl http://localhost:8000/api/v1/karaoke-sessions
curl http://localhost:8000/api/v1/dashboard/overview
curl http://localhost:8000/api/v1/agent-runs
```

Expected result:

- Songs return fictional metadata only.
- Demo users return fictional display names and avatar seeds.
- Karaoke sessions use the public `/karaoke-sessions` API.
- Dashboard and Agent Run endpoints return database-backed demo aggregates and persisted summaries.

## 9. Dynamic API Smoke Flow

The following PowerShell flow captures IDs from previous responses and performs the main mock/database-backed workflow.

```powershell
$base = "http://localhost:8000"

$users = Invoke-RestMethod "$base/api/v1/demo-users"
$userId = $users.items[0].id

$sessions = Invoke-RestMethod "$base/api/v1/karaoke-sessions"
$sessionId = $sessions.items[0].id

Invoke-RestMethod "$base/api/v1/users/$userId/taste-profiles"
Invoke-RestMethod "$base/api/v1/karaoke-sessions/$sessionId/members"

$fusionBody = @{
  scene_type = "ktv"
  energy_curve = "ramp_up"
} | ConvertTo-Json
Invoke-RestMethod "$base/api/v1/karaoke-sessions/$sessionId/taste-fusion" -Method Post -ContentType "application/json" -Body $fusionBody

$playlistBody = @{
  karaoke_session_id = $sessionId
  created_by_user_id = $userId
  prompt = "Build a safe fictional demo set for the current karaoke session."
  target_length = 8
  constraints = @{
    languages = @("en", "zh", "cantonese", "mixed")
    scene_tags = @("ktv", "chorus", "high_energy")
    max_vocal_difficulty = 0.85
  }
  mode = "mock"
} | ConvertTo-Json -Depth 5
$generated = Invoke-RestMethod "$base/api/v1/playlists/generate" -Method Post -ContentType "application/json" -Body $playlistBody
$playlistId = $generated.playlist.id
$playlistItemId = $generated.playlist.items[0].id
$songId = $generated.playlist.items[0].song.id

Invoke-RestMethod "$base/api/v1/playlists/$playlistId"

$feedbackBody = @{
  karaoke_session_id = $sessionId
  playlist_id = $playlistId
  playlist_item_id = $playlistItemId
  song_id = $songId
  user_id = $userId
  feedback_type = "liked"
  rating = 5
  reason = "Fictional demo feedback for runtime smoke verification."
  event_payload = @{
    source = "phase_2e_smoke_check"
  }
} | ConvertTo-Json -Depth 5
Invoke-RestMethod "$base/api/v1/feedback" -Method Post -ContentType "application/json" -Body $feedbackBody

Invoke-RestMethod "$base/api/v1/karaoke-sessions/$sessionId/feedback"
Invoke-RestMethod "$base/api/v1/dashboard/agent-runs"
Invoke-RestMethod "$base/api/v1/dashboard/agent-performance"

$runs = Invoke-RestMethod "$base/api/v1/agent-runs"
$agentRunId = $runs.items[0].id
Invoke-RestMethod "$base/api/v1/agent-runs/$agentRunId"
Invoke-RestMethod "$base/api/v1/agent-runs/$agentRunId/steps"
```

Expected result:

- Taste fusion returns deterministic mock fusion output.
- Playlist generation persists a mock playlist, playlist items, recommendation reasons, an Agent Run, and Agent Steps.
- Feedback is saved as a feedback log.
- Dashboard agent metrics and the compatibility alias return the same metric shape.
- No external provider is called.

## 10. Docker Unavailable Fallback

If Docker is unavailable in the local shell:

- Do not attempt `docker compose up`.
- Do not attempt Docker migration or bootstrap writes.
- Use this document as the smoke test checklist for the next Docker-capable environment.
- Continue with static checks such as `git diff --check`, documentation review, and risk-field scans.

## Known Limits

- Phase 2G verifies local backend runtime wiring; it does not add cloud deployment automation.
- The API container does not automatically apply migrations on startup; run Alembic explicitly.
- Demo bootstrap normal mode writes to the configured demo database.
- Dashboard range parameters are accepted by the API but remain basic aggregate helpers.
- Playlist generation remains deterministic mock-only.
- Feedback memory does not compute a real taste-profile delta.
- Agent Runs and Agent Steps are persisted safe summaries, not live Agent execution.
- Backend tests are intentionally not run in the unstable local shell for this phase.
