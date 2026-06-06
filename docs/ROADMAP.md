# SingFlow AI Roadmap

<!-- 中文说明：本文档把项目拆成可交给 Codex 执行的阶段计划，确保每个阶段都有目标、任务、验收标准和边界。 -->

## 1. Roadmap Principles

<!-- 中文说明：这一节定义路线图执行原则，强调先做真实工作流，再做展示包装。 -->

1. Build a real workflow studio before adding decorative polish.
2. Keep every phase demoable.
3. Preserve mock mode so the project can run without paid AI credentials.
4. Update docs whenever architecture, API, schema, or behavior changes.
5. Never add copyrighted lyrics, audio, MV links, copied logos, or scraped platform assets.

## 2. Phase Overview

<!-- 中文说明：这一节提供阶段总览，后续任务应尽量按 Phase 顺序推进。 -->

| Phase | Name | Main Outcome |
| --- | --- | --- |
| Phase 0 | Project initialization | Repo, tooling, docs, conventions |
| Phase 1 | Advanced frontend static prototype | Polished studio UI with mock data |
| Phase 2 | Backend and database | FastAPI, PostgreSQL, Redis, schema |
| Phase 2F | GitHub portfolio packaging | README polish, screenshot guide, API demo flow docs |
| Phase 2G | Backend Docker runtime verification | Local Docker backend runtime and API smoke checks passed |
| Phase 3 | Interactive product workflow | Mock-only Planner, Mixer, Feedback Memory, and end-to-end local verification |
| Phase 4 | Final portfolio packaging | Copy polish, screenshot refresh, README final packaging |
| Phase 5 | Future LLM adapter | Optional provider adapter planning only; not implemented in the current portfolio package |

### Phase Execution Flow

```mermaid
flowchart LR
  A["Pick Phase"] --> B["Confirm Scope"]
  B --> C["Implement Small Vertical Slice"]
  C --> D["Run Verification"]
  D --> E["Update Docs"]
  E --> F["Report Run and Test Steps"]
```

Executable rules:

1. Do phases in order unless the project owner explicitly reprioritizes.
2. Keep each phase demoable before starting the next one.
3. Do not skip docs updates when behavior, API, schema, setup, or design direction changes.
4. Do not add copyrighted content at any phase.

## 3. Phase 0: Project Initialization

<!-- 中文说明：Phase 0 只做项目基础设施和文档，不应擅自改 Git 历史或写业务功能。 -->

### Goal

Create a professional monorepo foundation for SingFlow AI.

### Tasks

| Task | Output |
| --- | --- |
| Initialize Git repository if needed | If the repository is not initialized, initialize Git only after owner approval. Do not modify existing Git history |
| Create monorepo structure | `apps/web`, `apps/api`, `docs`, root config |
| Add README | Product intro, stack, local setup placeholder |
| Add docs | Product, design, architecture, schema, API, roadmap |
| Add AGENTS.md | Codex development rules |
| Add env examples | `.env.example` without secrets |
| Choose package manager | Document `pnpm`, `npm`, or chosen tool |

### Acceptance Criteria

1. Repo has clear root structure.
2. Documentation files exist and agree on stack and modules.
3. No API keys, copyrighted media, lyrics, or cloned assets are committed.
4. README explains the project positioning in one minute.

### Not Doing

1. No production auth.
2. No real music streaming.
3. No backend business logic beyond scaffolding.

## 4. Phase 1: Advanced Frontend Static Prototype

<!-- 中文说明：Phase 1 是作品集门面，必须优先交付截图级高级前端，而不是普通 admin dashboard。 -->

### Goal

Build a visually polished, screenshot-grade static prototype that demonstrates the studio workflow using mock data.

Required screenshot-grade pages:

| Page | Required Focus |
| --- | --- |
| Studio Home | Studio-first home with optional Hero Studio visuals, prompt composer, playlist/Agent preview |
| AI Session Planner | Scenario planning controls, constraints, and session setup |
| Playlist Timeline | Ordered music timeline, energy curve, recommendation reasons |
| Group Taste Mixer | Member weights, preference fusion, conflict summaries |
| Agent Console Preview | Tool-call timeline, step states, latency, and run summary |
| Dashboard / Feedback Memory | Metrics, feedback distribution, taste profile evolution |

