from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.dashboard_repository import DashboardRepository
from app.schemas.dashboard import AgentRunStatusMetric, AgentToolMetric
from app.schemas.dashboard import DashboardAgentRunsResponse, DashboardOverviewResponse
from app.schemas.dashboard import FeedbackTypeMetric, RecentAgentFailure
from app.schemas.dashboard import TasteEvolutionPoint, TasteEvolutionResponse


class DashboardService:
    def __init__(self, db: Session) -> None:
        self.dashboard = DashboardRepository(db)

    def get_overview(self) -> DashboardOverviewResponse:
        return DashboardOverviewResponse(
            sessions_count=self.dashboard.count_sessions(),
            playlists_count=self.dashboard.count_playlists(),
            feedback_count=self.dashboard.count_feedback(),
            avg_agent_latency_ms=self.dashboard.average_agent_latency_ms(),
            top_feedback_types=[
                FeedbackTypeMetric(feedback_type=feedback_type, count=count)
                for feedback_type, count in self.dashboard.feedback_distribution()
            ],
        )

    def get_agent_runs_metrics(self) -> DashboardAgentRunsResponse:
        return DashboardAgentRunsResponse(
            by_status=[
                AgentRunStatusMetric(status=status, count=count)
                for status, count in self.dashboard.agent_runs_by_status()
            ],
            by_tool=[
                AgentToolMetric(
                    tool_name=tool_name,
                    count=count,
                    avg_latency_ms=avg_latency_ms,
                )
                for tool_name, count, avg_latency_ms in self.dashboard.agent_steps_by_tool()
            ],
            recent_failures=[
                RecentAgentFailure(
                    agent_run_id=run.id,
                    run_type=run.run_type,
                    error_message=run.error_message,
                    created_at=run.created_at,
                )
                for run in self.dashboard.recent_agent_failures()
            ],
        )

    def get_taste_evolution(
        self,
        *,
        user_id: UUID | None = None,
        profile_name: str | None = None,
    ) -> TasteEvolutionResponse:
        points: list[TasteEvolutionPoint] = []
        for profile in self.dashboard.latest_taste_profiles(
            user_id=user_id,
            profile_name=profile_name,
        ):
            point_date = (profile.updated_at or profile.created_at).date()
            for genre in profile.favorite_genres or []:
                points.append(
                    TasteEvolutionPoint(
                        date=point_date,
                        genre=genre,
                        score=float(profile.confidence),
                        confidence=float(profile.confidence),
                    )
                )
        return TasteEvolutionResponse(items=points)
