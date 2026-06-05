# SingFlow AI Phase 2H Handoff

<!-- 中文说明：本文档用于新开的 Codex 对话快速接手 SingFlow AI 当前状态，避免重复 Phase 0 到 Phase 2H-1 的工作，并保护已经完成的前端视觉、后端基础和版权安全边界。 -->

This handoff summarizes the current SingFlow AI repository state after Phase 2H-3. It is intended for a fresh Codex conversation before starting Phase 2H-4 Sessions / Timeline API integration planning.

## 1. Project Overview

| Field | Value |
| --- | --- |
| Project name | SingFlow AI |
| GitHub repository | `https://github.com/rM0on/singflow-ai` |
| Positioning | AI Native Karaoke & Music Workflow Studio |
| Primary scenarios | KTV, in-car entertainment, home music devices |
| Current next phase | Phase 2H-4 Sessions / Timeline API Integration Planning |

SingFlow AI is an AI-native music scene orchestration product. It is not a generic chatbot and not a simple karaoke song picker.

Core product capabilities:

1. Natural-language scene orchestration.
2. Fictional song metadata search.
3. Multi-person taste fusion.
4. Scene playlist generation.
5. Explainable recommendation reasons.
6. Feedback memory foundation.
7. Agent tool-call visualization.

Safety boundary:

1. The repository is metadata-only.
2. It must not include real songs, lyrics, audio, MV files, real album covers, brand assets, pirated links, or unauthorized platform data.
3. Current AI-dependent behavior remains deterministic and mock-only.
4. `LLM_PROVIDER=mock` remains the verified backend runtime mode.

## 2. Completed Phases

| Phase | Status | Summary |
| --- | --- | --- |
| Phase 0 | Completed | Project skeleton, monorepo foundation, docs, Docker Compose skeleton, CI, license |
| Phase 1 | Completed | Advanced frontend static prototype |
| Phase 1.1 | Completed | Frontend visual polish |
| Phase 1.2 | Completed | Screenshot-grade frontend refinement |
| Phase 2A | Completed | SQLAlchemy models, Alembic migration, Pydantic schemas |
| Phase 2B | Completed | Repositories and services foundation |
| Phase 2C-1 | Completed | Basic backend API routers |
| Phase 2C-2 | Completed | Remaining backend API routers |
| Phase 2D | Completed | Demo data bootstrap foundation |
| Phase 2E | Completed | Backend runtime verification guide |
| Phase 2F | Completed | GitHub portfolio packaging, README polish, screenshots |
| Phase 2G | Completed | Backend Docker runtime verification passed locally and documented |
| Phase 2H-1 | Completed | Frontend GET-only API client foundation |
| Phase 2H-2 | Completed | Dashboard partial API integration for backend overview and Agent run aggregates with mock fallback |
| Phase 2H-3 | Completed | Agent Console partial API integration for persisted Agent Run and Agent Step GET data with mock fallback |

## 3. Important Commits

Recent `git log --oneline -12`:

```text
a1fd148 feat: add frontend API client foundation
9cca53a docs: record backend runtime verification
302cd24 docs: add portfolio screenshots
837a5f3 docs: polish GitHub portfolio packaging
001788c docs: add backend runtime verification guide
9eaf4a3 feat: add demo data bootstrap foundation
cefffb1 feat: add remaining backend API routers
ba55278 feat: add basic backend API routers
e919269 feat: add backend repository and service foundation
5fe2720 feat: add backend database schema foundation
fbb93cd docs: add phase 2 development handoff
7615fbc chore: polish static prototype for portfolio screenshots
```

Important checkpoints:

| Commit | Message |
| --- | --- |
| `302cd24` | `docs: add portfolio screenshots` |
| `9cca53a` | `docs: record backend runtime verification` |
| `a1fd148` | `feat: add frontend API client foundation` |

## 4. Current Frontend Status

Completed routes:

| Route | Surface |
| --- | --- |
| `/` | Studio Home |
| `/planner` | AI Session Planner |
| `/timeline` | Playlist Timeline |
| `/sessions/demo` | Demo session timeline surface |
| `/mixer` | Group Taste Mixer |
| `/agent-runs/demo` | Agent Console Preview |
| `/dashboard` | Dashboard / Feedback Memory |

Current frontend facts:

