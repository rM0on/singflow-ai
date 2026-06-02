from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.api.deps import DbSession
from app.api.errors import ERROR_RESPONSES, app_error_response
from app.core.errors import AppError
from app.schemas.common import DashboardRange, DemoRole
from app.schemas.taste_profiles import TasteProfilesListResponse
from app.schemas.users import DemoUsersListResponse, UserFeedbackSummaryResponse
from app.services.demo_user_service import DemoUserService
from app.services.taste_profile_service import TasteProfileService


router = APIRouter(tags=["users"])


@router.get("/demo-users", response_model=DemoUsersListResponse, responses=ERROR_RESPONSES)
def list_demo_users(
    db: DbSession,
    role: DemoRole | None = Query(default=None),
    locale: str | None = Query(default=None),
    limit: int | None = Query(default=None, ge=1, le=100),
    offset: int | None = Query(default=None, ge=0),
) -> DemoUsersListResponse | JSONResponse:
    try:
        return DemoUserService(db).list_demo_users(
            role=role,
            locale=locale,
            limit=limit,
            offset=offset,
        )
    except AppError as error:
        return app_error_response(error)


@router.get(
    "/users/{user_id}/taste-profiles",
    response_model=TasteProfilesListResponse,
    responses=ERROR_RESPONSES,
)
def list_user_taste_profiles(
    user_id: UUID,
    db: DbSession,
    limit: int | None = Query(default=None, ge=1, le=100),
    offset: int | None = Query(default=None, ge=0),
) -> TasteProfilesListResponse | JSONResponse:
    try:
        return TasteProfileService(db).list_user_profiles(
            user_id,
            limit=limit,
            offset=offset,
        )
    except AppError as error:
        return app_error_response(error)


@router.get(
    "/users/{user_id}/feedback-summary",
    response_model=UserFeedbackSummaryResponse,
    responses=ERROR_RESPONSES,
)
def get_user_feedback_summary(
    user_id: UUID,
    db: DbSession,
    range_value: DashboardRange = Query(default="30d", alias="range"),
) -> UserFeedbackSummaryResponse | JSONResponse:
    try:
        return DemoUserService(db).get_feedback_summary(
            user_id,
            range_value=range_value,
        )
    except AppError as error:
        return app_error_response(error)
