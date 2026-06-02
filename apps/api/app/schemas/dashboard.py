from __future__ import annotations

from datetime import date, datetime
from uuid import UUID

from pydantic import Field

from app.schemas.common import APIModel, AgentRunStatus, AgentRunType
from app.schemas.common import FeedbackType, Score


class FeedbackTypeMetric(APIModel):
    feedback_type: FeedbackType
    count: int = Field(ge=0)


class DashboardOverviewResponse(APIModel):
    sessions_count: int = Field(ge=0)
    playlists_count: int = Field(ge=0)
    feedback_count: int = Field(ge=0)
    avg_agent_latency_ms: float | None = Field(default=None, ge=0)
    top_feedback_types: list[FeedbackTypeMetric]


class TasteEvolutionPoint(APIModel):
    date: date
    genre: str
    score: Score
    confidence: Score


class TasteEvolutionResponse(APIModel):
    items: list[TasteEvolutionPoint]


class AgentRunStatusMetric(APIModel):
    status: AgentRunStatus
    count: int = Field(ge=0)


class AgentToolMetric(APIModel):
    tool_name: str
    count: int = Field(ge=0)
    avg_latency_ms: float | None = Field(default=None, ge=0)


class RecentAgentFailure(APIModel):
    agent_run_id: UUID
    run_type: AgentRunType
    error_message: str | None = None
    created_at: datetime


class DashboardAgentRunsResponse(APIModel):
    by_status: list[AgentRunStatusMetric]
    by_tool: list[AgentToolMetric]
    recent_failures: list[RecentAgentFailure]