Each required page must include mock data, empty state, loading state, hover state, and mobile adaptation.

### Tasks

| Task | Output |
| --- | --- |
| Implement app shell | Sidebar, top bar, studio grid |
| Implement prompt composer | Scene prompt and generation action |
| Implement playlist stream | Mock playlist cards with scores and reasons |
| Implement inspector | Selected item detail and feedback controls |
| Implement Agent preview | Static step timeline |
| Implement dashboard page | Mock metrics and charts |
| Implement responsive views | Desktop and mobile layouts |
| Capture screenshots | README-ready images |
| Build required page states | Mock data, empty, loading, hover, and mobile states for all six required pages |

### Acceptance Criteria

1. First screen is a usable SingFlow AI Studio with optional portfolio-grade Hero Studio visuals.
2. UI follows `docs/DESIGN_SYSTEM.md`.
3. No layout overlap at common desktop and mobile widths.
4. Mock data uses fictional songs and demo artists only.
5. The prototype clearly communicates AI workflow orchestration, not a simple chat bot.
6. UI must not look like a generic CRUD admin dashboard.
7. Each required page must be suitable for GitHub README or portfolio screenshots.

### Not Doing

1. No real API calls.
2. No real LLM integration.
3. No copyrighted album art or audio.

## 5. Phase 2: Backend and Database

<!-- 中文说明：Phase 2 建立 FastAPI、PostgreSQL、Redis 和 seed data，公开会话 API 必须使用 `/karaoke-sessions`。 -->

### Goal

Create FastAPI backend, PostgreSQL schema, Redis connection, and seed data.

### Tasks

| Task | Output |
| --- | --- |
| Scaffold FastAPI app | `apps/api` with health check and OpenAPI |
| Add database models | Tables from `docs/DATABASE_SCHEMA.md` |
| Add migrations | Reproducible schema creation |
| Add seed script | At least 80 demo-safe fictional songs and demo users |
| Add Redis client | Health check and cache utility |
| Implement base APIs | Songs, `/karaoke-sessions`, members, playlists read |
| Add Docker Compose | `web`, `api`, `postgres`, `redis` |

### Acceptance Criteria

1. `docker compose up --build` starts core services or documented equivalent works.
2. `/docs` exposes typed FastAPI endpoints.
3. Migrations create all required tables.
4. Seed data includes at least 80 fictional songs for MVP.
5. Seed data covers `en`, `zh`, `cantonese`, and `mixed`.
6. Seed data covers `ktv`, `car`, `home_party`, `warmup`, `chorus`, `nostalgic`, `high_energy`, and `late_night`.
7. API does not expose lyrics, audio URLs, MV links, real album covers, scraped assets, or unsafe content.

### Not Doing

1. No advanced recommendation engine yet.
2. No production-grade auth.
3. No external music platform scraping.

### Current Phase 2 Packaging Status

Phase 2 has also added portfolio-facing packaging docs:

| Area | Status |
| --- | --- |
| GitHub README polish | Phase 2F documentation checkpoint prepared |
| Demo data docs | Completed with 96 fictional songs and mock/database-backed graph |
| Runtime verification guide | Completed |
| Docker/Postgres/API smoke verification | Phase 2G completed locally |
| Frontend API client foundation | Phase 2H-1 completed with GET-only wrappers |
| Dashboard partial API integration | Phase 2H-2 completed for backend overview and Agent run aggregates with mock fallback |
| Agent Console partial API integration | Phase 2H-3 completed for persisted Agent Run and Agent Step GET data with mock fallback |
| Sessions / Timeline partial API integration | Phase 2H-4 completed for karaoke session metadata and members with mock fallback |
| Phase 2H local runtime verification | Completed for Dashboard, Agent Console, Timeline, and Sessions partial GET integrations with manual connected and fallback checks |
| Phase 3A local runtime verification | Completed for Planner mock generation through backend direct POST and manual browser checks |
| Phase 3B Mixer interactive fusion | Completed for controlled mock taste fusion with member data and mock fallback |
| Phase 3B local runtime verification | Completed for Mixer mock taste fusion through backend direct POST and manual browser checks |
| Phase 3C Feedback Memory loop | Completed for controlled metadata-only feedback logging and dashboard aggregate refetch |
| Phase 3C local runtime verification | Completed for Dashboard feedback memory through backend direct POST and manual browser checks |
| Phase 3D end-to-end workflow verification | Completed locally for mock-only Planner, Agent readback, Timeline / Sessions smoke, Mixer, Dashboard feedback, and fallback route smoke |

