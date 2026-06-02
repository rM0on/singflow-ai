from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import TasteProfile


class TasteProfilesRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, profile_id: UUID) -> TasteProfile | None:
        return self.db.get(TasteProfile, profile_id)

    def get_by_user_and_name(
        self,
        user_id: UUID,
        profile_name: str,
    ) -> TasteProfile | None:
        stmt = select(TasteProfile).where(
            TasteProfile.user_id == user_id,
            TasteProfile.profile_name == profile_name,
        )
        return self.db.scalar(stmt)

    def list_by_user(
        self,
        user_id: UUID,
        *,
        limit: int = 20,
        offset: int = 0,
    ) -> list[TasteProfile]:
        stmt = (
            select(TasteProfile)
            .where(TasteProfile.user_id == user_id)
            .order_by(TasteProfile.profile_name)
            .limit(limit)
            .offset(offset)
        )
        return list(self.db.scalars(stmt))

    def list_for_users(self, user_ids: Sequence[UUID]) -> list[TasteProfile]:
        if not user_ids:
            return []
        stmt = select(TasteProfile).where(TasteProfile.user_id.in_(user_ids))
        return list(self.db.scalars(stmt))

    def create(self, values: Mapping[str, Any]) -> TasteProfile:
        profile = TasteProfile(**dict(values))
        self.db.add(profile)
        self.db.flush()
        return profile

    def update(self, profile: TasteProfile, values: Mapping[str, Any]) -> TasteProfile:
        for key, value in values.items():
            setattr(profile, key, value)
        self.db.flush()
        return profile
