from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.api.deps import DbSession
from app.api.errors import ERROR_RESPONSES, app_error_response
from app.core.errors import AppError
from app.schemas.common import DashboardRange
from app.schemas.dashboard import DashboardAgentRunsResponse
from app.schemas.dashboard import DashboardOverviewResponse, TasteEvolutionResponse
from app.services.dashboard_service import DashboardService


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get(
    "/overview",
    response_model=DashboardOverviewResponse,
    responses=ERROR_RESPONSES,
)
def get_dashboard_overview(
    db: DbSession,
    range_value: DashboardRange = Query(default="30d", alias="range"),
) -> DashboardOverviewResponse | JSONResponse:
    try:
        return DashboardService(db).get_overview()
    except AppError as error:
        return app_error_response(error)


@router.get(
    "/taste-evolution",
    response_model=TasteEvolutionResponse,
    responses=ERROR_RESPONSES,
)
def get_taste_evolution(
    db: DbSession,
    user_id: UUID | None = Query(default=None),
    profile_name: str | None = Query(default=None),
) -> TasteEvolutionResponse | JSONResponse:
    try:
        return DashboardService(db).get_taste_evolution(
            user_id=user_id,
            profile_name=profile_name,
        )
    except AppError as error:
        return app_error_response(error)


@router.get(
    "/agent-runs",
    response_model=DashboardAgentRunsResponse,
    responses=ERROR_RESPONSES,
)
def get_dashboard_agent_runs(
    db: DbSession,
) -> DashboardAgentRunsResponse | JSONResponse:
    try:
        return DashboardService(db).get_agent_runs_metrics()
    except AppError as error:
        return app_error_response(error)


@router.get(
    "/agent-performance",
    response_model=DashboardAgentRunsResponse,
    responses=ERROR_RESPONSES,
)
def get_dashboard_agent_performance(
    db: DbSession,
) -> DashboardAgentRunsResponse | JSONResponse:
    try:
        return DashboardService(db).get_agent_runs_metrics()
    except AppError as error:
        return app_error_response(error)
