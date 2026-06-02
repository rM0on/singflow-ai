from __future__ import annotations

import argparse
from collections import Counter
from collections.abc import Iterable
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from app.data.demo_sessions import DEMO_AGENT_RUNS, DEMO_FEEDBACK_LOGS
from app.data.demo_sessions import DEMO_PLAYLISTS, DEMO_SESSIONS
from app.data.demo_songs import DEMO_SONGS, REQUIRED_LANGUAGES, REQUIRED_SCENE_TAGS
from app.data.demo_users import DEMO_USERS

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

    from app.db.models import AgentRun, Playlist, PlaylistItem, Song, User
else:
    Session = Any


DEMO_MODEL_NAME = "deterministic-demo-bootstrap"
BASE_DEMO_TIME = datetime(2026, 6, 2, 12, 0, tzinfo=timezone.utc)
FORBIDDEN_CONTENT_KEYS = {
    "lyrics",
    "audio",
    "audio_url",
    "mv",
    "mv_url",
    "real_cover_url",
    "brand_asset_url",
    "pirate",
    "api_key",
    "external_platform_url",
    "album_cover_url",
    "real_album",
    "real_artist",
    "spotify",
    "apple_music",
    "youtube_music",
    "netease",
    "qq_music",
    "chain-of-thought",
    "openai",
    "claude",
    "gemini",
}


@dataclass
class BootstrapSummary:
    songs_seen: int = 0
    songs_created: int = 0
    songs_updated: int = 0
    users_created: int = 0
    users_updated: int = 0
    taste_profiles_created: int = 0
    taste_profiles_updated: int = 0
    sessions_created: int = 0
    sessions_updated: int = 0
    members_created: int = 0
    members_updated: int = 0
    agent_runs_created: int = 0
    agent_runs_updated: int = 0
    agent_steps_created: int = 0
    agent_steps_updated: int = 0
    playlists_created: int = 0
    playlists_updated: int = 0
    playlist_items_created: int = 0
    playlist_items_updated: int = 0
    reasons_created: int = 0
    reasons_updated: int = 0
    feedback_created: int = 0
    feedback_skipped_existing: int = 0
    coverage: dict[str, Any] = field(default_factory=dict)

    def lines(self) -> list[str]:
        pairs = [
            ("songs_seen", self.songs_seen),
            ("songs_created", self.songs_created),
            ("songs_updated", self.songs_updated),
            ("users_created", self.users_created),
            ("users_updated", self.users_updated),
            ("taste_profiles_created", self.taste_profiles_created),
            ("taste_profiles_updated", self.taste_profiles_updated),
            ("sessions_created", self.sessions_created),
            ("sessions_updated", self.sessions_updated),
            ("members_created", self.members_created),
            ("members_updated", self.members_updated),
            ("agent_runs_created", self.agent_runs_created),
            ("agent_runs_updated", self.agent_runs_updated),
            ("agent_steps_created", self.agent_steps_created),
            ("agent_steps_updated", self.agent_steps_updated),
            ("playlists_created", self.playlists_created),
            ("playlists_updated", self.playlists_updated),
            ("playlist_items_created", self.playlist_items_created),
            ("playlist_items_updated", self.playlist_items_updated),
            ("reasons_created", self.reasons_created),
            ("reasons_updated", self.reasons_updated),
            ("feedback_created", self.feedback_created),
            ("feedback_skipped_existing", self.feedback_skipped_existing),
        ]
        return [f"{name}: {value}" for name, value in pairs]


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Bootstrap copyright-safe SingFlow AI demo metadata.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate demo metadata coverage without connecting to or writing a database.",
    )
    args = parser.parse_args()

    if args.dry_run:
        summary = validate_demo_metadata()
        print_summary(summary, heading="SingFlow AI demo data dry-run")
        return

    validate_demo_metadata()
    summary = bootstrap_demo_data()
    print_summary(summary, heading="SingFlow AI demo data bootstrap")


