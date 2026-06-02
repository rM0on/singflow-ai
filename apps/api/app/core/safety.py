from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from app.core.errors import UnsafeContentError


SAFE_RIGHTS_STATUSES = ("demo_safe", "licensed")

UNSAFE_METADATA_FIELDS = frozenset(
    {
        "lyrics",
        "lyric",
        "audio_url",
        "audio_urls",
        "audio_file",
        "audio_file_url",
        "mv_url",
        "music_video_url",
        "real_cover_url",
        "album_cover_url",
        "brand_asset_url",
        "brand_logo_url",
        "pirate",
        "pirate_url",
        "download_url",
        "backing_track_url",
        "karaoke_track_url",
    }
)


def find_unsafe_metadata_fields(payload: Any) -> set[str]:
    found: set[str] = set()

    if isinstance(payload, Mapping):
        for key, value in payload.items():
            normalized_key = str(key).lower()
            if normalized_key in UNSAFE_METADATA_FIELDS:
                found.add(normalized_key)
            found.update(find_unsafe_metadata_fields(value))
    elif isinstance(payload, list | tuple):
        for item in payload:
            found.update(find_unsafe_metadata_fields(item))

    return found


def assert_metadata_safe(payload: Mapping[str, Any]) -> None:
    unsafe_fields = find_unsafe_metadata_fields(payload)
    if unsafe_fields:
        raise UnsafeContentError(
            "Song metadata cannot include unsafe media or asset fields.",
            details={"fields": sorted(unsafe_fields)},
        )


def assert_safe_rights_status(rights_status: str | None) -> None:
    if rights_status not in SAFE_RIGHTS_STATUSES:
        raise UnsafeContentError(
            "Only demo_safe or licensed song metadata can be used here.",
            details={"rights_status": rights_status},
        )


def assert_song_metadata_safe(payload: Mapping[str, Any]) -> None:
    assert_metadata_safe(payload)
    if "rights_status" in payload:
        assert_safe_rights_status(payload.get("rights_status"))
