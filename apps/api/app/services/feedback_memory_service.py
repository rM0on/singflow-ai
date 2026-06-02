from __future__ import annotations

from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.errors import DatabaseOperationError, NotFoundError
from app.core.pagination import normalize_limit_offset
from app.repositories.feedback_repository import FeedbackRepository
from app.repositories.karaoke_sessions_repository import KaraokeSessionsRepository
from app.repositories.playlists_repository import PlaylistsRepository
from app.repositories.songs_repository import SongsRepository
from app.repositories.users_repository import UsersRepository
from app.schemas.feedback import FeedbackCreate, FeedbackCreateResponse
from app.schemas.feedback import FeedbackListResponse, FeedbackLogRead
from app.schemas.feedback import FeedbackMemoryUpdate


class FeedbackMemoryService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.feedback = FeedbackRepository(db)
        self.sessions = KaraokeSessionsRepository(db)
        self.playlists = PlaylistsRepository(db)
        self.songs = SongsRepository(db)
        self.users = UsersRepository(db)

    def create_feedback(self, payload: FeedbackCreate) -> FeedbackCreateResponse:
        self._assert_feedback_targets_exist(payload)
        values = payload.model_dump()
        try:
            feedback = self.feedback.create(values)
            self.db.commit()
            self.db.refresh(feedback)
        except SQLAlchemyError as exc:
            self.db.rollback()
            raise DatabaseOperationError("Failed to create feedback log.") from exc

        memory_status = "queued" if payload.user_id else "skipped"
        return FeedbackCreateResponse(
            id=feedback.id,
            status="saved",
            memory_update=FeedbackMemoryUpdate(status=memory_status, profile_id=None),
        )

    def list_session_feedback(
        self,
        session_id: UUID,
        *,
        feedback_type: str | None = None,
        user_id: UUID | None = None,
        limit: int | None = None,
        offset: int | None = None,
    ) -> FeedbackListResponse:
        if self.sessions.get_by_id(session_id) is None:
            raise NotFoundError(
                "Karaoke session was not found.",
                details={"session_id": str(session_id)},
            )
        normalized_limit, normalized_offset = normalize_limit_offset(
            limit,
            offset,
            default_limit=50,
        )
        rows = self.feedback.list_by_session_with_labels(
            session_id,
            feedback_type=feedback_type,
            user_id=user_id,
            limit=normalized_limit,
            offset=normalized_offset,
        )
        return FeedbackListResponse(
            items=[
                FeedbackLogRead(
                    id=feedback.id,
                    feedback_type=feedback.feedback_type,
                    rating=feedback.rating,
                    song_title=song_title,
                    user_display_name=user_display_name,
                    reason=feedback.reason,
                    created_at=feedback.created_at,
                )
                for feedback, song_title, user_display_name in rows
            ]
        )

    def _assert_feedback_targets_exist(self, payload: FeedbackCreate) -> None:
        if self.sessions.get_by_id(payload.karaoke_session_id) is None:
            raise NotFoundError(
                "Karaoke session was not found.",
                details={"session_id": str(payload.karaoke_session_id)},
            )
        if payload.playlist_id and self.playlists.get_by_id(payload.playlist_id) is None:
            raise NotFoundError(
                "Playlist was not found.",
                details={"playlist_id": str(payload.playlist_id)},
            )
        if (
            payload.playlist_item_id
            and self.playlists.get_item_by_id(payload.playlist_item_id) is None
        ):
            raise NotFoundError(
                "Playlist item was not found.",
                details={"playlist_item_id": str(payload.playlist_item_id)},
            )
        if payload.song_id and self.songs.get_by_id(payload.song_id) is None:
            raise NotFoundError("Song was not found.", details={"song_id": str(payload.song_id)})
        if payload.user_id and not self.users.exists(payload.user_id):
            raise NotFoundError("User was not found.", details={"user_id": str(payload.user_id)})
