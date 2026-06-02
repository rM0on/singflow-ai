from __future__ import annotations

from collections.abc import Mapping
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import FeedbackLog, Song, User


class FeedbackRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, feedback_id: UUID) -> FeedbackLog | None:
        return self.db.get(FeedbackLog, feedback_id)

    def create(self, values: Mapping[str, Any]) -> FeedbackLog:
        feedback = FeedbackLog(**dict(values))
        self.db.add(feedback)
        self.db.flush()
        return feedback

    def list_by_session(
        self,
        session_id: UUID,
        *,
        feedback_type: str | None = None,
        user_id: UUID | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[FeedbackLog]:
        stmt = select(FeedbackLog).where(FeedbackLog.karaoke_session_id == session_id)
        if feedback_type:
            stmt = stmt.where(FeedbackLog.feedback_type == feedback_type)
        if user_id is not None:
            stmt = stmt.where(FeedbackLog.user_id == user_id)
        stmt = stmt.order_by(FeedbackLog.created_at.desc()).limit(limit).offset(offset)
        return list(self.db.scalars(stmt))

    def list_by_session_with_labels(
        self,
        session_id: UUID,
        *,
        feedback_type: str | None = None,
        user_id: UUID | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[tuple[FeedbackLog, str | None, str | None]]:
        stmt = (
            select(FeedbackLog, Song.title, User.display_name)
            .outerjoin(Song, FeedbackLog.song_id == Song.id)
            .outerjoin(User, FeedbackLog.user_id == User.id)
            .where(FeedbackLog.karaoke_session_id == session_id)
        )
        if feedback_type:
            stmt = stmt.where(FeedbackLog.feedback_type == feedback_type)
        if user_id is not None:
            stmt = stmt.where(FeedbackLog.user_id == user_id)
        stmt = stmt.order_by(FeedbackLog.created_at.desc()).limit(limit).offset(offset)
        return list(self.db.execute(stmt).all())

    def count_by_user(self, user_id: UUID) -> int:
        stmt = select(func.count()).select_from(FeedbackLog).where(
            FeedbackLog.user_id == user_id
        )
        return int(self.db.scalar(stmt) or 0)

    def count_all(self) -> int:
        return int(self.db.scalar(select(func.count()).select_from(FeedbackLog)) or 0)

    def aggregate_by_type(self, *, limit: int | None = None) -> list[tuple[str, int]]:
        stmt = (
            select(FeedbackLog.feedback_type, func.count().label("count"))
            .group_by(FeedbackLog.feedback_type)
            .order_by(func.count().desc(), FeedbackLog.feedback_type)
        )
        if limit is not None:
            stmt = stmt.limit(limit)
        return [(feedback_type, int(count)) for feedback_type, count in self.db.execute(stmt)]

    def aggregate_by_user_by_type(self, user_id: UUID) -> list[tuple[str, int]]:
        stmt = (
            select(FeedbackLog.feedback_type, func.count().label("count"))
            .where(FeedbackLog.user_id == user_id)
            .group_by(FeedbackLog.feedback_type)
            .order_by(func.count().desc(), FeedbackLog.feedback_type)
        )
        return [(feedback_type, int(count)) for feedback_type, count in self.db.execute(stmt)]
