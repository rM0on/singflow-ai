from __future__ import annotations

from typing import Annotated, Any, Literal, TypeAlias
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


JsonObject: TypeAlias = dict[str, Any]
Score: TypeAlias = Annotated[float, Field(ge=0, le=1)]

Language: TypeAlias = Literal["en", "zh", "cantonese", "mixed"]
SceneType: TypeAlias = Literal["ktv", "car", "home_party", "custom"]
TargetEnergyCurve: TypeAlias = Literal["ramp_up", "steady", "cool_down", "wave"]
SongSourceType: TypeAlias = Literal["mock", "licensed", "public_domain"]
RightsStatus: TypeAlias = Literal["demo_safe", "licensed", "unknown_blocked"]
DemoRole: TypeAlias = Literal["host", "guest", "reviewer", "developer"]
SessionStatus: TypeAlias = Literal["draft", "active", "ended", "archived"]
GroupMemberRole: TypeAlias = Literal["host", "guest", "observer"]
PlaylistStatus: TypeAlias = Literal["draft", "generated", "edited", "archived"]
PlaylistItemSource: TypeAlias = Literal["agent", "manual", "seed"]
FeedbackType: TypeAlias = Literal[
    "liked",
    "skipped",
    "too_slow",
    "too_intense",
    "too_high",
    "wrong_language",
    "great_for_group",
]
AgentRunType: TypeAlias = Literal[
    "playlist_generation",
    "feedback_memory",
    "dashboard_summary",
]
AgentRunStatus: TypeAlias = Literal[
    "queued",
    "running",
    "succeeded",
    "failed",
    "cancelled",
]
AgentStepType: TypeAlias = Literal[
    "plan",
    "tool_call",
    "rank",
    "explain",
    "memory_write",
    "finalize",
]
AgentStepStatus: TypeAlias = Literal[
    "queued",
    "running",
    "succeeded",
    "failed",
    "skipped",
]
ModelProvider: TypeAlias = Literal["mock", "openai"]
RecommendationReasonType: TypeAlias = Literal[
    "scene_fit",
    "group_fit",
    "energy_curve",
    "memory",
    "diversity",
]
DashboardRange: TypeAlias = Literal["24h", "7d", "30d", "all"]


class APIModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Pagination(APIModel):
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class ErrorBody(APIModel):
    code: str
    message: str
    details: JsonObject | None = None


class ErrorEnvelope(APIModel):
    error: ErrorBody


class UpdatedFieldsResponse(APIModel):
    id: UUID
    updated_fields: list[str]