def validate_demo_metadata() -> BootstrapSummary:
    summary = BootstrapSummary(songs_seen=len(DEMO_SONGS))
    _assert(len(DEMO_SONGS) == 96, "Expected exactly 96 demo songs.")

    language_counts = Counter(song["language"] for song in DEMO_SONGS)
    missing_languages = set(REQUIRED_LANGUAGES) - set(language_counts)
    _assert(not missing_languages, f"Missing languages: {sorted(missing_languages)}")

    scene_counter: Counter[str] = Counter()
    for song in DEMO_SONGS:
        _assert(
            song["language"] in REQUIRED_LANGUAGES,
            f"Unsupported language in song seed {song.get('seed_key')}.",
        )
        _assert(song["source_type"] == "mock", "Demo songs must use source_type=mock.")
        _assert(
            song["rights_status"] == "demo_safe",
            "Demo songs must use rights_status=demo_safe.",
        )
        _assert(
            not _contains_forbidden_content(song),
            f"Forbidden field detected in song seed {song.get('seed_key')}.",
        )
        _assert(
            song["cover_visual_seed"].startswith("abstract-"),
            "cover_visual_seed must be an abstract seed, not a media URL.",
        )
        _assert(0 <= song["energy"] <= 1, "Song energy must stay in the 0-1 range.")
        _assert(
            0 <= song["danceability"] <= 1,
            "Song danceability must stay in the 0-1 range.",
        )
        _assert(
            0 <= song["vocal_difficulty"] <= 1,
            "Song vocal difficulty must stay in the 0-1 range.",
        )
        _assert(
            0 <= song["popularity"] <= 1,
            "Song popularity must stay in the 0-1 range.",
        )
        _assert(song["duration_seconds"] > 0, "Song duration must be positive.")
        _assert(song["bpm"] > 0, "Song BPM must be positive.")
        scene_counter.update(song["scene_tags"])

    missing_scene_tags = set(REQUIRED_SCENE_TAGS) - set(scene_counter)
    _assert(not missing_scene_tags, f"Missing scene tags: {sorted(missing_scene_tags)}")

    for user in DEMO_USERS:
        _assert(
            not _contains_forbidden_content(user),
            f"Forbidden field detected in user seed {user.get('seed_key')}.",
        )
        _assert(user["taste_profiles"], "Each demo user must include taste profiles.")
        for profile in user["taste_profiles"]:
            _assert(
                0 <= profile["energy_min"] <= profile["energy_max"] <= 1,
                f"Invalid energy range in user seed {user.get('seed_key')}.",
            )
            _assert(
                0 <= profile["vocal_difficulty_max"] <= 1,
                f"Invalid vocal difficulty in user seed {user.get('seed_key')}.",
            )
            _assert(
                0 <= profile["confidence"] <= 1,
                f"Invalid confidence in user seed {user.get('seed_key')}.",
            )
            for affinity_map in (
                profile["language_affinity"],
                profile["mood_affinity"],
            ):
                _assert(
                    all(0 <= score <= 1 for score in affinity_map.values()),
                    f"Invalid affinity score in user seed {user.get('seed_key')}.",
                )

    for session in DEMO_SESSIONS:
        _assert(
            session["scene_type"] in {"ktv", "car", "home_party"},
            "Demo sessions must cover supported scene types.",
        )
        _assert(session["members"], "Each demo session must include members.")
        for member in session["members"]:
            _assert(
                0 <= member["preference_weight"] <= 1,
                f"Invalid member weight in session seed {session.get('seed_key')}.",
            )

    playlist_items_count = 0
    for playlist in DEMO_PLAYLISTS:
        target_length = playlist["target_length"]
        matching_songs = _count_matching_song_seeds(playlist)
        _assert(
            matching_songs >= target_length,
            f"Not enough safe songs for playlist seed {playlist['seed_key']}.",
        )
        playlist_items_count += target_length

    for feedback in DEMO_FEEDBACK_LOGS:
        if feedback["playlist_seed_key"] is None:
            continue
        target_length = next(
            playlist["target_length"]
            for playlist in DEMO_PLAYLISTS
            if playlist["seed_key"] == feedback["playlist_seed_key"]
        )
        _assert(
            1 <= feedback["playlist_position"] <= target_length,
            f"Invalid feedback playlist position for {feedback['seed_key']}.",
        )

    failed_runs = [run for run in DEMO_AGENT_RUNS if run["status"] == "failed"]
    _assert(len(failed_runs) == 1, "Exactly one failed demo agent run is expected.")
    for run in DEMO_AGENT_RUNS:
        _assert(run["model_provider"] == "mock", "Demo agent runs must use mock.")
        _assert(
            run["status"] in {"queued", "running", "succeeded", "failed", "cancelled"},
            f"Invalid agent run status in {run['seed_key']}.",
        )
        for step in run["steps"]:
            step_type, _tool_name, status, input_summary, output_summary, latency_ms = step
            _assert(
                step_type in {"plan", "tool_call", "rank", "explain", "memory_write", "finalize"},
                f"Invalid agent step type in {run['seed_key']}.",
            )
            _assert(
                status in {"queued", "running", "succeeded", "failed", "skipped"},
                f"Invalid agent step status in {run['seed_key']}.",
            )
            _assert(latency_ms >= 0, f"Invalid agent step latency in {run['seed_key']}.")
            _assert(
                not _contains_forbidden_content(input_summary)
                and not _contains_forbidden_content(output_summary),
                f"Forbidden step summary content in {run['seed_key']}.",
            )

    summary.coverage = {
        "languages": dict(language_counts),
        "scene_tags": dict(scene_counter),
        "demo_users": len(DEMO_USERS),
        "taste_profiles": sum(len(user["taste_profiles"]) for user in DEMO_USERS),
        "sessions": len(DEMO_SESSIONS),
        "group_members": sum(len(session["members"]) for session in DEMO_SESSIONS),
        "playlists": len(DEMO_PLAYLISTS),
        "playlist_items": playlist_items_count,
        "recommendation_reasons": playlist_items_count,
        "feedback_logs": len(DEMO_FEEDBACK_LOGS),
        "agent_runs": len(DEMO_AGENT_RUNS),
        "agent_steps": sum(len(run["steps"]) for run in DEMO_AGENT_RUNS),
    }
    return summary


