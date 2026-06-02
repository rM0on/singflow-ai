from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.core.pagination import normalize_limit_offset
from app.repositories.taste_profiles_repository import TasteProfilesRepository
from app.repositories.users_repository import UsersRepository
from app.schemas.taste_profiles import TasteProfileRead, TasteProfilesListResponse


class TasteProfileService:
    def __init__(self, db: Session) -> None:
        self.users = UsersRepository(db)
        self.profiles = TasteProfilesRepository(db)

    def list_user_profiles(
        self,
        user_id: UUID,
        *,
        limit: int | None = None,
        offset: int | None = None,
    ) -> TasteProfilesListResponse:
        if not self.users.exists(user_id):
            raise NotFoundError("User was not found.", details={"user_id": str(user_id)})
        normalized_limit, normalized_offset = normalize_limit_offset(limit, offset)
        profiles = self.profiles.list_by_user(
            user_id,
            limit=normalized_limit,
            offset=normalized_offset,
        )
        return TasteProfilesListResponse(
            items=[TasteProfileRead.model_validate(profile) for profile in profiles]
        )

    def get_user_profile(self, user_id: UUID, profile_name: str) -> TasteProfileRead:
        if not self.users.exists(user_id):
            raise NotFoundError("User was not found.", details={"user_id": str(user_id)})
        profile = self.profiles.get_by_user_and_name(user_id, profile_name)
        if profile is None:
            raise NotFoundError(
                "Taste profile was not found.",
                details={"user_id": str(user_id), "profile_name": profile_name},
            )
        return TasteProfileRead.model_validate(profile)
