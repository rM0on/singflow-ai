from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.safety import SAFE_RIGHTS_STATUSES
from app.db.models import Song


class SongsRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, song_id: UUID, *, safe_only: bool = True) -> Song | None:
        stmt = select(Song).where(Song.id == song_id)
        if safe_only:
            stmt = stmt.where(Song.rights_status.in_(SAFE_RIGHTS_STATUSES))
        return self.db.scalar(stmt)

    def list(
        self,
        *,
        q: str | None = None,
        language: str | None = None,
        genre: str | None = None,
        mood: str | None = None,
        scene_tag: str | None = None,
        energy_min: float | None = None,
        energy_max: float | None = None,
        vocal_difficulty_max: float | None = None,
        rights_statuses: Sequence[str] | None = SAFE_RIGHTS_STATUSES,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Song]:
        stmt = self._filtered_select(
            q=q,
            language=language,
            genre=genre,
            mood=mood,
            scene_tag=scene_tag,
            energy_min=energy_min,
            energy_max=energy_max,
            vocal_difficulty_max=vocal_difficulty_max,
            rights_statuses=rights_statuses,
        )
        stmt = stmt.order_by(Song.created_at.desc(), Song.title).limit(limit).offset(offset)
        return list(self.db.scalars(stmt))

    def count(
        self,
        *,
        q: str | None = None,
        language: str | None = None,
        genre: str | None = None,
        mood: str | None = None,
        scene_tag: str | None = None,
        energy_min: float | None = None,
        energy_max: float | None = None,
        vocal_difficulty_max: float | None = None,
        rights_statuses: Sequence[str] | None = SAFE_RIGHTS_STATUSES,
    ) -> int:
        stmt = self._filtered_select(
            q=q,
            language=language,
            genre=genre,
            mood=mood,
            scene_tag=scene_tag,
            energy_min=energy_min,
            energy_max=energy_max,
            vocal_difficulty_max=vocal_difficulty_max,
            rights_statuses=rights_statuses,
        )
        return int(self.db.scalar(select(func.count()).select_from(stmt.subquery())) or 0)

    def list_for_mock_generation(
        self,
        *,
        languages: Sequence[str] | None = None,
        scene_tags: Sequence[str] | None = None,
        max_vocal_difficulty: float | None = None,
        limit: int = 50,
    ) -> list[Song]:
        stmt = select(Song).where(Song.rights_status.in_(SAFE_RIGHTS_STATUSES))
        if languages:
            stmt = stmt.where(Song.language.in_(languages))
        if scene_tags:
            for tag in scene_tags:
                stmt = stmt.where(Song.scene_tags.contains([tag]))
        if max_vocal_difficulty is not None:
            stmt = stmt.where(Song.vocal_difficulty <= max_vocal_difficulty)
        stmt = stmt.order_by(Song.energy, Song.title).limit(limit)
        return list(self.db.scalars(stmt))

    def create(self, values: Mapping[str, Any]) -> Song:
        song = Song(**dict(values))
        self.db.add(song)
        self.db.flush()
        return song

    def bulk_create(self, items: Sequence[Mapping[str, Any]]) -> list[Song]:
        songs = [Song(**dict(item)) for item in items]
        self.db.add_all(songs)
        self.db.flush()
        return songs

    def update(self, song: Song, values: Mapping[str, Any]) -> Song:
        for key, value in values.items():
            setattr(song, key, value)
        self.db.flush()
        return song

    def _filtered_select(
        self,
        *,
        q: str | None = None,
        language: str | None = None,
        genre: str | None = None,
        mood: str | None = None,
        scene_tag: str | None = None,
        energy_min: float | None = None,
        energy_max: float | None = None,
        vocal_difficulty_max: float | None = None,
        rights_statuses: Sequence[str] | None = SAFE_RIGHTS_STATUSES,
    ):
        stmt = select(Song)
        if rights_statuses is not None:
            stmt = stmt.where(Song.rights_status.in_(rights_statuses))
        if q:
            pattern = f"%{q.strip()}%"
            stmt = stmt.where(or_(Song.title.ilike(pattern), Song.artist_name.ilike(pattern)))
        if language:
            stmt = stmt.where(Song.language == language)
        if genre:
            stmt = stmt.where(Song.genres.contains([genre]))
        if mood:
            stmt = stmt.where(Song.moods.contains([mood]))
        if scene_tag:
            stmt = stmt.where(Song.scene_tags.contains([scene_tag]))
        if energy_min is not None:
            stmt = stmt.where(Song.energy >= energy_min)
        if energy_max is not None:
            stmt = stmt.where(Song.energy <= energy_max)
        if vocal_difficulty_max is not None:
            stmt = stmt.where(Song.vocal_difficulty <= vocal_difficulty_max)
        return stmt
