from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.api.deps import DbSession
from app.api.errors import ERROR_RESPONSES, app_error_response
from app.core.errors import AppError
from app.schemas.common import FeedbackType
from app.schemas.feedback import FeedbackCreate, FeedbackCreateResponse
from app.schemas.feedback import FeedbackListResponse
from app.services.feedback_memory_service import FeedbackMemoryService


router = APIRouter(tags=["feedback"])


@router.post(
    "/feedback",
    response_model=FeedbackCreateResponse,
    responses=ERROR_RESPONSES,
)
def create_feedback(
    payload: FeedbackCreate,
    db: DbSession,
) -> FeedbackCreateResponse | JSONResponse:
    try:
        return FeedbackMemoryService(db).create_feedback(payload)
    except AppError as error:
        return app_error_response(error)


@router.get(
    "/karaoke-sessions/{session_id}/feedback",
    response_model=FeedbackListResponse,
    responses=ERROR_RESPONSES,
)
def list_session_feedback(
    session_id: UUID,
    db: DbSession,
    feedback_type: FeedbackType | None = Query(default=None),
    user_id: UUID | None = Query(default=None),
    limit: int | None = Query(default=None, ge=1, le=100),
    offset: int | None = Query(default=None, ge=0),
) -> FeedbackListResponse | JSONResponse:
    try:
        return FeedbackMemoryService(db).list_session_feedback(
            session_id,
            feedback_type=feedback_type,
            user_id=user_id,
            limit=limit,
            offset=offset,
        )
    except AppError as error:
        return app_error_response(error)
