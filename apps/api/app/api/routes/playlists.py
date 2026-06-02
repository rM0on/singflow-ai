from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.api.deps import DbSession
from app.api.errors import ERROR_RESPONSES, app_error_response
from app.core.errors import AppError
from app.schemas.playlists import PlaylistGenerateRequest, PlaylistGenerateResponse
from app.schemas.playlists import PlaylistRead
from app.services.playlist_mock_service import PlaylistMockService


router = APIRouter(prefix="/playlists", tags=["playlists"])


@router.post(
    "/generate",
    response_model=PlaylistGenerateResponse,
    responses=ERROR_RESPONSES,
)
def generate_playlist(
    payload: PlaylistGenerateRequest,
    db: DbSession,
) -> PlaylistGenerateResponse | JSONResponse:
    try:
        return PlaylistMockService(db).generate_mock_playlist(payload)
    except AppError as error:
        return app_error_response(error)


@router.get(
    "/{playlist_id}",
    response_model=PlaylistRead,
    responses=ERROR_RESPONSES,
)
def get_playlist(
    playlist_id: UUID,
    db: DbSession,
) -> PlaylistRead | JSONResponse:
    try:
        return PlaylistMockService(db).get_playlist(playlist_id)
    except AppError as error:
        return app_error_response(error)
