from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.api.deps import DbSession
from app.api.errors import ERROR_RESPONSES, app_error_response
from app.core.errors import AppError
from app.schemas.common import Language
from app.schemas.songs import SongCreate, SongCreateResponse, SongImportRequest
from app.schemas.songs import SongImportResponse, SongListResponse, SongRead
from app.schemas.songs import SongUpdate, SongUpdateResponse
from app.services.song_catalog_service import SongCatalogService


router = APIRouter(prefix="/songs", tags=["songs"])


@router.get("", response_model=SongListResponse, responses=ERROR_RESPONSES)
def list_songs(
    db: DbSession,
    q: str | None = Query(default=None),
    language: Language | None = Query(default=None),
    genre: str | None = Query(default=None),
    mood: str | None = Query(default=None),
    scene_tag: str | None = Query(default=None),
    energy_min: float | None = Query(default=None, ge=0, le=1),
    energy_max: float | None = Query(default=None, ge=0, le=1),
    vocal_difficulty_max: float | None = Query(default=None, ge=0, le=1),
    limit: int | None = Query(default=None, ge=1, le=100),
    offset: int | None = Query(default=None, ge=0),
) -> SongListResponse | JSONResponse:
    try:
        return SongCatalogService(db).list_songs(
            q=q,
            language=language,
            genre=genre,
            mood=mood,
            scene_tag=scene_tag,
            energy_min=energy_min,
            energy_max=energy_max,
            vocal_difficulty_max=vocal_difficulty_max,
            limit=limit,
            offset=offset,
        )
    except AppError as error:
        return app_error_response(error)


@router.post("/import", response_model=SongImportResponse, responses=ERROR_RESPONSES)
def import_songs(
    payload: SongImportRequest,
    db: DbSession,
) -> SongImportResponse | JSONResponse:
    try:
        return SongCatalogService(db).import_songs(payload)
    except AppError as error:
        return app_error_response(error)


@router.post("", response_model=SongCreateResponse, responses=ERROR_RESPONSES)
def create_song(
    payload: SongCreate,
    db: DbSession,
) -> SongCreateResponse | JSONResponse:
    try:
        return SongCatalogService(db).create_song(payload)
    except AppError as error:
        return app_error_response(error)


@router.get("/{song_id}", response_model=SongRead, responses=ERROR_RESPONSES)
def get_song(song_id: UUID, db: DbSession) -> SongRead | JSONResponse:
    try:
        return SongCatalogService(db).get_song(song_id)
    except AppError as error:
        return app_error_response(error)


@router.patch("/{song_id}", response_model=SongUpdateResponse, responses=ERROR_RESPONSES)
def update_song(
    song_id: UUID,
    payload: SongUpdate,
    db: DbSession,
) -> SongUpdateResponse | JSONResponse:
    try:
        return SongCatalogService(db).update_song(song_id, payload)
    except AppError as error:
        return app_error_response(error)
