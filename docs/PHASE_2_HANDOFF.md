# SingFlow AI Phase 2 Handoff

<!-- 中文说明：本文档用于给后续新开的 Codex 对话交接项目状态，重点保护已经完成的旗舰级前端静态原型，并明确 Phase 2 只做后端与数据库地基。 -->

This document is the working handoff for the next SingFlow AI development conversation. It summarizes what has already been completed, what Phase 2 should build, and which boundaries must remain intact.

## 1. Project Overview

<!-- 中文说明：这一节说明产品身份，防止 Phase 2 把项目误做成普通聊天框、普通点歌系统或后台管理面板。 -->

| Field | Value |
| --- | --- |
| Project name | SingFlow AI |
| Positioning | AI Native Karaoke & Music Workflow Studio |
| Primary scenarios | KTV, in-car entertainment, home music devices |
| Current phase target | Backend & Database Foundation |

SingFlow AI is an AI-native music scene orchestration platform. It is not a simple chatbot, not a traditional karaoke ordering system, and not a generic admin dashboard.

Core capabilities the product is designed to support:

1. Natural-language scene orchestration.
2. Fictional song metadata search.
3. Multi-person taste fusion.
4. Scene playlist generation.
5. Explainable recommendation reasons.
6. Feedback memory.
7. Agent tool-call visualization.

Phase 2 should strengthen the backend foundation for these capabilities while preserving the existing frontend prototype.

## 2. Completed Phases

<!-- 中文说明：这一节记录已完成 checkpoint，后续 Codex 不应重复初始化或重做前端静态原型。 -->

### Phase Summary

| Phase | Status | Completed Work |
| --- | --- | --- |
| Phase 0 | Completed and committed | Monorepo foundation, `apps/web`, `apps/api`, Docker Compose, env examples, CI, MIT License |
| Phase 1 | Completed and committed | Advanced frontend static prototype with six core screenshot-grade pages |
| Phase 1.1 | Completed and committed as part of frontend prototype work | Visual polish for Studio Home, Timeline, Mixer, Agent Console, and Dashboard |
| Phase 1.2 | Completed and committed | Screenshot-level refinement, README screenshot placeholders, portfolio-ready frontend review state |

### Recent Git Checkpoints

`git log --oneline -5` currently shows:

| Commit | Message |
| --- | --- |
| `7615fbc` | `chore: polish static prototype for portfolio screenshots` |
| `ff35b92` | `feat: build flagship static frontend prototype` |
| `8ae93b7` | `chore: initialize SingFlow AI phase 0 foundation` |

Latest known commit:

```text
7615fbc chore: polish static prototype for portfolio screenshots
```

If future work starts from a different state, run `git status --short` before making changes and confirm whether any Phase 1.2 changes are still uncommitted.

## 3. Current Frontend Status

<!-- 中文说明：这一节用于保护 Phase 1 已完成的作品集级静态前端，Phase 2 不应重设计页面或破坏截图质量。 -->

The frontend is a portfolio-grade static prototype using mock data only.

Completed routes:

| Route | Page |
| --- | --- |
| `/` | Studio Home |
| `/planner` | AI Session Planner |
| `/timeline` | Playlist Timeline |
| `/sessions/demo` | Demo Session Alias using the timeline surface |
| `/mixer` | Group Taste Mixer |
| `/agent-runs/demo` | Agent Console Preview |
| `/dashboard` | Dashboard / Feedback Memory |

Current frontend facts:

1. All pages use mock data.
2. No page calls a real backend API.
3. No page calls an LLM provider.
4. No page connects to a database.
5. No page includes real music, lyrics, MV files, real album covers, copied brand logos, or unauthorized brand assets.
6. The frontend is already suitable for portfolio review and README screenshot preparation.

Important frontend locations:

| Path | Purpose |
| --- | --- |
| `apps/web/app` | Next.js App Router pages and route surfaces |
| `apps/web/components` | App shell, studio components, dashboard surfaces, visual primitives |
| `apps/web/lib/mock-data.ts` | Phase 1 static mock records |
| `apps/web/lib/studio-store.ts` | Local Zustand studio selection state |

Phase 2 should not redesign the frontend. If typed API clients are explicitly approved later, add them carefully without changing the visual layout, interaction structure, or screenshot quality.

## 4. Current Backend Status

<!-- 中文说明：这一节说明后端目前只是 Phase 0 骨架，Phase 2 的任务是补齐数据库、模型、路由和服务层。 -->

`apps/api` currently contains a FastAPI skeleton.

Existing backend foundation:

| Area | Current Status |
| --- | --- |
| FastAPI app | Exists |
| Root health check | `/health` exists |
| Versioned health check | `/api/v1/health` exists |
| Pydantic settings | Exists |
| SQLAlchemy base/session structure | Exists |
| Redis client structure | Exists |
| Alembic directory | Exists |
| Basic test file | May exist, but must not be run in the known unstable local shell |

Not completed yet:

1. Business SQLAlchemy models.
2. Alembic business migration.
3. PostgreSQL business schema.
4. Seed data.
5. Repository layer.
6. Service layer.
7. API routers matching `docs/API_SPEC.md`.
8. Feedback memory persistence.
9. Agent run persistence.
10. Recommendation reason persistence.

## 5. Important Environment Notes

<!-- 中文说明：这一节记录当前本机环境限制，尤其是 pytest 在 Windows/PowerShell/Anaconda shell 中卡住的问题。 -->

Known local environment notes:

| Item | Current Local State | Project Target / Guidance |
| --- | --- | --- |
| Node.js | `v20.13.1` | Target Node.js `22+` |
| Python | `3.9.13` / Anaconda | Target Python `3.12+` |
| pytest | Previously hung in Windows / PowerShell / Anaconda shell | Do not run pytest until a clean Python 3.12 venv is prepared |
| Frontend preview | Often uses port `3001` | Use `3001` when old `3000` preview state is stale |
| Next preview | `next dev` was unstable in the current shell | `build + start` preview has been more reliable |

New Codex conversations must not run:

```bash
pytest
python -m pytest
pytest --version
python -m pytest --version
```

Phase 2 should preferably be validated through Docker Compose or a clean Python 3.12 virtual environment.

## 6. Phase 2 Goal

<!-- 中文说明：这一节定义 Phase 2 的边界：只做后端和数据库基础，不接真实 LLM，也不实现高级推荐算法。 -->

Phase 2 name:

```text
Backend & Database Foundation
```

Phase 2 goal:

Build the backend and database foundation for SingFlow AI without connecting real LLM providers and without implementing advanced recommendation algorithms.

Phase 2 should complete:

1. SQLAlchemy models.
2. Alembic migration.
3. PostgreSQL schema.
4. Seed data for at least 80 fictional songs.
5. Demo users.
6. Group members.
7. Taste profiles.
8. Karaoke sessions.
9. Playlists.
10. Playlist items.
11. Feedback logs.
12. Agent runs.
13. Agent steps.
14. Recommendation reasons.
15. Pydantic schemas.
16. FastAPI routers matching `docs/API_SPEC.md`.
17. Repository layer.
18. Service layer.
19. Mock-only API responses.
20. Database bootstrap script.
21. Docker Compose database verification.

## 7. Phase 2 Database Scope

<!-- 中文说明：这一节要求 Phase 2 的数据库实现严格对齐 DATABASE_SCHEMA.md，尤其是枚举、0-1 分数约束和版权安全字段。 -->

Phase 2 database work must align with `docs/DATABASE_SCHEMA.md`.

Core tables:

| Table | Purpose |
| --- | --- |
| `songs` | Demo-safe fictional or licensed metadata only |
| `users` | Demo users and profile owners |
| `group_members` | Session participants and preference weights |
| `taste_profiles` | Derived user preference memory |
| `karaoke_sessions` | Scene workflow sessions |
| `playlists` | Playlist containers |
| `playlist_items` | Ordered song recommendations |
| `feedback_logs` | Immutable feedback events |
| `agent_runs` | AI workflow run records |
| `agent_steps` | Ordered tool-call and workflow step records |
| `recommendation_reasons` | Explanations tied to playlist items |

Database rules Phase 2 must preserve:

1. `songs.scene_tags` must exist.
2. `songs.language` must use `en`, `zh`, `cantonese`, or `mixed`.
3. `karaoke_sessions.scene_type` must use `ktv`, `car`, `home_party`, or `custom`.
4. Status fields must use constrained values documented in `docs/DATABASE_SCHEMA.md`.
5. Score fields must respect `0` to `1` constraints.
6. Seed data must be copyright-safe and fictional.
7. No table should store lyrics, audio URLs, MV URLs, real album cover URLs, or unauthorized media assets.

Important status values:

| Table | Field | Allowed Values |
| --- | --- | --- |
| `karaoke_sessions` | `status` | `draft`, `active`, `ended`, `archived` |
| `playlists` | `status` | `draft`, `generated`, `edited`, `archived` |
| `agent_runs` | `status` | `queued`, `running`, `succeeded`, `failed`, `cancelled` |
| `agent_steps` | `status` | `queued`, `running`, `succeeded`, `failed`, `skipped` |

## 8. Phase 2 API Scope

