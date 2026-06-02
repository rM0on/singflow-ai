from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.errors import DatabaseOperationError, MockFallbackError, NotFoundError
from app.core.errors import ValidationAppError
from app.repositories.agent_runs_repository import AgentRunsRepository
from app.repositories.karaoke_sessions_repository import KaraokeSessionsRepository
from app.repositories.playlists_repository import PlaylistsRepository
from app.repositories.songs_repository import SongsRepository
from app.repositories.users_repository import UsersRepository
from app.schemas.playlists import PlaylistGenerateAgentRunResult
from app.schemas.playlists import PlaylistGenerateRequest, PlaylistGenerateResponse
from app.schemas.playlists import PlaylistItemRead, PlaylistRead, RecommendationReasonRead
from app.schemas.songs import SongLite


class PlaylistMockService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.agent_runs = AgentRunsRepository(db)
        self.sessions = KaraokeSessionsRepository(db)
        self.playlists = PlaylistsRepository(db)
        self.songs = SongsRepository(db)
        self.users = UsersRepository(db)

    def generate_mock_playlist(
        self,
        payload: PlaylistGenerateRequest,
    ) -> PlaylistGenerateResponse:
        if payload.mode != "mock":
            raise ValidationAppError("Phase 2B only supports mock playlist generation.")
        session = self.sessions.get_by_id(payload.karaoke_session_id)
        if session is None:
            raise NotFoundError(
                "Karaoke session was not found.",
                details={"session_id": str(payload.karaoke_session_id)},
            )
        if payload.created_by_user_id and not self.users.exists(payload.created_by_user_id):
            raise NotFoundError(
                "User was not found.",
                details={"user_id": str(payload.created_by_user_id)},
            )

        constraints = payload.constraints or {}
        candidates = self._select_safe_candidates(constraints, payload.target_length)
        if len(candidates) < payload.target_length:
            fallback = self.songs.list_for_mock_generation(limit=payload.target_length)
            seen = {song.id for song in candidates}
            candidates.extend(song for song in fallback if song.id not in seen)
        if not candidates:
            raise MockFallbackError("No safe songs are available for mock generation.")
        if len(candidates) < payload.target_length:
            raise MockFallbackError(
                "Not enough safe songs are available for the requested mock playlist."
            )

        selected = candidates[: payload.target_length]

        try:
            agent_run = self.agent_runs.create(
                {
                    "karaoke_session_id": session.id,
                    "user_id": payload.created_by_user_id,
                    "objective": "Generate deterministic mock playlist",
                    "run_type": "playlist_generation",
                    "status": "running",
                    "model_provider": "mock",
                    "model_name": "deterministic-phase-2b",
                    "input_summary": {
                        "prompt_length": len(payload.prompt),
                        "target_length": payload.target_length,
                        "mode": payload.mode,
                    },
                }
            )
            self._create_mock_steps(agent_run.id, selected_count=len(selected))
            playlist = self.playlists.create(
                {
                    "karaoke_session_id": session.id,
                    "agent_run_id": agent_run.id,
                    "created_by_user_id": payload.created_by_user_id,
                    "title": "Deterministic Mock Playlist",
                    "description": "Database-backed mock playlist foundation.",
                    "scene_type": session.scene_type,
                    "generation_prompt": payload.prompt,
                    "status": "generated",
                    "target_length": payload.target_length,
                    "score_summary": {"mode": "mock", "candidate_count": len(candidates)},
                }
            )
            playlist_items = self.playlists.add_items(
                [
                    {
                        "playlist_id": playlist.id,
                        "song_id": song.id,
                        "position": index,
                        "fit_score": _fit_score(index, payload.target_length),
                        "score_breakdown": {
                            "scene_fit": 0.8,
                            "safety_filter": 1.0,
                            "mock_rank": round(1 - ((index - 1) / payload.target_length), 3),
                        },
                        "transition_note": f"Mock sequence position {index}.",
                        "source": "agent",
                    }
                    for index, song in enumerate(selected, start=1)
                ]
            )
            self.playlists.add_recommendation_reasons(
                [
                    {
                        "playlist_item_id": item.id,
                        "agent_run_id": agent_run.id,
                        "reason_type": "scene_fit",
                        "short_reason": "Selected from safe metadata for the requested scene.",
                        "evidence": {"mode": "mock", "position": item.position},
                        "confidence": Decimal("0.800"),
                    }
                    for item in playlist_items
                ]
            )
            self.agent_runs.update(
                agent_run,
                {
                    "status": "succeeded",
                    "output_summary": {
                        "playlist_id": str(playlist.id),
                        "items_count": len(playlist_items),
                    },
                    "latency_ms": 0,
                },
            )
            self.db.commit()
            persisted = self.playlists.get_by_id_with_items(playlist.id)
            if persisted is None:
                raise MockFallbackError("Mock playlist was not persisted.")
        except SQLAlchemyError as exc:
            self.db.rollback()
            raise DatabaseOperationError("Failed to persist mock playlist.") from exc
        except MockFallbackError:
            self.db.rollback()
            raise

        return PlaylistGenerateResponse(
            playlist=_playlist_to_read(persisted),
            agent_run=PlaylistGenerateAgentRunResult(
                id=agent_run.id,
                status=agent_run.status,
            ),
        )

    def _select_safe_candidates(self, constraints: dict, target_length: int):
        languages = constraints.get("languages")
        scene_tags = constraints.get("scene_tags")
        max_vocal_difficulty = constraints.get("max_vocal_difficulty")
        return self.songs.list_for_mock_generation(
            languages=languages if isinstance(languages, list) else None,
            scene_tags=scene_tags if isinstance(scene_tags, list) else None,
            max_vocal_difficulty=(
                float(max_vocal_difficulty)
                if isinstance(max_vocal_difficulty, int | float)
                else None
            ),
            limit=max(target_length * 2, target_length),
        )

    def _create_mock_steps(self, agent_run_id: UUID, *, selected_count: int) -> None:
        steps = [
            ("plan", None, {"mode": "mock"}),
            ("tool_call", "search_song_catalog", {"selected_count": selected_count}),
            ("rank", "rank_song_candidates", {"ranking": "deterministic"}),
            ("explain", "generate_reasons", {"template": "scene_fit"}),
            ("finalize", "persist_playlist", {"status": "prepared"}),
        ]
        for index, (step_type, tool_name, output_summary) in enumerate(steps, start=1):
            self.agent_runs.create_step(
                {
                    "agent_run_id": agent_run_id,
                    "step_index": index,
                    "step_type": step_type,
                    "tool_name": tool_name,
                    "status": "succeeded",
                    "input_summary": {"mode": "mock"},
                    "output_summary": output_summary,
                    "latency_ms": 0,
                }
            )


