from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.common import APIModel, JsonObject, SceneType, Score
from app.schemas.common import GroupMemberRole, SessionStatus, TargetEnergyCurve
from app.schemas.taste_profiles import TasteProfileSummary


class KaraokeSessionCreate(APIModel):
    host_user_id: UUID | None = None
    title: str = Field(min_length=1)
    scene_type: SceneType
    scene_prompt: str | None = None
    target_energy_curve: TargetEnergyCurve | None = None
    constraints: JsonObject | None = None


class KaraokeSessionUpdate(APIModel):
    title: str | None = Field(default=None, min_length=1)
    scene_type: SceneType | None = None
    scene_prompt: str | None = None
    status: SessionStatus | None = None
    target_energy_curve: TargetEnergyCurve | None = None
    constraints: JsonObject | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None


class KaraokeSessionCreateResponse(APIModel):
    id: UUID
    title: str
    scene_type: SceneType
    status: SessionStatus
    created_at: datetime


class KaraokeSessionListItem(APIModel):
    id: UUID
    host_user_id: UUID | None = None
    title: str
    scene_type: SceneType
    status: SessionStatus
    target_energy_curve: TargetEnergyCurve | None = None
    members_count: int = Field(ge=0)
    playlists_count: int = Field(ge=0)
    latest_playlist_id: UUID | None = None
    updated_at: datetime | None = None


class KaraokeSessionListResponse(APIModel):
    items: list[KaraokeSessionListItem]
    total: int = Field(ge=0)
    limit: int = Field(ge=1, le=100)
    offset: int = Field(ge=0)


class KaraokeSessionDetail(APIModel):
    id: UUID
    host_user_id: UUID | None = None
    title: str
    scene_type: SceneType
    scene_prompt: str | None = None
    status: SessionStatus
    target_energy_curve: TargetEnergyCurve | None = None
    constraints: JsonObject | None = None
    members_count: int = Field(ge=0)
    playlists_count: int = Field(ge=0)
    feedback_count: int = Field(ge=0)
    latest_playlist_id: UUID | None = None
    latest_agent_run_id: UUID | None = None
    created_at: datetime
    updated_at: datetime | None = None


class KaraokeSessionUpdateResponse(APIModel):
    id: UUID
    title: str
    scene_type: SceneType
    status: SessionStatus
    target_energy_curve: TargetEnergyCurve | None = None
    updated_fields: list[str]
    updated_at: datetime | None = None


class GroupMemberCreate(APIModel):
    user_id: UUID
    role: GroupMemberRole = "guest"
    preference_weight: Score = 1
    preference_hint: str | None = None


class GroupMemberRead(APIModel):
    id: UUID
    karaoke_session_id: UUID
    user_id: UUID
    role: GroupMemberRole
    preference_weight: Score
    preference_hint: str | None = None


class GroupMemberWithProfile(APIModel):
    id: UUID
    display_name: str
    role: GroupMemberRole
    preference_weight: Score
    profile_summary: TasteProfileSummary | None = None


class GroupMembersListResponse(APIModel):
    items: list[GroupMemberWithProfile]


class TasteFusionMemberOverride(APIModel):
    user_id: UUID
    preference_weight: Score


class TasteFusionRequest(APIModel):
    scene_type: SceneType
    energy_curve: TargetEnergyCurve | None = None
    member_overrides: list[TasteFusionMemberOverride] | None = None


class TasteFusionConflict(APIModel):
    dimension: str
    summary: str


class TasteFusionResponse(APIModel):
    session_id: UUID
    fusion: JsonObject
    conflicts: list[TasteFusionConflict]
