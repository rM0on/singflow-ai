# SingFlow AI 中文项目简介

## 项目简介

SingFlow AI 是一个 AI Native K 歌与音乐场景工作流平台原型，面向 KTV、车载娱乐、家庭音乐设备和多人聚会音乐场景。

它不是普通聊天机器人，也不是普通点歌系统。项目重点不是让用户和一个聊天框对话，而是把“一个模糊的音乐场景需求”转化成可解释、可追踪、可反馈的音乐工作流：理解场景、融合多人偏好、生成场景歌单、保存推荐理由、记录反馈、展示 Agent 工具调用过程。

## 面向场景

- KTV 包厢：多人一起唱歌，需要兼顾语言、难度、气氛和公平性。
- 车载娱乐：通勤、夜路、旅行等场景，需要根据氛围和能量曲线生成音乐队列。
- 家庭音乐设备：家庭聚会、客厅背景音乐、轻量场景推荐。
- 多人聚会音乐场景：不同成员偏好不同，需要融合偏好并解释取舍。

## 核心功能

- 自然语言场景规划：用一句话描述 KTV、车载或家庭音乐场景。
- 多人偏好融合：基于成员权重和 taste profiles 生成可解释的融合结果。
- 场景歌单生成：生成有顺序、有能量曲线、有推荐依据的 playlist。
- 推荐理由：每个 playlist item 都有原创、版权安全的推荐说明。
- 反馈日志：用户反馈先写入 `feedback_logs`，再作为后续记忆更新基础。
- 偏好记忆基础：当前阶段提供 feedback memory foundation，不做真实高级画像学习。
- Agent 工具调用可视化：通过 `agent_runs` 和 `agent_steps` 展示工作流过程。
- Dashboard 洞察：展示 sessions、feedback、Agent runs 等数据库聚合指标。

## 技术架构

前端：

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-inspired components
- Framer Motion
- Recharts
- Zustand

后端：

- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- PostgreSQL
- Redis

后端采用分层设计：

- `api/routes`：FastAPI routers
- `schemas`：typed request / response models
- `services`：业务协调和 deterministic mock workflow
- `repositories`：数据库读写
- `db/models.py`：SQLAlchemy models
- `data` / `scripts`：demo metadata 和 bootstrap script

数据层当前包含 96 首 fictional songs demo metadata、6 个 demo users、3 个 demo sessions，以及 playlists、feedback logs、Agent Runs、Agent Steps 等演示数据结构。

Docker runtime verification 已有文档和 checklist，但当前本机 Docker 不可用，真实 Docker/PostgreSQL/API smoke verification 需要后续在安装 Docker 的环境中补充。

## 当前完成状态

已完成：

- 前端旗舰静态原型，包括 Studio Home、Planner、Timeline、Group Taste Mixer、Agent Console Preview、Dashboard。
- FastAPI 后端 API / data layer foundation。
- PostgreSQL 数据模型和 Alembic migration。
- Repositories / services / schemas / routers 分层。
- Demo data bootstrap。
- Backend runtime verification guide。
- GitHub portfolio packaging 文档和 README 优化。

尚未完成：

- 当前本机 Docker 不可用，所以真实 Docker/PostgreSQL/API smoke verification 尚未完成。
- 前端尚未接入真实后端 API。
- 未接真实 LLM provider。
- 未接真实音乐版权库。
- 未实现生产级推荐系统或真实在线播放。

## 工程亮点

- 完整全栈目录结构：frontend、backend、docs、Docker Compose、CI 基础设施。
- 后端分层清晰：routers -> services -> repositories -> SQLAlchemy models。
- 数据库 schema 完整覆盖 songs、sessions、playlists、feedback、agent runs、agent steps、recommendation reasons。
- API router 覆盖核心 demo flow：songs、demo users、karaoke sessions、playlists、feedback、agent runs、dashboard。
- Demo data bootstrap 具备幂等设计和版权安全检查。
- Mock-only Agent workflow 可以在没有外部 AI key 的情况下展示工作流结构。
- 版权安全意识明确：不包含真实歌曲、歌词、音频、MV、真实封面、盗版链接或品牌素材。
- 架构保留后续接入真实 LLM 和 rights-safe music catalog 的扩展边界。

## 讲解重点

可以重点说明：

- 为什么选择 mock-only：保证作品集可以稳定展示，不依赖付费 API key，也避免真实版权和 provider 风险。
- 为什么使用 fictional metadata：音乐项目容易涉及版权，metadata-only demo 是安全且工程上可扩展的方案。
- 为什么需要 repository/service 分层：避免业务逻辑堆在 router 中，方便后续接真实推荐算法、LLM adapter 或前端集成。
- Agent Console 如何体现 AI Native：不是只展示一个聊天结果，而是持久化 `agent_runs` 和 `agent_steps`，让工具调用、失败、延迟、输出摘要可追踪。
- 后续如何接真实 LLM：通过 provider adapter 和 `LLM_PROVIDER` 环境变量扩展，同时保留 mock mode。
- 后续如何补 Docker runtime verification：在安装 Docker 的环境中运行 `docs/BACKEND_RUNTIME_VERIFICATION.md` 中的 migration、bootstrap 和 API smoke checklist。

## 不夸大说明

当前项目不声明：

- 已经部署上线。
- 已经接入真实 LLM。
- 已经接入真实音乐库。
- 已经支持真实在线播放。
- 已经完成生产级推荐系统。
- Docker/PostgreSQL/API smoke verification 已经通过。

这些能力都属于后续阶段或需要在合适环境中补充验证。
