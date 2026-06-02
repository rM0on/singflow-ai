from __future__ import annotations

from collections.abc import Mapping
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import User


class UsersRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: UUID) -> User | None:
        return self.db.get(User, user_id)

    def exists(self, user_id: UUID) -> bool:
        stmt = select(func.count()).select_from(User).where(User.id == user_id)
        return bool(self.db.scalar(stmt))

    def list_demo_users(
        self,
        *,
        role: str | None = None,
        locale: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[User]:
        stmt = select(User)
        if role:
            stmt = stmt.where(User.demo_role == role)
        if locale:
            stmt = stmt.where(User.locale == locale)
        stmt = stmt.order_by(User.display_name).limit(limit).offset(offset)
        return list(self.db.scalars(stmt))

    def create(self, values: Mapping[str, Any]) -> User:
        user = User(**dict(values))
        self.db.add(user)
        self.db.flush()
        return user

    def update(self, user: User, values: Mapping[str, Any]) -> User:
        for key, value in values.items():
            setattr(user, key, value)
        self.db.flush()
        return user
