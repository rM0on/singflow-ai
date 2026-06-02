from __future__ import annotations

from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, DatabaseOperationError, NotFoundError
from app.core.pagination import normalize_limit_offset
from app.repositories.karaoke_sessions_repository import KaraokeSessionsRepository
from app.repositories.taste_profiles_repository import TasteProfilesRepository
from app.repositories.users_repository import UsersRepository
from app.schemas.karaoke_sessions import GroupMemberCreate, GroupMemberRead
from app.schemas.karaoke_sessions import GroupMembersListResponse
from app.schemas.karaoke_sessions import GroupMemberWithProfile
from app.schemas.karaoke_sessions import KaraokeSessionCreate
from app.schemas.karaoke_sessions import KaraokeSessionCreateResponse
from app.schemas.karaoke_sessions import KaraokeSessionDetail
from app.schemas.karaoke_sessions import KaraokeSessionListItem
from app.schemas.karaoke_sessions import KaraokeSessionListResponse
from app.schemas.karaoke_sessions import KaraokeSessionUpdate
from app.schemas.karaoke_sessions import KaraokeSessionUpdateResponse
from app.schemas.taste_profiles import TasteProfileSummary


class KaraokeSessionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.sessions = KaraokeSessionsRepository(db)
        self.users = UsersRepository(db)
        self.profiles = TasteProfilesRepository(db)

    def create_session(
        self,
        payload: KaraokeSessionCreate,
    ) -> KaraokeSessionCreateResponse:
        if payload.host_user_id and not self.users.exists(payload.host_user_id):
            raise NotFoundError(
                "Host user was not found.",
                details={"host_user_id": str(payload.host_user_id)},
            )
        values = payload.model_dump()
        values["status"] = "draft"
        try:
            session = self.sessions.create(values)
            self.db.commit()
            self.db.refresh(session)
        except SQLAlchemyError as exc:
            self.db.rollback()
            raise DatabaseOperationError("Failed to create karaoke session.") from exc
        return KaraokeSessionCreateResponse.model_validate(session)

    def list_sessions(
        self,
        *,
        host_user_id: UUID | None = None,
        scene_type: str | None = None,
        status: str | None = None,
        limit: int | None = None,
        offset: int | None = None,
    ) -> KaraokeSessionListResponse:
        normalized_limit, normalized_offset = normalize_limit_offset(limit, offset)
        sessions = self.sessions.list(
            host_user_id=host_user_id,
            scene_type=scene_type,
            status=status,
            limit=normalized_limit,
            offset=normalized_offset,
        )
        total = self.sessions.count(
            host_user_id=host_user_id,
            scene_type=scene_type,
            status=status,
        )
        return KaraokeSessionListResponse(
            items=[
                KaraokeSessionListItem(
                    id=session.id,
                    host_user_id=session.host_user_id,
                    title=session.title,
                    scene_type=session.scene_type,
                    status=session.status,
                    target_energy_curve=session.target_energy_curve,
                    members_count=self.sessions.count_members(session.id),
                    playlists_count=self.sessions.count_playlists(session.id),
                    latest_playlist_id=self.sessions.latest_playlist_id(session.id),
                    updated_at=session.updated_at,
                )
                for session in sessions
            ],
            total=total,
            limit=normalized_limit,
            offset=normalized_offset,
        )

    def get_session_detail(self, session_id: UUID) -> KaraokeSessionDetail:
        session = self.sessions.get_by_id(session_id)
        if session is None:
            raise NotFoundError(
                "Karaoke session was not found.",
                details={"session_id": str(session_id)},
            )
        return KaraokeSessionDetail(
            id=session.id,
            host_user_id=session.host_user_id,
            title=session.title,
            scene_type=session.scene_type,
            scene_prompt=session.scene_prompt,
            status=session.status,
            target_energy_curve=session.target_energy_curve,
            constraints=session.constraints,
            members_count=self.sessions.count_members(session.id),
            playlists_count=self.sessions.count_playlists(session.id),
            feedback_count=self.sessions.count_feedback(session.id),
            latest_playlist_id=self.sessions.latest_playlist_id(session.id),
            latest_agent_run_id=self.sessions.latest_agent_run_id(session.id),
            created_at=session.created_at,
            updated_at=session.updated_at,
        )

    def update_session(
        self,
        session_id: UUID,
        payload: KaraokeSessionUpdate,
    ) -> KaraokeSessionUpdateResponse:
        session = self.sessions.get_by_id(session_id)
        if session is None:
            raise NotFoundError(
                "Karaoke session was not found.",
                details={"session_id": str(session_id)},
            )
        values = payload.model_dump(exclude_unset=True)
        try:
            self.sessions.update(session, values)
            self.db.commit()
            self.db.refresh(session)
        except SQLAlchemyError as exc:
            self.db.rollback()
            raise DatabaseOperationError("Failed to update karaoke session.") from exc
        return KaraokeSessionUpdateResponse(
            id=session.id,
            title=session.title,
            scene_type=session.scene_type,
            status=session.status,
            target_energy_curve=session.target_energy_curve,
            updated_fields=sorted(values.keys()),
            updated_at=session.updated_at,
        )

    def add_member(
        self,
        session_id: UUID,
        payload: GroupMemberCreate,
    ) -> GroupMemberRead:
        if self.sessions.get_by_id(session_id) is None:
            raise NotFoundError(
                "Karaoke session was not found.",
                details={"session_id": str(session_id)},
            )
        if not self.users.exists(payload.user_id):
            raise NotFoundError(
                "User was not found.",
                details={"user_id": str(payload.user_id)},
            )
        if self.sessions.get_member_by_session_user(session_id, payload.user_id):
            raise ConflictError(
                "User is already a member of this karaoke session.",
                details={"session_id": str(session_id), "user_id": str(payload.user_id)},
            )
        values = payload.model_dump()
        values["karaoke_session_id"] = session_id
        try:
            member = self.sessions.add_member(values)
            self.db.commit()
            self.db.refresh(member)
        except SQLAlchemyError as exc:
            self.db.rollback()
            raise DatabaseOperationError("Failed to add group member.") from exc
        return GroupMemberRead.model_validate(member)

    def list_members(self, session_id: UUID) -> GroupMembersListResponse:
        if self.sessions.get_by_id(session_id) is None:
            raise NotFoundError(
                "Karaoke session was not found.",
                details={"session_id": str(session_id)},
            )
        members = self.sessions.list_members(session_id)
        items: list[GroupMemberWithProfile] = []
        for member in members:
            user = self.users.get_by_id(member.user_id)
            profiles = self.profiles.list_by_user(member.user_id, limit=1)
            profile_summary = (
                TasteProfileSummary.model_validate(profiles[0]) if profiles else None
            )
            items.append(
                GroupMemberWithProfile(
                    id=member.id,
                    display_name=user.display_name if user else "Unknown",
                    role=member.role,
                    preference_weight=float(member.preference_weight),
                    profile_summary=profile_summary,
                )
            )
        return GroupMembersListResponse(items=items)