def bootstrap_demo_data() -> BootstrapSummary:
    _load_db_dependencies()
    summary = BootstrapSummary(songs_seen=len(DEMO_SONGS))
    db = SessionLocal()
    try:
        song_by_seed = _upsert_songs(db, summary)
        user_by_seed = _upsert_users_and_profiles(db, summary)
        session_by_seed = _upsert_sessions_and_members(db, summary, user_by_seed)
        agent_run_by_seed = _upsert_agent_runs(db, summary, user_by_seed, session_by_seed)
        playlist_by_seed, item_by_playlist_position = _upsert_playlists(
            db,
            summary,
            song_by_seed,
            user_by_seed,
            session_by_seed,
            agent_run_by_seed,
        )
        _upsert_feedback_logs(
            db,
            summary,
            user_by_seed,
            session_by_seed,
            playlist_by_seed,
            item_by_playlist_position,
        )
        db.commit()
        return summary
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def _upsert_songs(db: Session, summary: BootstrapSummary) -> dict[str, Song]:
    songs: dict[str, Song] = {}
    for seed in DEMO_SONGS:
        values = {key: value for key, value in seed.items() if key != "seed_key"}
        values = _coerce_song_values(values)
        song = db.scalar(
            select(Song).where(
                Song.title == values["title"],
                Song.artist_name == values["artist_name"],
                Song.source_type == values["source_type"],
            )
        )
        if song is None:
            song = Song(**values)
            db.add(song)
            summary.songs_created += 1
        else:
            _assign(song, values)
            summary.songs_updated += 1
        db.flush()
        songs[seed["seed_key"]] = song
    return songs