Phase 2G verified:

1. Docker Compose config.
2. PostgreSQL and Redis health.
3. API image build and API container startup.
4. Alembic migration.
5. Demo bootstrap dry-run and normal mode.
6. Health, core API, and dynamic API smoke flows.

Follow-up work after Phase 3D:

1. Phase 4A README and core docs copy polish.
2. Phase 4B screenshot refresh after copy polish.
3. Phase 4C consistency audit for links, claims, and screenshot references.
4. Phase 4D final packaging verification.
5. Keep any optional DeepSeek / LLM provider adapter as Future Work only unless explicitly approved in a later phase.

## 6. Phase 3: AI Playlist Generation

<!-- 中文说明：Phase 3 让 Agent 工作流真正产生歌单、理由和持久化步骤。 -->

### Goal

Implement the end-to-end playlist generation workflow with Agent Run persistence.

### Tasks

| Task | Output |
| --- | --- |
| Phase 3A Planner interactive workflow | Planner calls controlled mock playlist generation and displays a generated preview |
| Build agent workflow service | Parse, search, rank, build, explain, persist |
| Implement mock provider | Deterministic output without API key |
| Add LLM provider adapter | Environment-based optional provider |
| Implement `/playlists/generate` | Creates playlist, items, reasons, agent run |
| Persist agent steps | Tool-call timeline saved to database |
| Add frontend integration | Studio calls API and displays returned playlist |

### Current Phase 3A Status

| Area | Status |
| --- | --- |
| Planner mock-only interactive workflow | Completed |
| Controlled playlist generation mutation | `generatePlaylist()` calls only `POST /api/v1/playlists/generate` with `mode=mock` |
| Local browser CORS for Planner generation | Allows local dev `POST` from the frontend origin for controlled mock generation |
| Runtime verification | Completed locally: backend direct generation passed, browser `/planner` showed generated preview, Agent status `succeeded`, and deterministic mock workflow wording |
| Planner fallback | Existing mock planning preview remains available when backend is unavailable |
| Timeline / Agent Console data flow | Unchanged; links remain review entry points |

### Current Phase 3B Status

| Area | Status |
| --- | --- |
| Mixer mock-only interactive fusion | Completed |
| Controlled taste-fusion mutation | `runTasteFusion()` calls only `POST /api/v1/karaoke-sessions/{session_id}/taste-fusion` |
| Member data | Mixer can use backend session members and preference weights when available |
| Mixer fallback | Existing mock mixer preview remains available when backend is unavailable |
| Runtime verification | Completed locally: backend direct taste-fusion passed, browser `/mixer` showed backend members, local fusion state, fusion field / confidence updates, deterministic mock fusion wording, compromise matrix, and conflict / playlist compromise text |
| Planner / Timeline / Agent Console data flow | Unchanged |

### Current Phase 3C Status

| Area | Status |
| --- | --- |
| Feedback Memory write/read loop | Completed on Dashboard |
| Controlled feedback mutation | `submitFeedback()` calls only `POST /api/v1/feedback` |
| Feedback readback | Dashboard can read recent session feedback through `GET /karaoke-sessions/{session_id}/feedback` |
| Aggregate refresh | Successful feedback writes refetch `GET /dashboard/overview` |
| Planner / Mixer / Timeline / Agent Console data flow | Unchanged |
| Runtime verification | Completed locally: backend direct feedback POST passed, dashboard aggregates increased, browser `/dashboard` showed memory signal logged / recorded state, and recent memory signal updated |

### Current Phase 3D Status

