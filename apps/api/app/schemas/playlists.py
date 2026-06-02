from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.common import AgentRunStatus, APIModel, JsonObject
from app.schemas.common import PlaylistItemSource, PlaylistStatus
from app.schemas.common import RecommendationReasonType, SceneType, Score
from app.schemas.songs import SongLite


class RecommendationReasonRead(APIModel):
    reason_type: RecommendationReasonType
    short_reason: str
    confidence: Score | None = None
    evidence: JsonObject | None = None


class PlaylistItemRead(APIModel):
    id: UUID
    position: int = Field(ge=1)
    fit_score: Score
    song: SongLite
    score_breakdown: JsonObject | None = None
    transition_note: str | None = None
    source: PlaylistItemSource | None = None
    reasons: list[RecommendationReasonRead]


class PlaylistCreate(APIModel):
    karaoke_session_id: UUID
    agent_run_id: UUID | None = None
    created_by_user_id: UUID | None = None
    title: str = Field(min_length=1)
    description: str | None = None
    scene_type: SceneType
    generation_prompt: str | None = None
    status: PlaylistStatus = "draft"
    target_length: int = Field(ge=1, le=100)
    score_summary: JsonObject | None = None


class PlaylistUpdate(APIModel):
    title: str | None = Field(default=None, min_length=1)
    description: str | None = None
    status: PlaylistStatus | None = None
    target_length: int | None = Field(default=None, ge=1, le=100)
    score_summary: JsonObject | None = None


class PlaylistRead(APIModel):
    id: UUID
    karaoke_session_id: UUID
    agent_run_id: UUID | None = None
    title: str
    description: str | None = None
    status: PlaylistStatus
    scene_type: SceneType
    target_length: int
    score_summary: JsonObject | None = None
    items: list[PlaylistItemRead]
    created_at: datetime | None = None
    updated_at: datetime | None = None


class PlaylistGenerateRequest(APIModel):
    karaoke_session_id: UUID
    created_by_user_id: UUID | None = None
    prompt: str = Field(min_length=1)
    target_length: int = Field(ge=3, le=30)
    constraints: JsonObject | None = None
    mode: Literal["mock"] = "mock"


class PlaylistGenerateAgentRunResult(APIModel):
    id: UUID
    status: AgentRunStatus


class PlaylistGenerateResponse(APIModel):
    playlist: PlaylistRead
    agent_run: PlaylistGenerateAgentRunResult


class PlaylistItemDraft(APIModel):
    song_id: UUID
    position: int = Field(ge=1)
    fit_score: Score
    score_breakdown: JsonObject | None = None
    transition_note: str | None = None
    source: PlaylistItemSource = "agent"