def _upsert_users_and_profiles(
    db: Session,
    summary: BootstrapSummary,
) -> dict[str, User]:
    users: dict[str, User] = {}
    for seed in DEMO_USERS:
        user_values = {
            "display_name": seed["display_name"],
            "avatar_seed": seed["avatar_seed"],
            "locale": seed["locale"],
            "demo_role": seed["demo_role"],
        }
        user = db.scalar(
            select(User).where(
                User.display_name == user_values["display_name"],
                User.avatar_seed == user_values["avatar_seed"],
            )
        )
        if user is None:
            user = User(**user_values)
            db.add(user)
            summary.users_created += 1
        else:
            _assign(user, user_values)
            summary.users_updated += 1
        db.flush()
        users[seed["seed_key"]] = user

        for profile_seed in seed["taste_profiles"]:
            profile_values = _coerce_profile_values(
                {
                    **profile_seed,
                    "user_id": user.id,
                }
            )
            profile = db.scalar(
                select(TasteProfile).where(
                    TasteProfile.user_id == user.id,
                    TasteProfile.profile_name == profile_values["profile_name"],
                )
            )
            if profile is None:
                db.add(TasteProfile(**profile_values))
                summary.taste_profiles_created += 1
            else:
                _assign(profile, profile_values)
                summary.taste_profiles_updated += 1
            db.flush()
    return users


def _upsert_sessions_and_members(
    db: Session,
    summary: BootstrapSummary,
    user_by_seed: dict[str, User],
) -> dict[str, KaraokeSession]:
    sessions: dict[str, KaraokeSession] = {}
    for seed in DEMO_SESSIONS:
        host_user = user_by_seed[seed["host_user_seed_key"]]
        session_values = {
            "host_user_id": host_user.id,
            "title": seed["title"],
            "scene_type": seed["scene_type"],
            "scene_prompt": seed["scene_prompt"],
            "status": seed["status"],
            "target_energy_curve": seed["target_energy_curve"],
            "constraints": seed["constraints"],
            "started_at": _demo_time(hours=-6),
            "ended_at": None,
        }
        session = db.scalar(
            select(KaraokeSession).where(
                KaraokeSession.title == seed["title"],
                KaraokeSession.scene_type == seed["scene_type"],
            )
        )
        if session is None:
            session = KaraokeSession(**session_values)
            db.add(session)
            summary.sessions_created += 1
        else:
            _assign(session, session_values)
            summary.sessions_updated += 1
        db.flush()
        sessions[seed["seed_key"]] = session

        for member_seed in seed["members"]:
            user = user_by_seed[member_seed["user_seed_key"]]
            member_values = {
                "karaoke_session_id": session.id,
                "user_id": user.id,
                "role": member_seed["role"],
                "preference_weight": _decimal(member_seed["preference_weight"]),
                "preference_hint": member_seed["preference_hint"],
            }
            member = db.scalar(
                select(GroupMember).where(
                    GroupMember.karaoke_session_id == session.id,
                    GroupMember.user_id == user.id,
                )
            )
            if member is None:
                db.add(GroupMember(**member_values))
                summary.members_created += 1
            else:
                _assign(member, member_values)
                summary.members_updated += 1
            db.flush()
    return sessions


def _load_db_dependencies() -> None:
    global AgentRun
    global AgentStep
    global FeedbackLog
    global GroupMember
    global KaraokeSession
    global Playlist
    global PlaylistItem
    global RecommendationReason
    global SessionLocal
    global Song
    global TasteProfile
    global User
    global select

    from sqlalchemy import select as sqlalchemy_select

    from app.db.models import AgentRun as ModelAgentRun
    from app.db.models import AgentStep as ModelAgentStep
    from app.db.models import FeedbackLog as ModelFeedbackLog
    from app.db.models import GroupMember as ModelGroupMember
    from app.db.models import KaraokeSession as ModelKaraokeSession
    from app.db.models import Playlist as ModelPlaylist
    from app.db.models import PlaylistItem as ModelPlaylistItem
    from app.db.models import RecommendationReason as ModelRecommendationReason
    from app.db.models import Song as ModelSong
    from app.db.models import TasteProfile as ModelTasteProfile
    from app.db.models import User as ModelUser
    from app.db.session import SessionLocal as ModelSessionLocal

    AgentRun = ModelAgentRun
    AgentStep = ModelAgentStep
    FeedbackLog = ModelFeedbackLog
    GroupMember = ModelGroupMember
    KaraokeSession = ModelKaraokeSession
    Playlist = ModelPlaylist
    PlaylistItem = ModelPlaylistItem
    RecommendationReason = ModelRecommendationReason
    SessionLocal = ModelSessionLocal
    Song = ModelSong
    TasteProfile = ModelTasteProfile
    User = ModelUser
    select = sqlalchemy_select