| Area | Status |
| --- | --- |
| End-to-end local workflow verification | Completed |
| Backend E2E checks | Mock playlist generation, generated playlist readback, Agent run / steps readback, mock taste fusion, metadata-only feedback write, and feedback read-after-write passed |
| Frontend route smoke | `/`, `/planner`, `/agent-runs/demo`, `/timeline`, `/sessions/demo`, `/mixer`, and `/dashboard` returned HTTP 200 with key text |
| Fallback route smoke | Key pages returned HTTP 200 after a non-destructive API stop, and the API was restored afterward |
| Hydrated browser interactions | Not automated in Phase 3D; key Planner / Mixer / Dashboard clicks were manually confirmed during Phase 3A / 3B / 3C runtime verification |
| Known limitations | Studio Home remains mock-first; Timeline phase/song cards remain mock-safe visual preview; Mixer fusion is not a persisted Agent workflow; feedback memory is not model training |

## 7. Phase 4: Final Portfolio Packaging

<!-- 中文说明：Phase 4 将当前已验证的本地 mock-only 产品闭环包装成适合 GitHub、简历和面试展示的作品集项目。 -->

### Current Phase 4 Status

| Area | Status |
| --- | --- |
| Phase 4A Copy polish | Completed: README and core docs were tightened for portfolio presentation |
| Phase 4B Screenshot refresh | Completed: six core portfolio screenshots were refreshed after copy polish |
| Phase 4C Consistency audit | In progress |
| Phase 4D Final packaging verification | Pending |

### Phase 4 Packaging Goals

1. Present SingFlow AI as an AI Native Karaoke & Music Workflow Studio.
2. Keep the project positioning local, deterministic, mock-only, and metadata-only.
3. Show the full-stack architecture without implying a live LLM provider or real music platform.
4. Keep refreshed screenshot references valid after copy polish.
5. Keep known limitations visible and honest.

### Phase 4 Boundaries

1. Do not modify backend business logic or frontend workflow code as part of copy polish.
2. Do not add real LLM providers, API keys, or real music catalog data.
3. Do not describe Timeline phase/song cards as using generated playlist runtime placement.
4. Do not claim Mixer taste fusion is persisted as an Agent workflow.
5. Do not describe feedback memory as model learning or model updates.

### Acceptance Criteria For Current Workflow

1. Generating a playlist creates `agent_runs`, `agent_steps`, `playlists`, `playlist_items`, and `recommendation_reasons`.
2. Mock mode works with no API key.
3. Each playlist item has at least one reason.
4. Failed local mock generation calls fall back to deterministic preview where possible.
5. Agent output is visible in frontend.

### Not Doing

1. No free-form chat interface as the main flow.
2. No opaque recommendations without stored reasons.
3. No API key committed to the repository.

## 8. Historical Plan: Multi-Person Preference Fusion

This section is retained as historical roadmap context. The current implemented Mixer workflow lives in Phase 3B, and the current Phase 4 scope is final portfolio packaging.

<!-- 中文说明：Phase 4 展示多人偏好融合能力，是区别于普通点歌系统的重要模块。 -->

### Goal

Add group members, weighted preference fusion, and explainable compromise logic.

### Tasks

| Task | Output |
| --- | --- |
| Add member management UI | Add/remove/edit session members |
| Implement taste fusion service | Weighted merge of profiles and hints |
| Add fusion endpoint | `/karaoke-sessions/{id}/taste-fusion` |
| Visualize conflicts | Energy, language, genre trade-offs |
| Connect fusion to ranking | Group profile affects playlist scores |

### Acceptance Criteria

1. Session can include multiple members with weights.
2. Fusion output is inspectable in UI.
3. Recommendation scores reflect group preferences.
4. Conflicts are summarized without blaming users.
5. Single-member sessions still work.

### Not Doing

1. No social graph.
2. No account invitation system.
3. No complex permission model.

## 9. Historical Plan: Agent Console

<!-- 中文说明：Phase 5 是 AI 全栈能力展示页，必须基于持久化 agent_runs 和 agent_steps。 -->

### Goal