1. The pages remain mock-first and visually polished.
2. `/dashboard` has a low-risk partial API data slice for Dashboard GET aggregates.
3. `/agent-runs/demo` has a low-risk partial API data slice for persisted Agent Runs and Agent Steps.
4. Existing mock data is preserved in `apps/web/lib/mock-data.ts`.
5. `apps/web/app/providers.tsx` already provides TanStack Query.
6. The current screenshot set in `docs/assets/screenshots/` should remain valid until an owner approves new screenshots.
7. Other pages still use mock data and have not formally switched to API data.

Phase 2H-1 added the GET-only API foundation:

| File | Purpose |
| --- | --- |
| `apps/web/lib/api/client.ts` | Native fetch wrapper, timeout, JSON parsing, error envelope normalization |
| `apps/web/lib/api/types.ts` | Lightweight API response and connection-state types |
| `apps/web/lib/api/endpoints.ts` | Low-risk GET endpoint functions |
| `apps/web/lib/api/adapters.ts` | Snake-case/camel-case helpers and API-to-view-model helpers |
| `apps/web/lib/api/status.ts` | `mock` / `connected` / `fallback` status helpers |
| `apps/web/lib/api/index.ts` | API foundation barrel export |

API foundation constraints:

1. It is GET-only.
2. It does not include POST, PATCH, DELETE, request body write support, or mutation helpers.
3. It does not include a playlist generation wrapper.
4. It does not include a feedback POST wrapper.
5. It does not include a taste-fusion POST wrapper.
6. It supports `NEXT_PUBLIC_API_BASE_URL`.
7. The default API base URL is `http://127.0.0.1:8000/api/v1`.
8. It supports `ApiConnectionState = "mock" | "connected" | "fallback"`.

## 5. Current Backend Status

Backend foundation is complete for Phase 2:

1. FastAPI routers are implemented.
2. PostgreSQL schema and Alembic migration are implemented.
3. Demo data bootstrap is implemented.
4. Repositories and services are implemented.
5. Structured error envelope is implemented.
6. Public karaoke session endpoints use `/karaoke-sessions`, not a shorter backend `/sessions` alias.

Phase 2G backend Docker runtime verification passed locally:

| Check | Result |
| --- | --- |
| Docker Compose config | Passed |
| PostgreSQL | Started and healthy |
| Redis | Started and healthy |
| API image | Built |
| API container | Started |
| Alembic `upgrade head` | Passed |
| Bootstrap `--dry-run` | Passed |
| Bootstrap normal mode | Wrote demo data into Docker PostgreSQL |
| `/health` | Passed |
| `/api/v1/health` | Passed with `llm_provider=mock` |
| Core API smoke checks | Passed |
| Dynamic API smoke checks | Passed |

Current Docker note:

1. Docker containers are currently stopped; this is normal.
2. Docker volume data should be preserved.
3. To restart the verified backend runtime later:

```powershell
cd D:\CodexProjects\singflow-ai
docker compose up -d postgres redis api
```

Do not run:

```powershell
docker compose down -v
```

## 6. Verified Demo Data

Phase 2G bootstrap normal mode wrote the following records to Docker PostgreSQL:

| Record type | Created |
| --- | ---: |
| Songs | 96 |
| Users | 6 |
| Taste profiles | 12 |
| Sessions | 3 |
| Members | 11 |
| Playlists | 2 |
| Playlist items | 15 |
| Recommendation reasons | 15 |
| Feedback logs | 13 |
| Agent runs | 3 |
| Agent steps | 17 |

All demo data is fictional metadata only. It does not contain real music, lyrics, audio, MV links, real covers, brand assets, or pirate links.

## 7. Environment Notes

Current local environment facts:

1. Docker Desktop is installed.
2. WSL2 is installed.
3. Docker CLI and Docker Compose are available.
4. Docker containers are currently stopped, but Docker volume data is retained.
5. For backend runtime, use `docker compose up -d postgres redis api`.
6. Do not use `docker compose down -v`.

GitHub push may need a local proxy:

```powershell
git config --global http.proxy http://127.0.0.1:33210
git config --global https.proxy http://127.0.0.1:33210
```

If no proxy is needed, unset it:

```powershell
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## 8. Next Phase Goal

Next phase: Phase 2H-4 Sessions / Timeline API Integration.

Goal:

Connect a small, low-risk part of the existing Sessions / Timeline surfaces to persisted karaoke session and playlist GET API data while preserving the current premium mock-first visual prototype and mock fallback.

Recommended endpoints:

1. `GET /api/v1/karaoke-sessions`
2. `GET /api/v1/karaoke-sessions/{session_id}`
3. `GET /api/v1/playlists/{playlist_id}`

Implementation principles:

1. Do not restructure the Sessions or Timeline layouts.
2. Do not delete mock data.
3. Backend online: show `API connected`.
4. Backend offline: fallback to mock data.
5. The page must not render blank or crash.
6. Replace only low-risk data such as session metadata, playlist title, and playlist item summaries.
7. Do not write feedback or mutate sessions.
8. Do not connect playlist generation.
9. Do not introduce POST wrappers.
10. Do not introduce session API aliases.
11. Do not connect a real LLM.
12. Do not change the README screenshot-quality visual direction.

## 9. New Workflow Decision

Owner workflow decision for future phases:

1. Continue using high-quality detailed prompts.
2. Keep planning steps.
3. Implementation, self-audit, validation, and commit can be combined in one task when risk is low.
4. Do not split every small fix into separate Audit and Commit turns.
5. Commit by functional slice.
6. Keep a separate Audit for high-risk phases.

Recommended commit granularity:

| Slice | Suggested commit |
| --- | --- |
| Phase 2H-2 Dashboard partial API integration | One commit |
| Phase 2H-3 Agent Console API integration | One commit |
| Phase 2H-4 Sessions / Timeline API integration | One commit |
| Phase 2H docs update | One commit |

## 10. Hard Boundaries

Do not:

1. Enter Phase 3.
2. Connect a real LLM.
3. Connect a real music catalog.
4. Add real songs, lyrics, audio, MV links, real covers, brand assets, or pirate links.
5. Run pytest.
6. Run `docker compose down -v`.
7. Delete Docker volumes.
8. Refactor the frontend visual design.
9. Delete `apps/web/lib/mock-data.ts`.
10. Modify backend business logic unless explicitly approved.
11. Modify database schema or migrations unless explicitly approved.
12. Describe the project as production-ready.
13. Claim cloud deployment is complete.
14. Claim frontend-backend integration is complete.

Current frontend-backend integration status:

1. API client foundation is complete.
2. Dashboard partial API integration is complete for overview and Agent run aggregate GET data.
3. Agent Console partial API integration is complete for persisted Agent Run and Agent Step GET data.
4. Other pages remain mock-first and have not formally switched to API data yet.
5. Sessions / Timeline integration is the next planned step.

## 11. Files New Codex Must Read First

Read these before making changes:

1. `AGENTS.md`
2. `README.md`
3. `docs/PHASE_2H_HANDOFF.md`
4. `docs/API_SPEC.md`
5. `docs/API_DEMO_FLOW.md`
6. `docs/BACKEND_RUNTIME_VERIFICATION.md`
7. `docs/ROADMAP.md`
8. `apps/web/lib/api/*`
9. `apps/web/lib/mock-data.ts`
10. `apps/web/components/dashboard/dashboard-page.tsx`
11. `apps/web/components/states/state-strip.tsx`
12. `apps/api/app/api/routes/*`
13. `apps/api/app/schemas/*`

## 12. Recommended First Prompt For New Codex Conversation

Copy this into the next Codex conversation:

```text
Continue the SingFlow AI project.

Current status:
- Phase 0 through Phase 2H-3 are completed.
- Phase 2G backend Docker runtime verification passed locally.
- Phase 2H-1 added GET-only frontend API client foundation.
- Phase 2H-2 added Dashboard partial API integration with mock fallback.
- Phase 2H-3 added Agent Console partial API integration with mock fallback.
- Other frontend pages still use mock data.
- Next target is Phase 2H-4 Sessions / Timeline API Integration.

Before planning, read:
- AGENTS.md
- README.md
- docs/PHASE_2H_HANDOFF.md
- docs/API_SPEC.md
- docs/API_DEMO_FLOW.md
- docs/BACKEND_RUNTIME_VERIFICATION.md
- docs/ROADMAP.md
- apps/web/lib/api/*
- apps/web/lib/mock-data.ts
- apps/web/components/playlist/timeline-page.tsx
- apps/web/components/playlist/session-detail-page.tsx if present
- apps/web/components/states/state-strip.tsx
- apps/api/app/api/routes/*
- apps/api/app/schemas/*

Then run:
1. git status --short
2. git log --oneline -8
3. inspect Sessions / Timeline page data flow
4. inspect API client foundation
5. inspect backend karaoke session and playlist routes/schemas

Do not write code yet.
Do not run Docker.
Do not run pytest.
Do not enter Phase 3.
Do not connect a real LLM.
Do not modify frontend visual layout.

Output only the Phase 2H-4 Sessions / Timeline API Integration implementation plan.
Wait for owner approval before coding.
```
