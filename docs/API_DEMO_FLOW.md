# API Demo Flow

This document describes the mock/database-backed API demo flow for SingFlow AI.

It is a checklist for a future Docker-capable environment. The current local environment cannot run Docker, so this document does not claim that the smoke flow has passed.

## Goal

Demonstrate the backend workflow from song catalog browsing to session inspection, taste fusion, mock playlist generation, feedback logging, Agent Run inspection, and dashboard aggregation.

The flow remains deterministic and mock-only.

## Prerequisites

- Backend API routers exist.
- Demo data bootstrap exists.
- Alembic migration exists.
- `LLM_PROVIDER=mock`.
- Docker runtime verification is still pending in the current local environment.
- Run the Docker checklist in [Backend Runtime Verification](BACKEND_RUNTIME_VERIFICATION.md) before treating this flow as verified.

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

Playlists:

- `POST /api/v1/playlists/generate`
- `GET /api/v1/playlists/{playlist_id}`

Feedback:

- `POST /api/v1/feedback`
- `GET /api/v1/karaoke-sessions/{session_id}/feedback`

Agent Runs:

- `GET /api/v1/agent-runs`
- `GET /api/v1/agent-runs/{agent_run_id}`
- `GET /api/v1/agent-runs/{agent_run_id}/steps`

Dashboard:

- `GET /api/v1/dashboard/overview`
- `GET /api/v1/dashboard/taste-evolution`
- `GET /api/v1/dashboard/agent-runs`
- `GET /api/v1/dashboard/agent-performance`

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

This API demo flow has not been executed in the current local environment because Docker is unavailable. It should be run after Docker/PostgreSQL/API runtime verification succeeds.
