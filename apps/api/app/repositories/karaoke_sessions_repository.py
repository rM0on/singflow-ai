from __future__ import annotations

from collections.abc import Mapping
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import AgentRun, FeedbackLog, GroupMember, KaraokeSession, Playlist


class KaraokeSessionsRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, session_id: UUID) -> KaraokeSession | None:
        return self.db.get(KaraokeSession, session_id)

    def list(
        self,
        *,
        host_user_id: UUID | None = None,
        scene_type: str | None = None,
        status: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[KaraokeSession]:
        stmt = self._filtered_select(
            host_user_id=host_user_id,
            scene_type=scene_type,
            status=status,
        )
        stmt = stmt.order_by(KaraokeSession.created_at.desc()).limit(limit).offset(offset)
        return list(self.db.scalars(stmt))

    def count(
        self,
        *,
        host_user_id: UUID | None = None,
        scene_type: str | None = None,
        status: str | None = None,
    ) -> int:
        stmt = self._filtered_select(
            host_user_id=host_user_id,
            scene_type=scene_type,
            status=status,
        )
        return int(self.db.scalar(select(func.count()).select_from(stmt.subquery())) or 0)

    def create(self, values: Mapping[str, Any]) -> KaraokeSession:
        session = KaraokeSession(**dict(values))
        self.db.add(session)
        self.db.flush()
        return session

    def update(
        self,
        session: KaraokeSession,
        values: Mapping[str, Any],
    ) -> KaraokeSession:
        for key, value in values.items():
            setattr(session, key, value)
        self.db.flush()
        return session

    def get_member_by_session_user(
        self,
        session_id: UUID,
        user_id: UUID,
    ) -> GroupMember | None:
        stmt = select(GroupMember).where(
            GroupMember.karaoke_session_id == session_id,
            GroupMember.user_id == user_id,
        )
        return self.db.scalar(stmt)

    def add_member(self, values: Mapping[str, Any]) -> GroupMember:
        member = GroupMember(**dict(values))
        self.db.add(member)
        self.db.flush()
        return member

    def list_members(self, session_id: UUID) -> list[GroupMember]:
        stmt = (
            select(GroupMember)
            .where(GroupMember.karaoke_session_id == session_id)
            .order_by(GroupMember.joined_at, GroupMember.created_at)
        )
        return list(self.db.scalars(stmt))

    def count_members(self, session_id: UUID) -> int:
        stmt = select(func.count()).select_from(GroupMember).where(
            GroupMember.karaoke_session_id == session_id
        )
        return int(self.db.scalar(stmt) or 0)

    def count_playlists(self, session_id: UUID) -> int:
        stmt = select(func.count()).select_from(Playlist).where(
            Playlist.karaoke_session_id == session_id
        )
        return int(self.db.scalar(stmt) or 0)

    def count_feedback(self, session_id: UUID) -> int:
        stmt = select(func.count()).select_from(FeedbackLog).where(
            FeedbackLog.karaoke_session_id == session_id
        )
        return int(self.db.scalar(stmt) or 0)

    def latest_playlist_id(self, session_id: UUID) -> UUID | None:
        stmt = (
            select(Playlist.id)
            .where(Playlist.karaoke_session_id == session_id)
            .order_by(Playlist.created_at.desc())
            .limit(1)
        )
        return self.db.scalar(stmt)

    def latest_agent_run_id(self, session_id: UUID) -> UUID | None:
        stmt = (
            select(AgentRun.id)
            .where(AgentRun.karaoke_session_id == session_id)
            .order_by(AgentRun.created_at.desc())
            .limit(1)
        )
        return self.db.scalar(stmt)

    def _filtered_select(
        self,
        *,
        host_user_id: UUID | None = None,
        scene_type: str | None = None,
        status: str | None = None,
    ):
        stmt = select(KaraokeSession)
        if host_user_id is not None:
            stmt = stmt.where(KaraokeSession.host_user_id == host_user_id)
        if scene_type:
            stmt = stmt.where(KaraokeSession.scene_type == scene_type)
        if status:
            stmt = stmt.where(KaraokeSession.status == status)
        return stmt