<!-- 中文说明：这一节定义 Phase 2 API 范围，公开会话接口必须使用 /karaoke-sessions，/sessions/demo 仅是前端路由。 -->

Phase 2 API work must align with `docs/API_SPEC.md`.

The public API base is:

```text
/api/v1
```

Phase 2 API should include at least:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/songs` | Search and filter song metadata |
| `GET` | `/songs/{song_id}` | Return one song metadata record |
| `POST` | `/songs/import` | Import safe fictional song metadata |
| `POST` | `/songs` | Create one safe song metadata record |
| `PATCH` | `/songs/{song_id}` | Update safe song metadata fields |
| `GET` | `/demo-users` | List demo users |
| `GET` | `/users/{user_id}/taste-profiles` | List one user's taste profiles |
| `GET` | `/users/{user_id}/feedback-summary` | Return aggregated user feedback signals |
| `GET` | `/karaoke-sessions` | List karaoke sessions |
| `POST` | `/karaoke-sessions` | Create a karaoke session |
| `GET` | `/karaoke-sessions/{session_id}` | Return session detail |
| `PATCH` | `/karaoke-sessions/{session_id}` | Update session metadata or status |
| `POST` | `/karaoke-sessions/{session_id}/members` | Add a member to a session |
| `GET` | `/karaoke-sessions/{session_id}/members` | List session members |
| `POST` | `/karaoke-sessions/{session_id}/taste-fusion` | Return mock or deterministic taste fusion |
| `POST` | `/playlists/generate` | Generate mock-only playlist response and persisted records |
| `GET` | `/playlists/{playlist_id}` | Return playlist detail with items and reasons |
| `POST` | `/feedback` | Create feedback log |
| `GET` | `/karaoke-sessions/{session_id}/feedback` | List session feedback logs |
| `GET` | `/agent-runs` | List agent runs |
| `GET` | `/agent-runs/{agent_run_id}` | Return one agent run summary |
| `GET` | `/dashboard/overview` | Return high-level product metrics |
| `GET` | `/dashboard/taste-evolution` | Return taste profile evolution metrics |
| `GET` | `/dashboard/agent-performance` | Return agent performance metrics |

API route rules:

1. Backend public APIs must use `/karaoke-sessions`, not `/sessions`.
2. `/sessions/demo` is only a frontend route.
3. API responses can be mock-backed or database-backed in Phase 2.
4. Phase 2 must not call real LLM providers.
5. API errors must use the structured error envelope from `docs/API_SPEC.md`.
6. API responses must not include lyrics, audio URLs, MV URLs, real cover art, secrets, raw provider payloads, or stack traces.

Note: `docs/API_SPEC.md` also documents `GET /agent-runs/{agent_run_id}/steps`, `GET /agent-runs/{agent_run_id}/events`, and `GET /dashboard/agent-runs`. These may be added in Phase 2 if they are useful and remain mock/database-backed, but they are not a reason to enter real Agent execution work.

## 9. Seed Data Requirements

<!-- 中文说明：这一节是 seed 数据的版权安全边界，优先做丰富 mock 元数据，不追求真实歌曲或真实素材。 -->

MVP seed data must include at least 80 fictional songs.

Seed data must not include:

1. Lyrics.
2. Audio files.
3. MV links.
4. Real album covers.
5. Scraped assets.
6. Real copyrighted cover art.
7. Pirate links.
8. Copied brand logos or unauthorized assets.

Allowed seed data:

1. Fictional song titles.
2. Fictional artist names.
3. Metadata-only song records.
4. CSS-generated or abstract cover seeds for frontend visuals.

Seed songs should cover:

| Dimension | Required Coverage |
| --- | --- |
| Languages | `en`, `zh`, `cantonese`, `mixed` |
| Scene tags | `ktv`, `car`, `home_party`, `warmup`, `chorus`, `nostalgic`, `high_energy`, `late_night` |
| Metadata | Genres, moods, energy, vocal difficulty, duration, optional BPM |
| Rights | `source_type = mock`, `rights_status = demo_safe` for default seed records |

Phase 2 seed data should prioritize metadata richness over realism. The goal is to support credible frontend/API demos safely.

## 10. Phase 2 Hard Boundaries

<!-- 中文说明：这一节是硬边界，后续实现时如果需求想越界，应先回到 owner 确认。 -->

Do not:

1. Introduce lyrics, audio, MV, real album covers, pirate links, brand logos, or unauthorized assets.
2. Hardcode API keys.
3. Change `LLM_PROVIDER=mock` as the default.
4. Connect OpenAI, Claude, Gemini, or other real LLM providers.
5. Implement Phase 3 real AI playlist generation.
6. Implement Phase 4 advanced multi-person recommendation algorithms.
7. Implement Phase 5 real Agent workflow execution.
8. Redesign the Phase 1 frontend.
9. Delete, restructure, or rename existing frontend pages.
10. Rename public API routes away from `/karaoke-sessions`.
11. Run pytest in the known unstable local Anaconda shell.
12. Modify files outside the SingFlow AI repository root.

Mock-only services are allowed in Phase 2 when they create typed, persisted, auditable backend foundations without real provider calls.

## 11. Recommended Phase 2 Implementation Order

<!-- 中文说明：这一节给新 Codex 对话一个安全执行顺序，先读文档和计划，再编码，最后验证。 -->

Recommended order for the next Codex conversation:

1. Read `AGENTS.md`, `README.md`, `docs/PHASE_2_HANDOFF.md`, `docs/DATABASE_SCHEMA.md`, and `docs/API_SPEC.md`.
2. Run `git status` and `git log --oneline -5`.
3. Inspect `apps/api` structure.
4. Create a Phase 2 implementation plan before coding.
5. Implement SQLAlchemy models.
6. Create Alembic migration.
7. Implement Pydantic schemas.
8. Implement repositories and services.
9. Implement FastAPI routers.
10. Add seed script with 80 fictional songs and demo users.
11. Verify Docker Compose database startup.
12. Only then consider small frontend typed API client preparation, if explicitly approved.

Suggested backend layering:

| Layer | Guidance |
| --- | --- |
| Models | Keep field names aligned with `docs/DATABASE_SCHEMA.md` |
| Schemas | Keep response shapes aligned with `docs/API_SPEC.md` |
| Repositories | Keep SQL/database access isolated from routes |
| Services | Put validation, bootstrap, mock generation, and persistence orchestration here |
| Routers | Validate request shape, call services, return DTOs |
| Seeds | Idempotent, fictional, metadata-rich, copyright-safe |

## 12. Phase 2 Acceptance Criteria

<!-- 中文说明：这一节定义 Phase 2 完成标准，尤其要保护前端原型、mock 模式和版权安全。 -->

Phase 2 is complete only when:

1. Database schema exists and aligns with `docs/DATABASE_SCHEMA.md`.
2. Alembic migration exists.
3. Seed script creates at least 80 fictional songs.
4. Demo users and taste profiles exist.
5. Core API routes match `docs/API_SPEC.md`.
6. `/health` and `/api/v1/health` still work.
7. Docker Compose can start PostgreSQL and Redis.
8. No real API keys are committed or hardcoded.
9. No copyrighted media is added.
10. No real LLM calls are made.
11. Frontend visual prototype remains intact.
12. README or docs are updated with Phase 2 backend setup instructions.
13. Tests are run only in a clean Python 3.12 virtual environment or CI, not in the known unstable local shell.

Recommended verification once a clean environment exists:

```bash
python3.12 -m venv .venv
pip install -r apps/api/requirements.txt
python -m pytest
```

For local service verification:

```bash
docker compose up --build
```

Do not run those commands in the known unstable Anaconda shell unless the environment has been fixed.

## 13. Files New Codex Must Read First

<!-- 中文说明：这一节列出新对话必须先读的文件，避免凭空实现或和当前文档契约冲突。 -->

New Codex conversations must read these files before Phase 2 planning or coding:

1. `AGENTS.md`
2. `README.md`
3. `docs/PRODUCT_REQUIREMENTS.md`
4. `docs/TECH_ARCHITECTURE.md`
5. `docs/DATABASE_SCHEMA.md`
6. `docs/API_SPEC.md`
7. `docs/ROADMAP.md`
8. `docs/PHASE_2_HANDOFF.md`

## 14. Recommended First Prompt for New Codex Conversation

<!-- 中文说明：这一节可以直接复制到新对话中，先让 Codex 做 Phase 2 计划，不要直接写代码。 -->

Use this as the first message in a new Codex conversation:

```text
You are continuing the SingFlow AI project.
Phase 0, Phase 1, Phase 1.1, and Phase 1.2 are completed.
Do not write code yet.
First read AGENTS.md, README.md, docs/PHASE_2_HANDOFF.md, docs/DATABASE_SCHEMA.md, docs/API_SPEC.md, docs/TECH_ARCHITECTURE.md, and docs/ROADMAP.md.
Then run git status, git log --oneline -5, inspect apps/api, and output a Phase 2 Backend & Database Foundation implementation plan.
Do not run pytest.
Do not enter Phase 3.
Do not connect real LLM providers.
Do not modify the frontend visual prototype.
Wait for owner approval before coding.
```

