from __future__ import annotations

from collections import defaultdict
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.repositories.karaoke_sessions_repository import KaraokeSessionsRepository
from app.repositories.taste_profiles_repository import TasteProfilesRepository
from app.schemas.karaoke_sessions import TasteFusionConflict, TasteFusionRequest
from app.schemas.karaoke_sessions import TasteFusionResponse


LANGUAGES = ("en", "zh", "cantonese", "mixed")


class TasteFusionService:
    def __init__(self, db: Session) -> None:
        self.sessions = KaraokeSessionsRepository(db)
        self.profiles = TasteProfilesRepository(db)

    def fuse_session(
        self,
        session_id: UUID,
        payload: TasteFusionRequest,
    ) -> TasteFusionResponse:
        session = self.sessions.get_by_id(session_id)
        if session is None:
            raise NotFoundError(
                "Karaoke session was not found.",
                details={"session_id": str(session_id)},
            )

        members = self.sessions.list_members(session_id)
        override_weights = {
            override.user_id: override.preference_weight
            for override in payload.member_overrides or []
        }
        profiles = self.profiles.list_for_users([member.user_id for member in members])
        profiles_by_user = {profile.user_id: profile for profile in profiles}

        weight_total = 0.0
        language_scores = {language: 0.0 for language in LANGUAGES}
        genre_scores: dict[str, float] = defaultdict(float)
        energy_mins: list[float] = []
        energy_maxes: list[float] = []

        for member in members:
            weight = float(override_weights.get(member.user_id, member.preference_weight))
            profile = profiles_by_user.get(member.user_id)
            if profile is None:
                continue
            weight_total += weight
            for language in LANGUAGES:
                language_scores[language] += (
                    _score(profile.language_affinity.get(language)) * weight
                )
            for genre in profile.favorite_genres or []:
                genre_scores[genre] += weight
            if profile.energy_min is not None:
                energy_mins.append(_score(profile.energy_min))
            if profile.energy_max is not None:
                energy_maxes.append(_score(profile.energy_max))

        if weight_total:
            language_scores = {
                language: round(score / weight_total, 3)
                for language, score in language_scores.items()
            }
            genre_scores = {
                genre: round(score / weight_total, 3)
                for genre, score in sorted(genre_scores.items())
            }

        energy_start = sum(energy_mins) / len(energy_mins) if energy_mins else 0.45
        energy_end = sum(energy_maxes) / len(energy_maxes) if energy_maxes else 0.7
        if payload.energy_curve == "cool_down":
            energy_target = {"start": round(energy_end, 3), "middle": 0.55, "end": round(energy_start, 3)}
        elif payload.energy_curve == "steady":
            middle = round((energy_start + energy_end) / 2, 3)
            energy_target = {"start": middle, "middle": middle, "end": middle}
        elif payload.energy_curve == "wave":
            energy_target = {"start": round(energy_start, 3), "middle": round(energy_end, 3), "end": 0.55}
        else:
            energy_target = {"start": round(energy_start, 3), "middle": round(energy_end, 3), "end": 0.62}

        conflicts = []
        if not members:
            conflicts.append(
                TasteFusionConflict(
                    dimension="members",
                    summary="No session members have been added yet.",
                )
            )
        elif not profiles:
            conflicts.append(
                TasteFusionConflict(
                    dimension="profiles",
                    summary="No taste profiles are available for this session yet.",
                )
            )
        if energy_mins and energy_maxes and max(energy_maxes) - min(energy_mins) > 0.55:
            conflicts.append(
                TasteFusionConflict(
                    dimension="energy",
                    summary="Member energy preferences are spread across a wide range.",
                )
            )

        return TasteFusionResponse(
            session_id=session.id,
            fusion={
                "languages": language_scores,
                "genres": dict(genre_scores),
                "energy_target": energy_target,
                "scene_type": payload.scene_type,
            },
            conflicts=conflicts,
        )


def _score(value: Decimal | float | int | None) -> float:
    return float(value) if value is not None else 0.0
