from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.common import APIModel, FeedbackType, JsonObject


class FeedbackCreate(APIModel):
    karaoke_session_id: UUID
    playlist_id: UUID | None = None
    playlist_item_id: UUID | None = None
    song_id: UUID | None = None
    user_id: UUID | None = None
    feedback_type: FeedbackType
    rating: int | None = Field(default=None, ge=1, le=5)
    reason: str | None = None
    event_payload: JsonObject | None = None


class FeedbackMemoryUpdate(APIModel):
    status: Literal["queued", "updated", "skipped", "failed"]
    profile_id: UUID | None = None


class FeedbackCreateResponse(APIModel):
    id: UUID
    status: Literal["saved"]
    memory_update: FeedbackMemoryUpdate | None = None


class FeedbackLogRead(APIModel):
    id: UUID
    feedback_type: FeedbackType
    rating: int | None = Field(default=None, ge=1, le=5)
    song_title: str | None = None
    user_display_name: str | None = None
    reason: str | None = None
    created_at: datetime


class FeedbackListResponse(APIModel):
    items: list[FeedbackLogRead]
