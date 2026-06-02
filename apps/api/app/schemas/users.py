from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.common import APIModel, DashboardRange, DemoRole, FeedbackType


class UserRead(APIModel):
    id: UUID
    display_name: str
    avatar_seed: str | None = None
    locale: str | None = None
    demo_role: DemoRole | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class DemoUserRead(APIModel):
    id: UUID
    display_name: str
    avatar_seed: str | None = None
    locale: str | None = None
    demo_role: DemoRole | None = None


class DemoUsersListResponse(APIModel):
    items: list[DemoUserRead]


class FeedbackTypeCount(APIModel):
    feedback_type: FeedbackType
    count: int = Field(ge=0)


class UserFeedbackSummaryResponse(APIModel):
    user_id: UUID
    range: DashboardRange = "30d"
    feedback_count: int = Field(ge=0)
    by_type: list[FeedbackTypeCount]
    top_positive_tags: list[str]
    top_negative_tags: list[str]
