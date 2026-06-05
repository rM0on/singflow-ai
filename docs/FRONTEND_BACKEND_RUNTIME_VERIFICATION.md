# Frontend Backend Runtime Verification

This document records local runtime verification for Phase 2H frontend GET integrations and the Phase 3A Planner mock generation workflow.

## Verification Context

| Field | Result |
| --- | --- |
| Date | 2026-06-06 |
| Phase | Phase 2H Runtime Verification |
| Backend services | PostgreSQL, Redis, and API running during verification |
| Frontend runtime | Next.js dev server started manually by the owner |
| LLM mode | `LLM_PROVIDER=mock` |
| Scope | Dashboard, Agent Console, Timeline, and `/sessions/demo` partial GET integrations |

Studio Home `/` remains mock-first by design. It was smoke-checked for page availability but was not part of the Phase 2H API integration scope.

## Backend Health Checks

| URL | Result |
| --- | --- |
| `http://127.0.0.1:8000/health` | `status=ok`, `environment=local` |
| `http://127.0.0.1:8000/api/v1/health` | `status=ok`, `environment=local`, `llm_provider=mock` |

## Backend API Data Availability

| Area | Result |
| --- | --- |
| Dashboard overview | `sessions_count=3`, `playlists_count=3`, `feedback_count=14`, `top_feedback_types=5` |
| Dashboard Agent runs | `status_rows=2`, `tool_rows=6`, `recent_failures=1` |
| Agent runs | `count=4`; selected run `status=succeeded`; `steps_count=5`; fetched steps `5` |
| Karaoke sessions | `count=3`; selected session `Demo Home Party Signal Set`; `status=draft`; members `4` |

## Frontend Smoke Checks

The following routes returned HTTP 200 and did not render blank or crashed pages:

- `/`
- `/dashboard`
- `/agent-runs/demo`
- `/timeline`
- `/sessions/demo`

## Manual API Connected Checks

The owner manually opened the local frontend in a browser and confirmed:

- `/dashboard` showed `API connected`.
- `/agent-runs/demo` showed `API connected`.
- `/timeline` showed `API connected`.
- `/sessions/demo` showed `API connected`.

## Manual Fallback Checks

The owner used the non-destructive command `docker compose stop api` for fallback verification.

Confirmed behavior:

- `/agent-runs/demo` fell back to `Mock data`.
- `/timeline` showed `API unavailable, fallback to mock`.
- `/sessions/demo` uses the same `TimelinePage` fallback behavior.
- Pages remained usable and did not crash.
- No error stack was shown as page content.

The owner then restored the API with `docker compose up -d api`.

Restore check:

- API was restored and running.
- `/dashboard`, `/agent-runs/demo`, `/timeline`, and `/sessions/demo` returned to `API connected` after refresh.

## Page Integration Scope

| Page | Backend GET APIs | Still Mock |
| --- | --- | --- |
| Dashboard | `/dashboard/overview`, `/dashboard/agent-runs` | Non-critical chart details when backend data is missing |
| Agent Console | `/agent-runs`, `/agent-runs/{agent_run_id}`, `/agent-runs/{agent_run_id}/steps` | Loading and empty state examples |
| Timeline / Sessions | `/karaoke-sessions`, `/karaoke-sessions/{session_id}`, `/karaoke-sessions/{session_id}/members` | Phase cards, fictional song cards, energy curve, fit reasons |

No write endpoints were used for Phase 2H frontend runtime verification.

## Phase 3A Planner Runtime Verification

Phase 3A adds a controlled Planner mutation for `POST /api/v1/playlists/generate` with `mode=mock`. Local dev CORS now allows `GET`, `POST`, and `OPTIONS` from `http://localhost:3000` and `http://127.0.0.1:3000` so the Planner can call that mock generation endpoint during local verification.

Runtime verification completed locally after the CORS fix:

| Check | Result |
| --- | --- |
| Backend direct generation | `POST /api/v1/playlists/generate` with `mode=mock` succeeded |
| Generated playlist readback | Playlist was readable through `GET /api/v1/playlists/{playlist_id}` |
| Generated Agent readback | Agent run and Agent steps were readable through their GET endpoints |
| Browser Planner state | `/planner` showed `API connected` and `session ready` |
| Browser generation | `Generate mock playlist` produced a generated result preview instead of fallback |
| Preview content | `Deterministic Mock Playlist`, deterministic mock workflow wording, track count, track title, demo artist, fit score, recommendation reason, Agent status `succeeded`, Agent run id, Timeline link, and Agent Console link were visible |

The loading or disabled button state was not separately captured because generation completed quickly during the manual browser check.

This CORS change does not add generic frontend write capability, feedback writes, taste-fusion writes, a real LLM provider, or real music assets. `LLM_PROVIDER=mock` remained the verified backend mode.

## Limitations

- This was local runtime verification only.
- This was not a hosted release.
- The project is not ready for production use.
- No automated browser framework was used; Phase 2H API connected/fallback badge checks and Phase 3A Planner generation were manually confirmed in the browser.
- Studio Home remains mock-first by design.
- Timeline phase and fictional song placement remain mock because the backend session API does not provide full timeline placement data.

## Safety Confirmations

- No `pytest` command was run.
- No `docker compose down -v` command was run.
- No Docker volume was deleted.
- No database schema or migration changes were made.
- Demo bootstrap was not rerun.
- No real LLM was used.
- `LLM_PROVIDER=mock`.
- No real music catalog was used.
- No lyrics, audio, MV files, real covers, copied brand assets, or pirate links were added.
