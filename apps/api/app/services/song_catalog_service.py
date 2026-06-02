from __future__ import annotations

from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.errors import DatabaseOperationError, NotFoundError, ValidationAppError
from app.core.pagination import normalize_limit_offset
from app.core.safety import assert_safe_rights_status, assert_song_metadata_safe
from app.repositories.songs_repository import SongsRepository
from app.schemas.songs import SongCreate, SongCreateResponse, SongImportRequest
from app.schemas.songs import SongImportResponse, SongImportResultItem
from app.schemas.songs import SongListResponse, SongRead, SongSummary, SongUpdate
from app.schemas.songs import SongUpdateResponse


class SongCatalogService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.songs = SongsRepository(db)

    def list_songs(
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
        limit: int | None = None,
        offset: int | None = None,
    ) -> SongListResponse:
        if energy_min is not None and energy_max is not None and energy_min > energy_max:
            raise ValidationAppError(
                "energy_min cannot be greater than energy_max.",
                details={"field": "energy"},
            )
        normalized_limit, normalized_offset = normalize_limit_offset(limit, offset)
        items = self.songs.list(
            q=q,
            language=language,
            genre=genre,
            mood=mood,
            scene_tag=scene_tag,
            energy_min=energy_min,
            energy_max=energy_max,
            vocal_difficulty_max=vocal_difficulty_max,
            limit=normalized_limit,
            offset=normalized_offset,
        )
        total = self.songs.count(
            q=q,
            language=language,
            genre=genre,
            mood=mood,
            scene_tag=scene_tag,
            energy_min=energy_min,
            energy_max=energy_max,
            vocal_difficulty_max=vocal_difficulty_max,
        )
        return SongListResponse(
            items=[SongSummary.model_validate(song) for song in items],
            total=total,
            limit=normalized_limit,
            offset=normalized_offset,
        )

    def get_song(self, song_id: UUID) -> SongRead:
        song = self.songs.get_by_id(song_id)
        if song is None:
            raise NotFoundError("Song was not found.", details={"song_id": str(song_id)})
        return SongRead.model_validate(song)

    def create_song(self, payload: SongCreate) -> SongCreateResponse:
        values = payload.model_dump()
        assert_song_metadata_safe(values)
        assert_safe_rights_status(values.get("rights_status"))
        try:
            song = self.songs.create(values)
            self.db.commit()
            self.db.refresh(song)
        except SQLAlchemyError as exc:
            self.db.rollback()
            raise DatabaseOperationError("Failed to create song metadata.") from exc
        return SongCreateResponse.model_validate(song)

    def import_songs(self, payload: SongImportRequest) -> SongImportResponse:
        assert_safe_rights_status(payload.rights_status)
        items = []
        for item in payload.items:
            values = item.model_dump()
            values["source_type"] = payload.source_type
            values["rights_status"] = payload.rights_status
            assert_song_metadata_safe(values)
            items.append(values)

        try:
            songs = self.songs.bulk_create(items)
            self.db.commit()
            for song in songs:
                self.db.refresh(song)
        except SQLAlchemyError as exc:
            self.db.rollback()
            raise DatabaseOperationError("Failed to import song metadata.") from exc

        return SongImportResponse(
            imported_count=len(songs),
            skipped_count=0,
            items=[
                SongImportResultItem(
                    id=song.id,
                    title=song.title,
                    rights_status=song.rights_status,
                )
                for song in songs
            ],
        )

    def update_song(self, song_id: UUID, payload: SongUpdate) -> SongUpdateResponse:
        song = self.songs.get_by_id(song_id)
        if song is None:
            raise NotFoundError("Song was not found.", details={"song_id": str(song_id)})

        values = payload.model_dump(exclude_unset=True)
        assert_song_metadata_safe(values)
        if "rights_status" in values:
            assert_safe_rights_status(values.get("rights_status"))

        try:
            self.songs.update(song, values)
            self.db.commit()
            self.db.refresh(song)
        except SQLAlchemyError as exc:
            self.db.rollback()
            raise DatabaseOperationError("Failed to update song metadata.") from exc

        return SongUpdateResponse(
            id=song.id,
            title=song.title,
            updated_fields=sorted(values.keys()),
        )
