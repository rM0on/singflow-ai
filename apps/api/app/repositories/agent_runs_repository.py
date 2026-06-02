from __future__ import annotations

from collections.abc import Mapping
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import AgentRun, AgentStep


class AgentRunsRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, agent_run_id: UUID) -> AgentRun | None:
        return self.db.get(AgentRun, agent_run_id)

    def list(
        self,
        *,
        karaoke_session_id: UUID | None = None,
        run_type: str | None = None,
        status: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[AgentRun]:
        stmt = select(AgentRun)
        if karaoke_session_id is not None:
            stmt = stmt.where(AgentRun.karaoke_session_id == karaoke_session_id)
        if run_type:
            stmt = stmt.where(AgentRun.run_type == run_type)
        if status:
            stmt = stmt.where(AgentRun.status == status)
        stmt = stmt.order_by(AgentRun.created_at.desc()).limit(limit).offset(offset)
        return list(self.db.scalars(stmt))

    def create(self, values: Mapping[str, Any]) -> AgentRun:
        agent_run = AgentRun(**dict(values))
        self.db.add(agent_run)
        self.db.flush()
        return agent_run

    def update(self, agent_run: AgentRun, values: Mapping[str, Any]) -> AgentRun:
        for key, value in values.items():
            setattr(agent_run, key, value)
        self.db.flush()
        return agent_run

    def count_steps(self, agent_run_id: UUID) -> int:
        stmt = select(func.count()).select_from(AgentStep).where(
            AgentStep.agent_run_id == agent_run_id
        )
        return int(self.db.scalar(stmt) or 0)

    def create_step(self, values: Mapping[str, Any]) -> AgentStep:
        step = AgentStep(**dict(values))
        self.db.add(step)
        self.db.flush()
        return step

    def update_step(self, step: AgentStep, values: Mapping[str, Any]) -> AgentStep:
        for key, value in values.items():
            setattr(step, key, value)
        self.db.flush()
        return step

    def list_steps(self, agent_run_id: UUID) -> list[AgentStep]:
        stmt = (
            select(AgentStep)
            .where(AgentStep.agent_run_id == agent_run_id)
            .order_by(AgentStep.step_index)
        )
        return list(self.db.scalars(stmt))

    def aggregate_by_status(self) -> list[tuple[str, int]]:
        stmt = (
            select(AgentRun.status, func.count().label("count"))
            .group_by(AgentRun.status)
            .order_by(AgentRun.status)
        )
        return [(status, int(count)) for status, count in self.db.execute(stmt)]

    def aggregate_steps_by_tool(self) -> list[tuple[str, int, float | None]]:
        stmt = (
            select(
                AgentStep.tool_name,
                func.count().label("count"),
                func.avg(AgentStep.latency_ms).label("avg_latency_ms"),
            )
            .where(AgentStep.tool_name.is_not(None))
            .group_by(AgentStep.tool_name)
            .order_by(func.count().desc(), AgentStep.tool_name)
        )
        return [
            (
                tool_name,
                int(count),
                float(avg_latency_ms) if avg_latency_ms is not None else None,
            )
            for tool_name, count, avg_latency_ms in self.db.execute(stmt)
        ]

    def recent_failures(self, *, limit: int = 5) -> list[AgentRun]:
        stmt = (
            select(AgentRun)
            .where(AgentRun.status == "failed")
            .order_by(AgentRun.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt))

    def average_latency_ms(self) -> float | None:
        value = self.db.scalar(select(func.avg(AgentRun.latency_ms)))
        return float(value) if value is not None else None
