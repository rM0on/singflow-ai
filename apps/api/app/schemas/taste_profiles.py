from __future__ import annotations

from datetime import datetime
from uuid import UUID

from app.schemas.common import APIModel, JsonObject, Score


class TasteProfileBase(APIModel):
    profile_name: str
    favorite_genres: list[str] | None = None
    avoided_genres: list[str] | None = None
    language_affinity: JsonObject
    mood_affinity: JsonObject
    artist_affinity: JsonObject | None = None
    energy_min: Score | None = None
    energy_max: Score | None = None
    vocal_difficulty_max: Score | None = None
    confidence: Score


class TasteProfileRead(TasteProfileBase):
    id: UUID
    user_id: UUID
    last_feedback_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class TasteProfilesListResponse(APIModel):
    items: list[TasteProfileRead]


class TasteProfileSummary(APIModel):
    favorite_genres: list[str] | None = None
    language_affinity: JsonObject
    mood_affinity: JsonObject | None = None
    confidence: Score | None = None
