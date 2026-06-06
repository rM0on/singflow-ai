# Frontend Backend Runtime Verification

This document records local runtime verification for Phase 2H frontend GET integrations, the Phase 3A Planner mock generation workflow, the Phase 3B Mixer mock taste-fusion workflow, the Phase 3C Dashboard feedback memory loop, and the Phase 3D end-to-end product workflow smoke pass.

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

## Phase 3B Mixer Runtime Verification

Phase 3B adds a controlled Mixer mutation for `POST /api/v1/karaoke-sessions/{session_id}/taste-fusion`. The mutation is scoped to local deterministic mock taste fusion and does not add feedback writes, playlist generation calls from Mixer, generic POST/PATCH/DELETE helpers, a real LLM provider, or real music assets.

Runtime verification completed locally:

| Check | Result |
| --- | --- |
| Backend health | PostgreSQL, Redis, and API were running; `/api/v1/health` returned `llm_provider=mock` |
| Prerequisite data | Karaoke sessions and session members were readable |
| Backend direct taste-fusion | `POST /api/v1/karaoke-sessions/{session_id}/taste-fusion` succeeded |
| Fusion response | Safe fusion keys included `energy_target`, `genres`, `languages`, and `scene_type`; conflicts count was readable |
| Browser Mixer state | `/mixer` showed `API connected` and backend member lanes |
| Member content | Member name, role, weight, language hints, and genre hints were visible |
| Browser fusion | `Run local fusion` moved the page into local fusion state and rendered the main fusion result |
| Fusion preview content | Fusion profile / group taste field updated, fusion confidence showed `55%`, deterministic mock fusion / local backend fusion wording was visible, and member contribution weights remained visible |
| Lower Mixer content | Compromise matrix, fusion conflict / playlist compromise text, fusion confidence, and member cards remained visible after fusion |

The empty-state demo block may still be visible as part of the page preview, but the main fusion result was rendered successfully.

## Phase 3C Feedback Memory Runtime Verification

Phase 3C adds a controlled Dashboard mutation for `POST /api/v1/feedback`. The mutation is scoped to metadata-only feedback memory logging and does not call playlist generation, taste fusion, generic POST/PATCH/DELETE helpers, a real LLM provider, or real music assets.

Runtime verification completed locally:

| Check | Result |
| --- | --- |
| Backend health | PostgreSQL, Redis, and API were running; `/api/v1/health` returned `llm_provider=mock` |
| Prerequisite data | Karaoke sessions, demo users, and dashboard overview were readable |
| Baseline dashboard overview | `feedback_count=14`; `great_for_group=4` |
| Backend direct feedback | `POST /api/v1/feedback` succeeded with metadata-only session feedback |
| Direct write readback | `feedback_count` increased from `14` to `15`; `great_for_group` increased from `4` to `5`; recent feedback was readable |
| Memory update status | `memory_update.status=queued` |
| Browser Dashboard state | `/dashboard` showed `API connected`; Feedback memory loop and action buttons were visible |
| Browser feedback action | Clicking a feedback action logged a memory signal |
| Browser feedback UI | `Memory signal logged`, recorded state, and `Feedback recorded | memory signal queued` were visible |
| Browser aggregate refresh | Recent memory signal updated, and feedback count increased further during manual browser verification |

No long JSON, raw provider payload, hidden reasoning, or chain-of-thought was shown. Feedback is recorded as a metadata-only memory signal, not real model training.

## Phase 3D End-to-End Product Workflow Verification

Phase 3D verified the current local product workflow end to end without adding new code or documentation during execution. It reused the controlled mock-only / metadata-only flows from Phase 3A, Phase 3B, and Phase 3C.

| Check | Result |
| --- | --- |
| Backend services | PostgreSQL running / healthy, Redis running / healthy, API running on port `8000` |
| Health | `/health` and `/api/v1/health` returned `status=ok`, `environment=local`; `/api/v1/health` returned `llm_provider=mock` |
| Baseline data | `sessions=3`; selected session `Demo Home Party Signal Set`, `home_party`; demo users `6`; selected user `Demo Echo Guest`; baseline `feedback_count=22`; baseline Agent runs returned `5` |
| Planner backend workflow | Controlled `POST /api/v1/playlists/generate` with `mode=mock` succeeded; playlist status `generated`; item count `8`; Agent status `succeeded` |
| Generated readback | Generated playlist was readable; generated Agent run was `succeeded`; five Agent steps were readable with safe tool names |
| Agent step tools | `plan`, `search_song_catalog`, `rank_song_candidates`, `generate_reasons`, `persist_playlist` |
| Mixer backend workflow | Controlled `POST /api/v1/karaoke-sessions/{session_id}/taste-fusion` succeeded; fusion keys included `languages`, `genres`, `energy_target`, and `scene_type`; conflicts count was `1` |
| Dashboard feedback backend workflow | Controlled metadata-only `POST /api/v1/feedback` succeeded; `memory_update.status=queued` |
| Feedback read-after-write | `feedback_count` increased from `22` to `23`; `great_for_group` increased from `7` to `8`; recent feedback matched the POST id |
| Frontend route smoke | `/`, `/planner`, `/agent-runs/demo`, `/timeline`, `/sessions/demo`, `/mixer`, and `/dashboard` returned HTTP 200 with key text |
| Fallback route smoke | `/planner`, `/agent-runs/demo`, `/timeline`, `/mixer`, and `/dashboard` returned HTTP 200 with key text after the API was stopped |
| API restore | API was restored afterward and `/api/v1/health` returned `llm_provider=mock` |

Hydrated browser click checks were not automated in Phase 3D. Key Planner generation, Mixer fusion, and Dashboard feedback interactions were manually confirmed during the Phase 3A, Phase 3B, and Phase 3C runtime verification passes.

Known limitations remain:

- Studio Home `/` remains mock-first by design.
- Timeline phase and fictional song cards remain mock-safe visual preview and do not consume generated playlist runtime items.
- Mixer taste fusion is a preview workflow, not a persisted Agent workflow.
- Feedback memory is a metadata-only feedback log, not real model training.
- The project remains a local mock/database-backed workflow and has not connected a real LLM or real music catalog.

## Limitations

- This was local runtime verification only.
- This was not a hosted release.
- The project is not ready for production use.
- No automated browser framework was used; Phase 2H API connected/fallback badge checks, Phase 3A Planner generation, Phase 3B Mixer fusion, and Phase 3C Dashboard feedback logging were manually confirmed in the browser. Phase 3D performed route smoke checks and backend E2E checks but did not automate hydrated button clicks.
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
- No feedback POST was used during Phase 3B verification.
- Phase 3C used one controlled metadata-only feedback POST for verification.
- No playlist generation call was made from Mixer during Phase 3B verification.
- No playlist generation call was made during Phase 3C verification.
- No taste-fusion call was made during Phase 3C verification.
- No generic POST/PATCH/DELETE client was added for Phase 3B verification.
- No generic POST/PATCH/DELETE client was added for Phase 3C verification.
- Phase 3D used controlled mock-only / metadata-only POST checks for Planner generation, Mixer taste fusion, and Dashboard feedback verification.
- No `pytest`, database command, bootstrap, migration, destructive Docker command, or volume deletion was used during Phase 3D verification.
