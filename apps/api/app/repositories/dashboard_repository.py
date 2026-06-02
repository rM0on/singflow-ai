from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import AgentRun, AgentStep, FeedbackLog, KaraokeSession, Playlist
from app.db.models import TasteProfile


class DashboardRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def count_sessions(self) -> int:
        return int(self.db.scalar(select(func.count()).select_from(KaraokeSession)) or 0)

    def count_playlists(self) -> int:
        return int(self.db.scalar(select(func.count()).select_from(Playlist)) or 0)

    def count_feedback(self) -> int:
        return int(self.db.scalar(select(func.count()).select_from(FeedbackLog)) or 0)

    def average_agent_latency_ms(self) -> float | None:
        value = self.db.scalar(select(func.avg(AgentRun.latency_ms)))
        return float(value) if value is not None else None

    def feedback_distribution(self, *, limit: int = 5) -> list[tuple[str, int]]:
        stmt = (
            select(FeedbackLog.feedback_type, func.count().label("count"))
            .group_by(FeedbackLog.feedback_type)
            .order_by(func.count().desc(), FeedbackLog.feedback_type)
            .limit(limit)
        )
        return [(feedback_type, int(count)) for feedback_type, count in self.db.execute(stmt)]

    def agent_runs_by_status(self) -> list[tuple[str, int]]:
        stmt = (
            select(AgentRun.status, func.count().label("count"))
            .group_by(AgentRun.status)
            .order_by(AgentRun.status)
        )
        return [(status, int(count)) for status, count in self.db.execute(stmt)]

    def agent_steps_by_tool(self) -> list[tuple[str, int, float | None]]:
        stmt = (
            select(
                AgentStep.tool_name,
                func.count().label("count"),
                func.avg(AgentStep.latency_ms).label("avg_latency_ms"),
            )
            .where(AgentStep.tool_name.is_not(None))
            .group_by(AgentStep.tool_name)
            .order_by(func.count().desc(), AgentStep.tool_name)
        )
        return [
            (
                tool_name,
                int(count),
                float(avg_latency_ms) if avg_latency_ms is not None else None,
            )
            for tool_name, count, avg_latency_ms in self.db.execute(stmt)
        ]

    def recent_agent_failures(self, *, limit: int = 5) -> list[AgentRun]:
        stmt = (
            select(AgentRun)
            .where(AgentRun.status == "failed")
            .order_by(AgentRun.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt))

    def latest_taste_profiles(
        self,
        *,
        user_id: UUID | None = None,
        profile_name: str | None = None,
        limit: int = 20,
    ) -> list[TasteProfile]:
        stmt = select(TasteProfile)
        if user_id:
            stmt = stmt.where(TasteProfile.user_id == user_id)
        if profile_name:
            stmt = stmt.where(TasteProfile.profile_name == profile_name)
        stmt = stmt.order_by(TasteProfile.updated_at.desc()).limit(limit)
        return list(self.db.scalars(stmt))
