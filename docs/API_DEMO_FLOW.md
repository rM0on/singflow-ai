# API Demo Flow

This document describes the mock/database-backed API demo flow for SingFlow AI.

Phase 2G executed this flow in local Docker against the demo PostgreSQL database. The flow passed with `LLM_PROVIDER=mock` and fictional metadata only.

## Goal

Demonstrate the backend workflow from song catalog browsing to session inspection, taste fusion, mock playlist generation, feedback logging, Agent Run inspection, and dashboard aggregation.

The flow remains deterministic and mock-only.

## Prerequisites

- Backend API routers exist.
- Demo data bootstrap exists.
- Alembic migration exists.
- `LLM_PROVIDER=mock`.
- Backend Docker runtime verification passed locally in Phase 2G.
- See [Backend Runtime Verification](BACKEND_RUNTIME_VERIFICATION.md) for the verified migration, bootstrap, and smoke-check summary.

## Demo Flow

1. List songs.
2. List demo users.
3. List karaoke sessions.
4. Get one session detail.
5. Inspect group members.
6. Run deterministic taste fusion.
7. Generate a mock playlist.
8. Get playlist detail.
9. Post feedback.
10. List session feedback.
11. List Agent Runs.
12. Inspect Agent Run steps.
13. Inspect dashboard overview.

## Endpoint Checklist

Health:

- `GET /health`
- `GET /api/v1/health`

Songs:

- `GET /api/v1/songs`
- `GET /api/v1/songs?language=en`
- `GET /api/v1/songs?scene_tag=ktv`

Users:

- `GET /api/v1/demo-users`
- `GET /api/v1/users/{user_id}/taste-profiles`
- `GET /api/v1/users/{user_id}/feedback-summary`

Karaoke Sessions:

- `GET /api/v1/karaoke-sessions`
- `GET /api/v1/karaoke-sessions/{session_id}`
- `GET /api/v1/karaoke-sessions/{session_id}/members`
- `POST /api/v1/karaoke-sessions/{session_id}/taste-fusion`

Phase 2H-4 connects the frontend Timeline and `/sessions/demo` surfaces to the low-risk karaoke session and member GET endpoints. The page can use backend session metadata and compact member summaries when the backend is available, and it keeps the existing mock timeline fallback when the backend is offline, empty, or returns an unexpected shape. Phase cards and fictional song cards remain mock because the session API does not provide full timeline placement or live playlist-generation data.

Phase 3B connects the Group Taste Mixer to session members and `POST /api/v1/karaoke-sessions/{session_id}/taste-fusion` as a controlled mock-only mutation. The Mixer can read backend member summaries, run local deterministic taste fusion, and adapt language, genre, energy target, conflict, and member weight summaries into the existing visual preview. If the backend is unavailable or the response is unusable, the Mixer keeps the existing mock preview.

This Phase 3B Mixer mutation does not add feedback writes, playlist generation calls, generic POST/PATCH/DELETE helpers, real LLM calls, or real music assets.

Playlists:

- `POST /api/v1/playlists/generate`
- `GET /api/v1/playlists/{playlist_id}`

Phase 3A connects the AI Session Planner to `POST /api/v1/playlists/generate` as a controlled mock-only mutation. The frontend sends `mode=mock`, a selected karaoke session id, an optional demo user id, prompt text, target length, and safe constraints. Successful responses are adapted into a compact generated playlist preview with Agent run status. If the backend is unavailable or the response is unusable, the Planner keeps the existing mock planning preview.

This Phase 3A Planner mutation does not add feedback writes, taste-fusion writes, generic POST/PATCH/DELETE helpers, real LLM calls, or real music assets.

For local browser verification, FastAPI CORS allows `GET`, `POST`, and `OPTIONS` only for the documented local frontend origins. This lets the Planner call `/playlists/generate` and the Mixer call `/karaoke-sessions/{session_id}/taste-fusion` from the browser while keeping feedback writes, generic write helpers, real LLM calls, and real music assets out of scope.

Feedback:

- `POST /api/v1/feedback`
- `GET /api/v1/karaoke-sessions/{session_id}/feedback`