def _upsert_agent_runs(
    db: Session,
    summary: BootstrapSummary,
    user_by_seed: dict[str, User],
    session_by_seed: dict[str, KaraokeSession],
) -> dict[str, AgentRun]:
    agent_runs: dict[str, AgentRun] = {}
    for seed in DEMO_AGENT_RUNS:
        session = session_by_seed[seed["session_seed_key"]]
        user = user_by_seed[seed["user_seed_key"]]
        run_values = {
            "karaoke_session_id": session.id,
            "user_id": user.id,
            "objective": seed["objective"],
            "run_type": seed["run_type"],
            "status": seed["status"],
            "model_provider": seed["model_provider"],
            "model_name": seed["model_name"],
            "input_summary": seed["input_summary"],
            "output_summary": seed["output_summary"],
            "error_message": seed.get("error_message"),
            "started_at": _demo_time(hours=-5),
            "ended_at": _demo_time(hours=-5, minutes=2),
            "latency_ms": seed["latency_ms"],
        }
        agent_run = db.scalar(
            select(AgentRun).where(
                AgentRun.karaoke_session_id == session.id,
                AgentRun.objective == seed["objective"],
                AgentRun.run_type == seed["run_type"],
            )
        )
        if agent_run is None:
            agent_run = AgentRun(**run_values)
            db.add(agent_run)
            summary.agent_runs_created += 1
        else:
            _assign(agent_run, run_values)
            summary.agent_runs_updated += 1
        db.flush()
        agent_runs[seed["seed_key"]] = agent_run

        for step_index, step_seed in enumerate(seed["steps"], start=1):
            step_type, tool_name, status, input_summary, output_summary, latency_ms = step_seed
            step_values = {
                "agent_run_id": agent_run.id,
                "step_index": step_index,
                "step_type": step_type,
                "tool_name": tool_name,
                "status": status,
                "input_summary": input_summary,
                "output_summary": output_summary,
                "error_message": (
                    "Safe demo failure summary."
                    if seed["status"] == "failed" and status == "failed"
                    else None
                ),
                "started_at": _demo_time(hours=-5, minutes=step_index),
                "ended_at": _demo_time(hours=-5, minutes=step_index + 1),
                "latency_ms": latency_ms,
            }
            step = db.scalar(
                select(AgentStep).where(
                    AgentStep.agent_run_id == agent_run.id,
                    AgentStep.step_index == step_index,
                )
            )
            if step is None:
                db.add(AgentStep(**step_values))
                summary.agent_steps_created += 1
            else:
                _assign(step, step_values)
                summary.agent_steps_updated += 1
            db.flush()
    return agent_runs


