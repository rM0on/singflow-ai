from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.api.deps import DbSession
from app.api.errors import ERROR_RESPONSES, app_error_response
from app.core.errors import AppError
from app.schemas.agent_runs import AgentRunDetail, AgentRunListResponse
from app.schemas.agent_runs import AgentStepsListResponse
from app.schemas.common import AgentRunStatus, AgentRunType
from app.services.agent_run_service import AgentRunService


router = APIRouter(prefix="/agent-runs", tags=["agent-runs"])


@router.get("", response_model=AgentRunListResponse, responses=ERROR_RESPONSES)
def list_agent_runs(
    db: DbSession,
    karaoke_session_id: UUID | None = Query(default=None),
    run_type: AgentRunType | None = Query(default=None),
    status: AgentRunStatus | None = Query(default=None),
    limit: int | None = Query(default=None, ge=1, le=100),
    offset: int | None = Query(default=None, ge=0),
) -> AgentRunListResponse | JSONResponse:
    try:
        return AgentRunService(db).list_agent_runs(
            karaoke_session_id=karaoke_session_id,
            run_type=run_type,
            status=status,
            limit=limit,
            offset=offset,
        )
    except AppError as error:
        return app_error_response(error)


@router.get(
    "/{agent_run_id}",
    response_model=AgentRunDetail,
    responses=ERROR_RESPONSES,
)
def get_agent_run(
    agent_run_id: UUID,
    db: DbSession,
) -> AgentRunDetail | JSONResponse:
    try:
        return AgentRunService(db).get_agent_run_detail(agent_run_id)
    except AppError as error:
        return app_error_response(error)


@router.get(
    "/{agent_run_id}/steps",
    response_model=AgentStepsListResponse,
    responses=ERROR_RESPONSES,
)
def list_agent_run_steps(
    agent_run_id: UUID,
    db: DbSession,
) -> AgentStepsListResponse | JSONResponse:
    try:
        return AgentRunService(db).list_steps(agent_run_id)
    except AppError as error:
        return app_error_response(error)
