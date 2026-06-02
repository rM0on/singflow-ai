from __future__ import annotations

from collections.abc import Mapping
from typing import Any
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.errors import DatabaseOperationError, NotFoundError
from app.core.pagination import normalize_limit_offset
from app.repositories.agent_runs_repository import AgentRunsRepository
from app.schemas.agent_runs import AgentRunDetail, AgentRunListResponse
from app.schemas.agent_runs import AgentRunSummary, AgentStepRead, AgentStepsListResponse


class AgentRunService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.agent_runs = AgentRunsRepository(db)

    def list_agent_runs(
        self,
        *,
        karaoke_session_id: UUID | None = None,
        run_type: str | None = None,
        status: str | None = None,
        limit: int | None = None,
        offset: int | None = None,
    ) -> AgentRunListResponse:
        normalized_limit, normalized_offset = normalize_limit_offset(limit, offset)
        runs = self.agent_runs.list(
            karaoke_session_id=karaoke_session_id,
            run_type=run_type,
            status=status,
            limit=normalized_limit,
            offset=normalized_offset,
        )
        return AgentRunListResponse(
            items=[AgentRunSummary.model_validate(run) for run in runs]
        )

    def get_agent_run_detail(self, agent_run_id: UUID) -> AgentRunDetail:
        run = self.agent_runs.get_by_id(agent_run_id)
        if run is None:
            raise NotFoundError(
                "Agent run was not found.",
                details={"agent_run_id": str(agent_run_id)},
            )
        return AgentRunDetail(
            id=run.id,
            run_type=run.run_type,
            status=run.status,
            objective=run.objective,
            input_summary=run.input_summary,
            output_summary=run.output_summary,
            steps_count=self.agent_runs.count_steps(run.id),
            latency_ms=run.latency_ms,
        )

    def list_steps(self, agent_run_id: UUID) -> AgentStepsListResponse:
        if self.agent_runs.get_by_id(agent_run_id) is None:
            raise NotFoundError(
                "Agent run was not found.",
                details={"agent_run_id": str(agent_run_id)},
            )
        steps = self.agent_runs.list_steps(agent_run_id)
        return AgentStepsListResponse(
            items=[AgentStepRead.model_validate(step) for step in steps]
        )

    def create_agent_run(self, values: Mapping[str, Any]) -> AgentRunSummary:
        safe_values = dict(values)
        safe_values["model_provider"] = "mock"
        try:
            run = self.agent_runs.create(safe_values)
            self.db.commit()
            self.db.refresh(run)
        except SQLAlchemyError as exc:
            self.db.rollback()
            raise DatabaseOperationError("Failed to create agent run.") from exc
        return AgentRunSummary.model_validate(run)

    def create_step(self, values: Mapping[str, Any]) -> AgentStepRead:
        try:
            step = self.agent_runs.create_step(values)
            self.db.commit()
            self.db.refresh(step)
        except SQLAlchemyError as exc:
            self.db.rollback()
            raise DatabaseOperationError("Failed to create agent step.") from exc
        return AgentStepRead.model_validate(step)
