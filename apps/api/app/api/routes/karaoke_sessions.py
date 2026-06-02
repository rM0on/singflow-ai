from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.api.deps import DbSession
from app.api.errors import ERROR_RESPONSES, app_error_response
from app.core.errors import AppError
from app.schemas.common import SceneType, SessionStatus
from app.schemas.karaoke_sessions import GroupMemberCreate, GroupMemberRead
from app.schemas.karaoke_sessions import GroupMembersListResponse
from app.schemas.karaoke_sessions import KaraokeSessionCreate
from app.schemas.karaoke_sessions import KaraokeSessionCreateResponse
from app.schemas.karaoke_sessions import KaraokeSessionDetail
from app.schemas.karaoke_sessions import KaraokeSessionListResponse
from app.schemas.karaoke_sessions import KaraokeSessionUpdate
from app.schemas.karaoke_sessions import KaraokeSessionUpdateResponse
from app.schemas.karaoke_sessions import TasteFusionRequest, TasteFusionResponse
from app.services.karaoke_session_service import KaraokeSessionService
from app.services.taste_fusion_service import TasteFusionService


router = APIRouter(prefix="/karaoke-sessions", tags=["karaoke-sessions"])


@router.get("", response_model=KaraokeSessionListResponse, responses=ERROR_RESPONSES)
def list_karaoke_sessions(
    db: DbSession,
    host_user_id: UUID | None = Query(default=None),
    scene_type: SceneType | None = Query(default=None),
    status: SessionStatus | None = Query(default=None),
    limit: int | None = Query(default=None, ge=1, le=100),
    offset: int | None = Query(default=None, ge=0),
) -> KaraokeSessionListResponse | JSONResponse:
    try:
        return KaraokeSessionService(db).list_sessions(
            host_user_id=host_user_id,
            scene_type=scene_type,
            status=status,
            limit=limit,
            offset=offset,
        )
    except AppError as error:
        return app_error_response(error)


@router.post(
    "",
    response_model=KaraokeSessionCreateResponse,
    responses=ERROR_RESPONSES,
)
def create_karaoke_session(
    payload: KaraokeSessionCreate,
    db: DbSession,
) -> KaraokeSessionCreateResponse | JSONResponse:
    try:
        return KaraokeSessionService(db).create_session(payload)
    except AppError as error:
        return app_error_response(error)


@router.get(
    "/{session_id}",
    response_model=KaraokeSessionDetail,
    responses=ERROR_RESPONSES,
)
def get_karaoke_session(
    session_id: UUID,
    db: DbSession,
) -> KaraokeSessionDetail | JSONResponse:
    try:
        return KaraokeSessionService(db).get_session_detail(session_id)
    except AppError as error:
        return app_error_response(error)


@router.patch(
    "/{session_id}",
    response_model=KaraokeSessionUpdateResponse,
    responses=ERROR_RESPONSES,
)
def update_karaoke_session(
    session_id: UUID,
    payload: KaraokeSessionUpdate,
    db: DbSession,
) -> KaraokeSessionUpdateResponse | JSONResponse:
    try:
        return KaraokeSessionService(db).update_session(session_id, payload)
    except AppError as error:
        return app_error_response(error)


@router.post(
    "/{session_id}/members",
    response_model=GroupMemberRead,
    responses=ERROR_RESPONSES,
)
def add_karaoke_session_member(
    session_id: UUID,
    payload: GroupMemberCreate,
    db: DbSession,
) -> GroupMemberRead | JSONResponse:
    try:
        return KaraokeSessionService(db).add_member(session_id, payload)
    except AppError as error:
        return app_error_response(error)


@router.get(
    "/{session_id}/members",
    response_model=GroupMembersListResponse,
    responses=ERROR_RESPONSES,
)
def list_karaoke_session_members(
    session_id: UUID,
    db: DbSession,
) -> GroupMembersListResponse | JSONResponse:
    try:
        return KaraokeSessionService(db).list_members(session_id)
    except AppError as error:
        return app_error_response(error)


@router.post(
    "/{session_id}/taste-fusion",
    response_model=TasteFusionResponse,
    responses=ERROR_RESPONSES,
)
def fuse_karaoke_session_taste(
    session_id: UUID,
    payload: TasteFusionRequest,
    db: DbSession,
) -> TasteFusionResponse | JSONResponse:
    try:
        return TasteFusionService(db).fuse_session(session_id, payload)
    except AppError as error:
        return app_error_response(error)
