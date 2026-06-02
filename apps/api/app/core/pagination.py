from __future__ import annotations


DEFAULT_LIMIT = 20
MAX_LIMIT = 100


def normalize_limit_offset(
    limit: int | None = None,
    offset: int | None = None,
    *,
    default_limit: int = DEFAULT_LIMIT,
    max_limit: int = MAX_LIMIT,
) -> tuple[int, int]:
    normalized_limit = default_limit if limit is None else limit
    normalized_offset = 0 if offset is None else offset
    normalized_limit = max(1, min(normalized_limit, max_limit))
    normalized_offset = max(0, normalized_offset)
    return normalized_limit, normalized_offset