def _upsert_playlists(
    db: Session,
    summary: BootstrapSummary,
    song_by_seed: dict[str, Song],
    user_by_seed: dict[str, User],
    session_by_seed: dict[str, KaraokeSession],
    agent_run_by_seed: dict[str, AgentRun],
) -> tuple[dict[str, Playlist], dict[tuple[str, int], PlaylistItem]]:
    playlists: dict[str, Playlist] = {}
    item_by_playlist_position: dict[tuple[str, int], PlaylistItem] = {}
    for seed in DEMO_PLAYLISTS:
        session = session_by_seed[seed["session_seed_key"]]
        agent_run = agent_run_by_seed[seed["agent_run_seed_key"]]
        created_by_user = user_by_seed[seed["created_by_user_seed_key"]]
        playlist_values = {
            "karaoke_session_id": session.id,
            "agent_run_id": agent_run.id,
            "created_by_user_id": created_by_user.id,
            "title": seed["title"],
            "description": seed["description"],
            "scene_type": session.scene_type,
            "generation_prompt": seed["generation_prompt"],
            "status": "generated",
            "target_length": seed["target_length"],
            "score_summary": seed["score_summary"],
        }
        playlist = db.scalar(
            select(Playlist).where(
                Playlist.karaoke_session_id == session.id,
                Playlist.title == seed["title"],
            )
        )
        if playlist is None:
            playlist = Playlist(**playlist_values)
            db.add(playlist)
            summary.playlists_created += 1
        else:
            _assign(playlist, playlist_values)
            summary.playlists_updated += 1
        db.flush()
        playlists[seed["seed_key"]] = playlist

        selected_songs = _select_playlist_songs(song_by_seed.values(), seed)
        for position, song in enumerate(selected_songs, start=1):
            item_values = {
                "playlist_id": playlist.id,
                "song_id": song.id,
                "position": position,
                "fit_score": _fit_score(position, len(selected_songs)),
                "score_breakdown": {
                    "scene_fit": round(0.9 - (position * 0.012), 3),
                    "group_taste_fit": round(0.84 - (position * 0.01), 3),
                    "energy_curve_fit": round(0.86 - (position * 0.008), 3),
                    "safety_filter": 1.0,
                    "demo_seed_key": seed["seed_key"],
                },
                "transition_note": f"Demo position {position} keeps the mock energy arc readable.",
                "source": "agent",
            }
            item = db.scalar(
                select(PlaylistItem).where(
                    PlaylistItem.playlist_id == playlist.id,
                    PlaylistItem.position == position,
                )
            )
            if item is None:
                item = PlaylistItem(**item_values)
                db.add(item)
                summary.playlist_items_created += 1
            else:
                _assign(item, item_values)
                summary.playlist_items_updated += 1
            db.flush()
            item_by_playlist_position[(seed["seed_key"], position)] = item

            reason_values = {
                "playlist_item_id": item.id,
                "agent_run_id": agent_run.id,
                "reason_type": seed["reason_type"],
                "short_reason": seed["reason_text"],
                "evidence": {
                    "matched_scene_tags": [
                        tag
                        for tag in song.scene_tags
                        if tag in seed["song_filters"]["scene_tags"]
                    ],
                    "language": song.language,
                    "fit_score": float(item_values["fit_score"]),
                    "demo_seed_key": seed["seed_key"],
                },
                "confidence": Decimal("0.860"),
            }
            reason = db.scalar(
                select(RecommendationReason).where(
                    RecommendationReason.playlist_item_id == item.id,
                    RecommendationReason.reason_type == seed["reason_type"],
                )
            )
            if reason is None:
                db.add(RecommendationReason(**reason_values))
                summary.reasons_created += 1
            else:
                _assign(reason, reason_values)
                summary.reasons_updated += 1
            db.flush()

        agent_run.output_summary = {
            **(agent_run.output_summary or {}),
            "playlist_id": str(playlist.id),
            "items_count": len(selected_songs),
            "status": "saved",
        }
        db.flush()
    return playlists, item_by_playlist_position


def _upsert_feedback_logs(
    db: Session,
    summary: BootstrapSummary,
    user_by_seed: dict[str, User],
    session_by_seed: dict[str, KaraokeSession],
    playlist_by_seed: dict[str, Playlist],
    item_by_playlist_position: dict[tuple[str, int], PlaylistItem],
) -> None:
    for seed in DEMO_FEEDBACK_LOGS:
        existing = db.scalar(
            select(FeedbackLog).where(
                FeedbackLog.event_payload.contains({"demo_seed_key": seed["seed_key"]})
            )
        )
        if existing is not None:
            summary.feedback_skipped_existing += 1
            continue

        session = session_by_seed[seed["session_seed_key"]]
        user = user_by_seed[seed["user_seed_key"]]
        playlist = (
            playlist_by_seed[seed["playlist_seed_key"]]
            if seed["playlist_seed_key"] is not None
            else None
        )
        item = (
            item_by_playlist_position[
                (seed["playlist_seed_key"], seed["playlist_position"])
            ]
            if seed["playlist_seed_key"] is not None
            and seed["playlist_position"] is not None
            else None
        )
        values = {
            "karaoke_session_id": session.id,
            "playlist_id": playlist.id if playlist is not None else None,
            "playlist_item_id": item.id if item is not None else None,
            "song_id": item.song_id if item is not None else None,
            "user_id": user.id,
            "feedback_type": seed["feedback_type"],
            "rating": seed["rating"],
            "reason": seed["reason"],
            "event_payload": {
                "demo_seed_key": seed["seed_key"],
                "memory_update_status": "queued"
                if seed["feedback_type"] in {"liked", "great_for_group"}
                else "skipped",
            },
        }
        db.add(FeedbackLog(**values))
        summary.feedback_created += 1
        db.flush()


