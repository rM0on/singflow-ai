from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.core.pagination import normalize_limit_offset
from app.repositories.feedback_repository import FeedbackRepository
from app.repositories.users_repository import UsersRepository
from app.schemas.common import DashboardRange
from app.schemas.users import DemoUserRead, DemoUsersListResponse, FeedbackTypeCount
from app.schemas.users import UserFeedbackSummaryResponse, UserRead


class DemoUserService:
    def __init__(self, db: Session) -> None:
        self.users = UsersRepository(db)
        self.feedback = FeedbackRepository(db)

    def list_demo_users(
        self,
        *,
        role: str | None = None,
        locale: str | None = None,
        limit: int | None = None,
        offset: int | None = None,
    ) -> DemoUsersListResponse:
        normalized_limit, normalized_offset = normalize_limit_offset(limit, offset)
        users = self.users.list_demo_users(
            role=role,
            locale=locale,
            limit=normalized_limit,
            offset=normalized_offset,
        )
        return DemoUsersListResponse(
            items=[DemoUserRead.model_validate(user) for user in users]
        )

    def get_user(self, user_id: UUID) -> UserRead:
        user = self.users.get_by_id(user_id)
        if user is None:
            raise NotFoundError("User was not found.", details={"user_id": str(user_id)})
        return UserRead.model_validate(user)

    def get_feedback_summary(
        self,
        user_id: UUID,
        *,
        range_value: DashboardRange = "30d",
    ) -> UserFeedbackSummaryResponse:
        if not self.users.exists(user_id):
            raise NotFoundError("User was not found.", details={"user_id": str(user_id)})
        by_type = self.feedback.aggregate_by_user_by_type(user_id)
        return UserFeedbackSummaryResponse(
            user_id=user_id,
            range=range_value,
            feedback_count=self.feedback.count_by_user(user_id),
            by_type=[
                FeedbackTypeCount(feedback_type=feedback_type, count=count)
                for feedback_type, count in by_type
            ],
            top_positive_tags=[],
            top_negative_tags=[],
        )