Phase 3C connects the Dashboard Feedback Memory loop to `POST /api/v1/feedback` as a controlled metadata-only mutation. The Dashboard chooses a real backend karaoke session when available, submits a session-level feedback type, refetches `/dashboard/overview`, and can read recent session feedback through the existing GET endpoint. If the backend is unavailable or the response is unusable, the Dashboard keeps the mock memory preview.

This Phase 3C Dashboard mutation does not call playlist generation, taste fusion, generic POST/PATCH/DELETE helpers, a real LLM provider, or real music assets. Feedback is shown as a local metadata memory log, not as model training.

Agent Runs:

- `GET /api/v1/agent-runs`
- `GET /api/v1/agent-runs/{agent_run_id}`
- `GET /api/v1/agent-runs/{agent_run_id}/steps`

Phase 2H-3 connects the frontend Agent Console to the low-risk Agent Run GET endpoints. The page can use persisted run summaries, run detail, and ordered step summaries when the backend is available, and it keeps the existing mock run and mock steps as fallback when the backend is offline, empty, or returns an unexpected shape. The UI displays safe summaries only and does not expose hidden reasoning or provider internals.

Dashboard:

- `GET /api/v1/dashboard/overview`
- `GET /api/v1/dashboard/taste-evolution`
- `GET /api/v1/dashboard/agent-runs`
- `GET /api/v1/dashboard/agent-performance`

Phase 2H-2 connects the frontend Dashboard to the low-risk Dashboard GET aggregates. The page uses `/dashboard/overview` for top metrics and feedback distribution, `/dashboard/agent-runs` for Agent success/status summary, and keeps the existing mock data as fallback when the backend is offline, empty, or returns an unexpected shape.

## Phase 2H Frontend Page Runtime Verification

Phase 2H local runtime verification confirmed the partial GET integrations at page level:

- Dashboard uses `GET /api/v1/dashboard/overview` and `GET /api/v1/dashboard/agent-runs`.
- Agent Console uses `GET /api/v1/agent-runs`, `GET /api/v1/agent-runs/{agent_run_id}`, and `GET /api/v1/agent-runs/{agent_run_id}/steps`.
- Timeline and `/sessions/demo` use `GET /api/v1/karaoke-sessions`, `GET /api/v1/karaoke-sessions/{session_id}`, and `GET /api/v1/karaoke-sessions/{session_id}/members`.
- Backend online browser checks confirmed `API connected` on Dashboard, Agent Console, Timeline, and `/sessions/demo`.
- Backend offline fallback checks confirmed usable mock fallback on Agent Console, Timeline, and `/sessions/demo`.
- No write endpoints were used for the Phase 2H frontend page verification.
- No real LLM provider or real music assets were used; `LLM_PROVIDER=mock`.
- Timeline phase cards and fictional song cards remain mock because the backend session API does not provide full timeline placement data.

Studio Home `/` remains mock-first by design and was not part of the Phase 2H API integration scope.

## Phase 3A Planner Runtime Verification

Phase 3A local runtime verification confirmed the controlled mock Planner generation loop:

- Backend direct verification passed for `POST /api/v1/playlists/generate` with `mode=mock`.
- The generated playlist, Agent run, and Agent steps were readable through their GET endpoints.
- Browser verification passed after the local CORS fix: `/planner` showed `API connected` and `session ready`, then `Generate mock playlist` produced a generated result preview instead of fallback.
- The preview showed `Deterministic Mock Playlist`, deterministic mock workflow wording, track count, generated track rows with title, demo artist, fit score, recommendation reason, Agent status `succeeded`, Agent run id, and links to Timeline and Agent Console.
- The flow did not use feedback writes, taste-fusion writes, generic POST/PATCH/DELETE helpers, a real LLM provider, or real music assets.
- `LLM_PROVIDER=mock` remained the verified backend mode.

## Phase 3B Mixer Runtime Verification

Phase 3B local runtime verification confirmed the controlled mock Group Taste Mixer fusion loop:

- Backend direct verification passed for `POST /api/v1/karaoke-sessions/{session_id}/taste-fusion`.
- The taste-fusion response exposed safe metadata keys including `energy_target`, `genres`, `languages`, and `scene_type`; conflicts count was readable.
- Browser verification passed: `/mixer` showed `API connected`, backend member lanes, member name / role / weight / language / genre hints, and a visible `Run local fusion` action.
- Running local fusion moved the page into local fusion state, updated the fusion profile / group taste field, kept fusion confidence visible, and showed deterministic mock fusion / local backend fusion wording.
- Lower Mixer sections remained usable after fusion, including the compromise matrix, conflict / playlist compromise text, fusion confidence, and member cards. The empty-state demo block may remain visible as part of the page preview while the main fusion result is rendered.
- The flow did not use feedback writes, playlist generation calls from Mixer, generic POST/PATCH/DELETE helpers, a real LLM provider, or real music assets.
- `LLM_PROVIDER=mock` remained the verified backend mode.

## Phase 3C Feedback Memory Loop

Phase 3C implements the Dashboard-side feedback write/read loop:

- Dashboard can load a real demo karaoke session for feedback context.
- The feedback action calls only `POST /api/v1/feedback`.
- The request uses a real `karaoke_session_id` and does not construct fake playlist, playlist item, song, or user ids.
- Successful writes show a `feedback recorded` / memory signal state and refetch dashboard overview aggregates.
- Recent session feedback can be read through `GET /api/v1/karaoke-sessions/{session_id}/feedback`.
- The flow remains mock-only and metadata-only, with no playlist generation, no taste-fusion call, no real LLM provider, and no real music assets.

## Example Request Shapes

Taste fusion:

```json
{
  "scene_type": "ktv",
  "energy_curve": "ramp_up"
}
```

Mock playlist generation:

```json
{
  "karaoke_session_id": "{session_id}",
  "created_by_user_id": "{user_id}",
  "prompt": "Build a safe fictional demo set for the current karaoke session.",
  "target_length": 8,
  "constraints": {
    "languages": ["en", "zh", "cantonese", "mixed"],
    "scene_tags": ["ktv", "chorus", "high_energy"],
    "max_vocal_difficulty": 0.85
  },
  "mode": "mock"
}
```

Feedback:

```json
{
  "karaoke_session_id": "{session_id}",
  "playlist_id": "{playlist_id}",
  "playlist_item_id": "{playlist_item_id}",
  "song_id": "{song_id}",
  "user_id": "{user_id}",
  "feedback_type": "liked",
  "rating": 5,
  "reason": "Fictional demo feedback for API flow verification.",
  "event_payload": {
    "source": "api_demo_flow"
  }
}
```

## Boundaries

- Do not call a real LLM provider.
- Do not call external music platforms.
- Do not use real songs, real artists, real lyrics, audio, MV links, real covers, brand assets, or pirate links.
- Do not write real API keys.
- Do not claim smoke tests passed unless the flow has actually been run in a working environment.

## Current Verification Status

Phase 2G executed the API demo flow in local Docker after Alembic migration and demo bootstrap normal mode. Core API smoke checks and the dynamic playlist/feedback/dashboard flow passed.

Phase 2H executed local frontend page runtime verification for Dashboard, Agent Console, Timeline, and `/sessions/demo` partial GET integrations. Manual browser checks confirmed backend-online `API connected` behavior and backend-offline mock fallback behavior.

Phase 3A executed local Planner runtime verification after the local CORS fix. Backend direct `POST /api/v1/playlists/generate` with `mode=mock` succeeded, generated playlist and Agent records were readable, and manual browser checks confirmed `/planner` can produce a generated deterministic mock preview with Agent status, track rows, reasons, and Timeline / Agent Console links.

Phase 3B executed local Mixer runtime verification. Backend direct `POST /api/v1/karaoke-sessions/{session_id}/taste-fusion` succeeded, safe fusion keys and conflicts were readable, and manual browser checks confirmed `/mixer` can show backend members, run local deterministic mock fusion, update the fusion field and confidence, and keep compromise / conflict summaries visible.

Phase 3C implements the Dashboard feedback memory write/read loop. Runtime verification for the browser feedback submit and dashboard aggregate refresh is the next local verification step.

This is local Docker and browser verification, not a hosted release. The flow remains mock/database-backed and does not connect an external LLM provider or real music catalog.