def _fit_score(position: int, target_length: int) -> Decimal:
    if target_length <= 1:
        return Decimal("0.8500")
    score = 0.9 - ((position - 1) * 0.2 / max(target_length - 1, 1))
    return Decimal(str(round(score, 4)))


def _playlist_to_read(playlist) -> PlaylistRead:
    sorted_items = sorted(playlist.items, key=lambda item: item.position)
    return PlaylistRead(
        id=playlist.id,
        karaoke_session_id=playlist.karaoke_session_id,
        agent_run_id=playlist.agent_run_id,
        title=playlist.title,
        description=playlist.description,
        status=playlist.status,
        scene_type=playlist.scene_type,
        target_length=playlist.target_length,
        score_summary=playlist.score_summary,
        created_at=playlist.created_at,
        updated_at=playlist.updated_at,
        items=[
            PlaylistItemRead(
                id=item.id,
                position=item.position,
                fit_score=float(item.fit_score),
                song=SongLite.model_validate(item.song),
                score_breakdown=item.score_breakdown,
                transition_note=item.transition_note,
                source=item.source,
                reasons=[
                    RecommendationReasonRead(
                        reason_type=reason.reason_type,
                        short_reason=reason.short_reason,
                        confidence=(
                            float(reason.confidence)
                            if reason.confidence is not None
                            else None
                        ),
                        evidence=reason.evidence,
                    )
                    for reason in item.recommendation_reasons
                ],
            )
            for item in sorted_items
        ],
    )