Historical context only. Agent Console partial backend integration and runtime verification are already complete in Phase 2H-3 and Phase 3D.

### Tasks

| Task | Output |
| --- | --- |
| Build Agent Console route | `/agent-runs/[id]` |
| Add timeline component | Ordered steps, status, latency |
| Add step inspector | Input/output summaries and errors |
| Add dashboard linkage | Recent runs link to console |
| Optional streaming | SSE endpoint for active runs |

### Acceptance Criteria

1. Every generated playlist links to its Agent Run.
2. Console displays step order, status, tool name, latency, and summaries.
3. Failed steps render clear error states.
4. Tool calls are understandable to a recruiter without reading backend code.
5. Sensitive provider payloads and secrets are not shown.

### Not Doing

1. No raw chain-of-thought display.
2. No exposing secret keys or provider internals.
3. No fake steps disconnected from persisted data.

## 10. Historical Plan: Feedback Memory

<!-- 中文说明：Phase 6 完成从用户反馈到偏好记忆的闭环，反馈日志必须先于画像更新。 -->

### Goal

Historical context only. The current Dashboard feedback memory write/read loop is implemented and runtime-verified in Phase 3C, with metadata-only feedback logging.

### Tasks

| Task | Output |
| --- | --- |
| Implement feedback API | `POST /feedback`, `GET /karaoke-sessions/{session_id}/feedback` |
| Add feedback UI | Like, skip, too slow, too intense, wrong language |
| Implement memory update service | Small profile deltas with recency |
| Show taste profile view | Current affinities and confidence |
| Add dashboard charts | Feedback distribution and taste evolution |

### Acceptance Criteria

1. Feedback writes immutable `feedback_logs`.
2. Taste profiles update after feedback.
3. Future playlist generation uses updated profiles.
4. Dashboard shows feedback and memory signals.
5. Failed profile updates do not erase feedback logs.

Phase 3C provides the first frontend slice of this loop in Dashboard with controlled metadata-only feedback logging. It does not change recommendation strategy, run playlist generation, run taste fusion, or connect a real LLM.

### Not Doing

1. No invasive personal data collection.
2. No hidden profile mutation without logged feedback.
3. No irreversible destructive feedback actions.

## 11. Future Work: Optional Provider And Hosting Hardening

<!-- 中文说明：Phase 7 把项目包装成可展示、可运行、可审查的旗舰作品集仓库。 -->

### Goal

Track future work that is not implemented in the current portfolio package.

### Tasks

| Task | Output |
| --- | --- |
| Optional README maintenance | Keep product story, screenshots, architecture, and setup aligned as the project evolves |
| Optional hosting notes | Future environment hardening after local portfolio packaging |
| Add demo script | Recruiter walkthrough path |
| Optional screenshot additions | Extra detail screenshots, demo GIFs, or walkthrough media if needed |
| Optional catalog expansion | Future fictional metadata expansion only |
| Add tests | API service tests and critical UI tests |
| Add license | Appropriate open-source license |
| Add contribution notes | Safety and content rules |

### Acceptance Criteria

1. A new reviewer can run the project locally from README.
2. Screenshots show polished product surfaces.
3. Docs are consistent with implemented behavior.
4. Docker demo path works.
5. Repository contains no secrets or copyrighted music assets.
6. Flagship seed data includes at least 150 fictional songs.

### Not Doing

1. No pretending the demo has music rights it does not have.
2. No real provider integration in the current Phase 4 package.
3. No unfinished screenshots from broken UI states.

## 12. Development Handoff Format for Codex

<!-- 中文说明：这一节规定后续给 Codex 派发任务的格式，便于按阶段执行和验收。 -->

Every phase task given to Codex should include:

| Field | Example |
| --- | --- |
| Phase | `Phase 3` |
| Goal | `Implement mock agent workflow` |
| Files allowed | `apps/api/app/services`, `docs` |
| Acceptance criteria | `Creates agent_runs and playlist_items` |
| Verification | `Run API tests and manual generation request` |

Each completed phase must report:

1. Changed files.
2. How to run locally.
3. How it was tested.
4. Any docs updated.
5. Known limitations.