def _select_playlist_songs(candidates: Iterable[Song], playlist_seed: dict) -> list[Song]:
    filters = playlist_seed["song_filters"]
    languages = set(filters["languages"])
    scene_tags = set(filters["scene_tags"])
    max_vocal_difficulty = float(filters["max_vocal_difficulty"])
    matched = [
        song
        for song in candidates
        if song.rights_status == "demo_safe"
        and song.source_type == "mock"
        and song.language in languages
        and float(song.vocal_difficulty) <= max_vocal_difficulty
        and scene_tags.intersection(song.scene_tags)
    ]
    matched.sort(
        key=lambda song: (
            -len(scene_tags.intersection(song.scene_tags)),
            float(song.energy),
            song.language,
            song.title,
        )
    )
    target_length = playlist_seed["target_length"]
    _assert(
        len(matched) >= target_length,
        f"Not enough safe songs for playlist seed {playlist_seed['seed_key']}.",
    )
    return matched[:target_length]


def _count_matching_song_seeds(playlist_seed: dict) -> int:
    filters = playlist_seed["song_filters"]
    languages = set(filters["languages"])
    scene_tags = set(filters["scene_tags"])
    max_vocal_difficulty = float(filters["max_vocal_difficulty"])
    return sum(
        1
        for song in DEMO_SONGS
        if song["rights_status"] == "demo_safe"
        and song["source_type"] == "mock"
        and song["language"] in languages
        and float(song["vocal_difficulty"]) <= max_vocal_difficulty
        and scene_tags.intersection(song["scene_tags"])
    )


def _coerce_song_values(values: dict[str, Any]) -> dict[str, Any]:
    coerced = dict(values)
    for field_name in ("energy", "danceability", "vocal_difficulty", "popularity"):
        coerced[field_name] = _decimal(coerced[field_name])
    return coerced


def _coerce_profile_values(values: dict[str, Any]) -> dict[str, Any]:
    coerced = dict(values)
    for field_name in (
        "energy_min",
        "energy_max",
        "vocal_difficulty_max",
        "confidence",
    ):
        coerced[field_name] = _decimal(coerced[field_name])
    return coerced


def _fit_score(position: int, target_length: int) -> Decimal:
    if target_length <= 1:
        return Decimal("0.8500")
    value = Decimal("0.9200") - (
        Decimal(position - 1) * Decimal("0.1800") / Decimal(target_length - 1)
    )
    return value.quantize(Decimal("0.0001"))


def _decimal(value: int | float | str) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.001"))


def _assign(instance: Any, values: dict[str, Any]) -> None:
    for key, value in values.items():
        setattr(instance, key, value)


def _demo_time(*, hours: int = 0, minutes: int = 0) -> datetime:
    return BASE_DEMO_TIME + timedelta(hours=hours, minutes=minutes)


def _contains_forbidden_content(value: Any) -> bool:
    if isinstance(value, dict):
        for key, item in value.items():
            if str(key).lower() in FORBIDDEN_CONTENT_KEYS:
                return True
            if _contains_forbidden_content(item):
                return True
    elif isinstance(value, (list, tuple)):
        return any(_contains_forbidden_content(item) for item in value)
    elif isinstance(value, str):
        normalized = value.lower()
        return any(forbidden in normalized for forbidden in FORBIDDEN_CONTENT_KEYS)
    return False


def _assert(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def print_summary(summary: BootstrapSummary, *, heading: str) -> None:
    print(heading)
    print("=" * len(heading))
    if summary.coverage:
        print("coverage:")
        for key, value in summary.coverage.items():
            print(f"  {key}: {value}")
    for line in summary.lines():
        print(line)


if __name__ == "__main__":
    main()
