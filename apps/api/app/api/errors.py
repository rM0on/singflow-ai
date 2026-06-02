from __future__ import annotations

from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from app.core.errors import AppError, ConflictError, DatabaseOperationError
from app.core.errors import MockFallbackError, NotFoundError, UnsafeContentError
from app.core.errors import ValidationAppError
from app.schemas.common import ErrorBody, ErrorEnvelope


ERROR_RESPONSES = {
    400: {"model": ErrorEnvelope},
    404: {"model": ErrorEnvelope},
    409: {"model": ErrorEnvelope},
    422: {"model": ErrorEnvelope},
    500: {"model": ErrorEnvelope},
    503: {"model": ErrorEnvelope},
}


def app_error_response(error: AppError) -> JSONResponse:
    envelope = ErrorEnvelope(
        error=ErrorBody(
            code=error.code,
            message=error.message,
            details=error.details,
        )
    )
    return JSONResponse(
        status_code=_status_code_for_error(error),
        content=jsonable_encoder(envelope),
    )


def _status_code_for_error(error: AppError) -> int:
    if isinstance(error, NotFoundError):
        return 404
    if isinstance(error, ConflictError):
        return 409
    if isinstance(error, UnsafeContentError):
        return 422
    if isinstance(error, ValidationAppError):
        return 400
    if isinstance(error, MockFallbackError):
        return 503
    if isinstance(error, DatabaseOperationError):
        return 500
    return 500
