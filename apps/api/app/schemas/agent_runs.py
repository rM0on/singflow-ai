from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.common import APIModel, AgentRunStatus, AgentRunType
from app.schemas.common import AgentStepStatus, AgentStepType, JsonObject, ModelProvider


class AgentRunSummary(APIModel):
    id: UUID
    run_type: AgentRunType
    status: AgentRunStatus
    objective: str
    model_provider: ModelProvider
    latency_ms: int | None = Field(default=None, ge=0)
    created_at: datetime


class AgentRunListResponse(APIModel):
    items: list[AgentRunSummary]


class AgentRunDetail(APIModel):
    id: UUID
    run_type: AgentRunType
    status: AgentRunStatus
    objective: str
    input_summary: JsonObject | None = None
    output_summary: JsonObject | None = None
    steps_count: int = Field(ge=0)
    latency_ms: int | None = Field(default=None, ge=0)


class AgentStepRead(APIModel):
    id: UUID
    step_index: int = Field(ge=1)
    step_type: AgentStepType
    tool_name: str | None = None
    status: AgentStepStatus
    input_summary: JsonObject | None = None
    output_summary: JsonObject | None = None
    error_message: str | None = None
    latency_ms: int | None = Field(default=None, ge=0)


class AgentStepsListResponse(APIModel):
    items: list[AgentStepRead]
