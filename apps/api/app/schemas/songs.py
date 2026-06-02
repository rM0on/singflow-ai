from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.common import APIModel, Language, RightsStatus, Score, SongSourceType


class SongBase(APIModel):
    title: str = Field(min_length=1)
    artist_name: str = Field(min_length=1)
    language: Language
    genres: list[str] = Field(min_length=1)
    moods: list[str] = Field(min_length=1)
    scene_tags: list[str] = Field(min_length=1)
    energy: Score
    vocal_difficulty: Score
    bpm: int | None = Field(default=None, gt=0)
    duration_seconds: int | None = Field(default=None, gt=0)
    release_year: int | None = Field(default=None, ge=1900, le=2100)
    danceability: Score | None = None
    popularity: Score | None = None
    cover_visual_seed: str | None = None
    source_type: SongSourceType = "mock"
    rights_status: RightsStatus = "demo_safe"


class SongCreate(SongBase):
    pass


class SongImportItemCreate(APIModel):
    title: str = Field(min_length=1)
    artist_name: str = Field(min_length=1)
    language: Language
    genres: list[str] = Field(min_length=1)
    moods: list[str] = Field(min_length=1)
    scene_tags: list[str] = Field(min_length=1)
    energy: Score
    vocal_difficulty: Score
    bpm: int | None = Field(default=None, gt=0)
    duration_seconds: int | None = Field(default=None, gt=0)
    release_year: int | None = Field(default=None, ge=1900, le=2100)
    danceability: Score | None = None
    popularity: Score | None = None
    cover_visual_seed: str | None = None


class SongImportRequest(APIModel):
    source_type: SongSourceType = "mock"
    rights_status: RightsStatus = "demo_safe"
    items: list[SongImportItemCreate] = Field(min_length=1)


class SongUpdate(APIModel):
    title: str | None = Field(default=None, min_length=1)
    artist_name: str | None = Field(default=None, min_length=1)
    language: Language | None = None
    genres: list[str] | None = None
    moods: list[str] | None = None
    scene_tags: list[str] | None = None
    energy: Score | None = None
    danceability: Score | None = None
    vocal_difficulty: Score | None = None
    bpm: int | None = Field(default=None, gt=0)
    duration_seconds: int | None = Field(default=None, gt=0)
    release_year: int | None = Field(default=None, ge=1900, le=2100)
    popularity: Score | None = None
    cover_visual_seed: str | None = None
    source_type: SongSourceType | None = None
    rights_status: RightsStatus | None = None


class SongRead(SongBase):
    id: UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


class SongSummary(APIModel):
    id: UUID
    title: str
    artist_name: str
    language: Language
    genres: list[str]
    moods: list[str]
    scene_tags: list[str]
    energy: Score
    vocal_difficulty: Score
    rights_status: RightsStatus


class SongListResponse(APIModel):
    items: list[SongSummary]
    total: int = Field(ge=0)
    limit: int = Field(ge=1, le=100)
    offset: int = Field(ge=0)


class SongImportResultItem(APIModel):
    id: UUID
    title: str
    rights_status: RightsStatus


class SongImportResponse(APIModel):
    imported_count: int = Field(ge=0)
    skipped_count: int = Field(ge=0)
    items: list[SongImportResultItem]


class SongCreateResponse(APIModel):
    id: UUID
    title: str
    artist_name: str
    rights_status: RightsStatus


class SongUpdateResponse(APIModel):
    id: UUID
    title: str
    updated_fields: list[str]


class SongLite(APIModel):
    id: UUID
    title: str
    artist_name: str
