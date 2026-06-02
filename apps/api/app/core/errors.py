from __future__ import annotations

from typing import Any


class AppError(Exception):
    code = "APP_ERROR"

    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details


class NotFoundError(AppError):
    code = "NOT_FOUND"


class ValidationAppError(AppError):
    code = "VALIDATION_ERROR"


class ConflictError(AppError):
    code = "CONFLICT"


class UnsafeContentError(AppError):
    code = "UNSAFE_CONTENT_BLOCKED"


class DatabaseOperationError(AppError):
    code = "DATABASE_OPERATION_ERROR"


class MockFallbackError(AppError):
    code = "MOCK_FALLBACK_ERROR"
