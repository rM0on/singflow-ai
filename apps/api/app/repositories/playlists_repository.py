from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.db.models import Playlist, PlaylistItem, RecommendationReason


class PlaylistsRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, playlist_id: UUID) -> Playlist | None:
        return self.db.get(Playlist, playlist_id)

    def get_by_id_with_items(self, playlist_id: UUID) -> Playlist | None:
        stmt = (
            select(Playlist)
            .where(Playlist.id == playlist_id)
            .options(
                selectinload(Playlist.items).selectinload(PlaylistItem.song),
                selectinload(Playlist.items).selectinload(
                    PlaylistItem.recommendation_reasons
                ),
            )
        )
        return self.db.scalar(stmt)

    def list_by_session(self, session_id: UUID) -> list[Playlist]:
        stmt = (
            select(Playlist)
            .where(Playlist.karaoke_session_id == session_id)
            .order_by(Playlist.created_at.desc())
        )
        return list(self.db.scalars(stmt))

    def create(self, values: Mapping[str, Any]) -> Playlist:
        playlist = Playlist(**dict(values))
        self.db.add(playlist)
        self.db.flush()
        return playlist

    def update(self, playlist: Playlist, values: Mapping[str, Any]) -> Playlist:
        for key, value in values.items():
            setattr(playlist, key, value)
        self.db.flush()
        return playlist

    def get_item_by_id(self, playlist_item_id: UUID) -> PlaylistItem | None:
        return self.db.get(PlaylistItem, playlist_item_id)

    def add_item(self, values: Mapping[str, Any]) -> PlaylistItem:
        item = PlaylistItem(**dict(values))
        self.db.add(item)
        self.db.flush()
        return item

    def add_items(self, items: Sequence[Mapping[str, Any]]) -> list[PlaylistItem]:
        playlist_items = [PlaylistItem(**dict(item)) for item in items]
        self.db.add_all(playlist_items)
        self.db.flush()
        return playlist_items

    def add_recommendation_reason(
        self,
        values: Mapping[str, Any],
    ) -> RecommendationReason:
        reason = RecommendationReason(**dict(values))
        self.db.add(reason)
        self.db.flush()
        return reason

    def add_recommendation_reasons(
        self,
        items: Sequence[Mapping[str, Any]],
    ) -> list[RecommendationReason]:
        reasons = [RecommendationReason(**dict(item)) for item in items]
        self.db.add_all(reasons)
        self.db.flush()
        return reasons

    def count_all(self) -> int:
        return int(self.db.scalar(select(func.count()).select_from(Playlist)) or 0)
