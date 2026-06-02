from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index
from sqlalchemy import Integer, Numeric, Text
from sqlalchemy import UniqueConstraint, func, text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UUIDPrimaryKeyMixin:
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )


class CreatedAtMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class UpdatedAtMixin:
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=func.now(),
    )


class Song(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "songs"
    __table_args__ = (
        CheckConstraint(
            "language IN ('en', 'zh', 'cantonese', 'mixed')",
            name="ck_songs_language",
        ),
        CheckConstraint(
            "energy >= 0 AND energy <= 1",
            name="ck_songs_energy_score",
        ),
        CheckConstraint(
            "danceability IS NULL OR (danceability >= 0 AND danceability <= 1)",
            name="ck_songs_danceability_score",
        ),
        CheckConstraint(
            "vocal_difficulty >= 0 AND vocal_difficulty <= 1",
            name="ck_songs_vocal_difficulty_score",
        ),
        CheckConstraint(
            "popularity IS NULL OR (popularity >= 0 AND popularity <= 1)",
            name="ck_songs_popularity_score",
        ),
        CheckConstraint(
            "source_type IN ('mock', 'licensed', 'public_domain')",
            name="ck_songs_source_type",
        ),
        CheckConstraint(
            "rights_status IN ('demo_safe', 'licensed', 'unknown_blocked')",
            name="ck_songs_rights_status",
        ),
        CheckConstraint("bpm IS NULL OR bpm > 0", name="ck_songs_bpm_positive"),
        CheckConstraint(
            "duration_seconds IS NULL OR duration_seconds > 0",
            name="ck_songs_duration_positive",
        ),
        Index("idx_songs_language", "language"),
        Index("idx_songs_genres_gin", "genres", postgresql_using="gin"),
        Index("idx_songs_moods_gin", "moods", postgresql_using="gin"),
        Index("idx_songs_scene_tags_gin", "scene_tags", postgresql_using="gin"),
        Index("idx_songs_energy", "energy"),
        Index("idx_songs_rights_status", "rights_status"),
        Index(
            "idx_songs_search",
            text(
                "to_tsvector('simple', "
                "coalesce(title, '') || ' ' || coalesce(artist_name, ''))"
            ),
            postgresql_using="gin",
        ),
    )

    title: Mapped[str] = mapped_column(Text, nullable=False)
    artist_name: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(Text, nullable=False)
    genres: Mapped[list[str]] = mapped_column(ARRAY(Text()), nullable=False)
    moods: Mapped[list[str]] = mapped_column(ARRAY(Text()), nullable=False)
    scene_tags: Mapped[list[str]] = mapped_column(ARRAY(Text()), nullable=False)
    energy: Mapped[Decimal] = mapped_column(Numeric(4, 3), nullable=False)
    danceability: Mapped[Decimal | None] = mapped_column(Numeric(4, 3), nullable=True)
    vocal_difficulty: Mapped[Decimal] = mapped_column(Numeric(4, 3), nullable=False)
    bpm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    release_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    popularity: Mapped[Decimal | None] = mapped_column(Numeric(4, 3), nullable=True)
    cover_visual_seed: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_type: Mapped[str] = mapped_column(Text, nullable=False)
    rights_status: Mapped[str] = mapped_column(Text, nullable=False)

    playlist_items: Mapped[list[PlaylistItem]] = relationship(back_populates="song")
    feedback_logs: Mapped[list[FeedbackLog]] = relationship(back_populates="song")


class User(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "demo_role IS NULL OR demo_role IN "
            "('host', 'guest', 'reviewer', 'developer')",
            name="ck_users_demo_role",
        ),
        Index("idx_users_display_name", "display_name"),
        Index("idx_users_locale", "locale"),
    )

    display_name: Mapped[str] = mapped_column(Text, nullable=False)
    avatar_seed: Mapped[str | None] = mapped_column(Text, nullable=True)
    locale: Mapped[str | None] = mapped_column(Text, nullable=True)
    demo_role: Mapped[str | None] = mapped_column(Text, nullable=True)

    hosted_sessions: Mapped[list[KaraokeSession]] = relationship(
        back_populates="host_user",
        foreign_keys="KaraokeSession.host_user_id",
    )
    group_memberships: Mapped[list[GroupMember]] = relationship(back_populates="user")
    taste_profiles: Mapped[list[TasteProfile]] = relationship(back_populates="user")
    created_playlists: Mapped[list[Playlist]] = relationship(
        back_populates="created_by_user",
        foreign_keys="Playlist.created_by_user_id",
    )
    feedback_logs: Mapped[list[FeedbackLog]] = relationship(back_populates="user")
    agent_runs: Mapped[list[AgentRun]] = relationship(back_populates="user")


class KaraokeSession(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "karaoke_sessions"
    __table_args__ = (
        CheckConstraint(
            "scene_type IN ('ktv', 'car', 'home_party', 'custom')",
            name="ck_karaoke_sessions_scene_type",
        ),
        CheckConstraint(
            "status IN ('draft', 'active', 'ended', 'archived')",
            name="ck_karaoke_sessions_status",
        ),
        CheckConstraint(
            "target_energy_curve IS NULL OR target_energy_curve IN "
            "('ramp_up', 'steady', 'cool_down', 'wave')",
            name="ck_karaoke_sessions_target_energy_curve",
        ),
        Index("idx_sessions_host_user_id", "host_user_id"),
        Index("idx_sessions_scene_type", "scene_type"),
        Index("idx_sessions_status", "status"),
        Index("idx_sessions_created_at", "created_at"),
    )

    host_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    scene_type: Mapped[str] = mapped_column(Text, nullable=False)
    scene_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(Text, nullable=False)
    target_energy_curve: Mapped[str | None] = mapped_column(Text, nullable=True)
    constraints: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    host_user: Mapped[User | None] = relationship(
        back_populates="hosted_sessions",
        foreign_keys=[host_user_id],
    )
    members: Mapped[list[GroupMember]] = relationship(back_populates="session")
    playlists: Mapped[list[Playlist]] = relationship(back_populates="session")
    feedback_logs: Mapped[list[FeedbackLog]] = relationship(back_populates="session")
    agent_runs: Mapped[list[AgentRun]] = relationship(back_populates="session")


class GroupMember(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "group_members"
    __table_args__ = (
        CheckConstraint(
            "role IN ('host', 'guest', 'observer')",
            name="ck_group_members_role",
        ),
        CheckConstraint(
            "preference_weight >= 0 AND preference_weight <= 1",
            name="ck_group_members_preference_weight",
        ),
        UniqueConstraint(
            "karaoke_session_id",
            "user_id",
            name="uq_group_members_session_user",
        ),
        Index("idx_group_members_session", "karaoke_session_id"),
        Index("idx_group_members_user", "user_id"),
    )

    karaoke_session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("karaoke_sessions.id"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(Text, nullable=False)
    preference_weight: Mapped[Decimal] = mapped_column(
        Numeric(4, 3),
        nullable=False,
        server_default=text("1.000"),
    )
    preference_hint: Mapped[str | None] = mapped_column(Text, nullable=True)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    session: Mapped[KaraokeSession] = relationship(back_populates="members")
    user: Mapped[User] = relationship(back_populates="group_memberships")


class TasteProfile(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "taste_profiles"
    __table_args__ = (
        CheckConstraint(
            "confidence >= 0 AND confidence <= 1",
            name="ck_taste_profiles_confidence",
        ),
        CheckConstraint(
            "energy_min IS NULL OR (energy_min >= 0 AND energy_min <= 1)",
            name="ck_taste_profiles_energy_min",
        ),
        CheckConstraint(
            "energy_max IS NULL OR (energy_max >= 0 AND energy_max <= 1)",
            name="ck_taste_profiles_energy_max",
        ),
        CheckConstraint(
            "energy_min IS NULL OR energy_max IS NULL OR energy_min <= energy_max",
            name="ck_taste_profiles_energy_range",
        ),
        CheckConstraint(
            "vocal_difficulty_max IS NULL OR "
            "(vocal_difficulty_max >= 0 AND vocal_difficulty_max <= 1)",
            name="ck_taste_profiles_vocal_difficulty_max",
        ),
        UniqueConstraint("user_id", "profile_name", name="uq_taste_profiles_user_name"),
        Index("idx_taste_profiles_user", "user_id"),
        Index("idx_taste_profiles_updated_at", "updated_at"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    profile_name: Mapped[str] = mapped_column(Text, nullable=False)
    favorite_genres: Mapped[list[str] | None] = mapped_column(
        ARRAY(Text()),
        nullable=True,
    )
    avoided_genres: Mapped[list[str] | None] = mapped_column(
        ARRAY(Text()),
        nullable=True,
    )
    language_affinity: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    mood_affinity: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    artist_affinity: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    energy_min: Mapped[Decimal | None] = mapped_column(Numeric(4, 3), nullable=True)
    energy_max: Mapped[Decimal | None] = mapped_column(Numeric(4, 3), nullable=True)
    vocal_difficulty_max: Mapped[Decimal | None] = mapped_column(
        Numeric(4, 3),
        nullable=True,
    )
    confidence: Mapped[Decimal] = mapped_column(Numeric(4, 3), nullable=False)
    last_feedback_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    user: Mapped[User] = relationship(back_populates="taste_profiles")


class AgentRun(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "agent_runs"
    __table_args__ = (
        CheckConstraint(
            "run_type IN "
            "('playlist_generation', 'feedback_memory', 'dashboard_summary')",
            name="ck_agent_runs_run_type",
        ),
        CheckConstraint(
            "status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')",
            name="ck_agent_runs_status",
        ),
        CheckConstraint(
            "model_provider IN ('mock', 'openai')",
            name="ck_agent_runs_model_provider",
        ),
        CheckConstraint(
            "latency_ms IS NULL OR latency_ms >= 0",
            name="ck_agent_runs_latency_ms",
        ),
        Index("idx_agent_runs_session", "karaoke_session_id"),
        Index("idx_agent_runs_status", "status"),
        Index("idx_agent_runs_type", "run_type"),
        Index("idx_agent_runs_created_at", "created_at"),
    )

    karaoke_session_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("karaoke_sessions.id"),
        nullable=True,
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )
    objective: Mapped[str] = mapped_column(Text, nullable=False)
    run_type: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False)
    model_provider: Mapped[str] = mapped_column(Text, nullable=False)
    model_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    input_summary: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    output_summary: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    session: Mapped[KaraokeSession | None] = relationship(back_populates="agent_runs")
    user: Mapped[User | None] = relationship(back_populates="agent_runs")
    steps: Mapped[list[AgentStep]] = relationship(back_populates="agent_run")
    playlists: Mapped[list[Playlist]] = relationship(back_populates="agent_run")
    recommendation_reasons: Mapped[list[RecommendationReason]] = relationship(
        back_populates="agent_run",
    )


class Playlist(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "playlists"
    __table_args__ = (
        CheckConstraint(
            "scene_type IN ('ktv', 'car', 'home_party', 'custom')",
            name="ck_playlists_scene_type",
        ),
        CheckConstraint(
            "status IN ('draft', 'generated', 'edited', 'archived')",
            name="ck_playlists_status",
        ),
        CheckConstraint("target_length > 0", name="ck_playlists_target_length"),
        Index("idx_playlists_session", "karaoke_session_id"),
        Index("idx_playlists_agent_run", "agent_run_id"),
        Index("idx_playlists_status", "status"),
        Index("idx_playlists_created_at", "created_at"),
    )

    karaoke_session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("karaoke_sessions.id"),
        nullable=False,
    )
    agent_run_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("agent_runs.id"),
        nullable=True,
    )
    created_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    scene_type: Mapped[str] = mapped_column(Text, nullable=False)
    generation_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(Text, nullable=False)
    target_length: Mapped[int] = mapped_column(Integer, nullable=False)
    score_summary: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    session: Mapped[KaraokeSession] = relationship(back_populates="playlists")
    agent_run: Mapped[AgentRun | None] = relationship(back_populates="playlists")
    created_by_user: Mapped[User | None] = relationship(
        back_populates="created_playlists",
        foreign_keys=[created_by_user_id],
    )
    items: Mapped[list[PlaylistItem]] = relationship(back_populates="playlist")
    feedback_logs: Mapped[list[FeedbackLog]] = relationship(back_populates="playlist")


class PlaylistItem(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "playlist_items"
    __table_args__ = (
        CheckConstraint("position >= 1", name="ck_playlist_items_position"),
        CheckConstraint(
            "fit_score >= 0 AND fit_score <= 1",
            name="ck_playlist_items_fit_score",
        ),
        CheckConstraint(
            "source IN ('agent', 'manual', 'seed')",
            name="ck_playlist_items_source",
        ),
        UniqueConstraint(
            "playlist_id",
            "position",
            name="uq_playlist_items_position",
        ),
        Index("idx_playlist_items_playlist", "playlist_id"),
        Index("idx_playlist_items_song", "song_id"),
        Index("idx_playlist_items_fit_score", "fit_score"),
    )

    playlist_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("playlists.id"),
        nullable=False,
    )
    song_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("songs.id"),
        nullable=False,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    fit_score: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    score_breakdown: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    transition_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(Text, nullable=False)

    playlist: Mapped[Playlist] = relationship(back_populates="items")
    song: Mapped[Song] = relationship(back_populates="playlist_items")
    feedback_logs: Mapped[list[FeedbackLog]] = relationship(
        back_populates="playlist_item",
    )
    recommendation_reasons: Mapped[list[RecommendationReason]] = relationship(
        back_populates="playlist_item",
    )


class FeedbackLog(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "feedback_logs"
    __table_args__ = (
        CheckConstraint(
            "feedback_type IN "
            "('liked', 'skipped', 'too_slow', 'too_intense', 'too_high', "
            "'wrong_language', 'great_for_group')",
            name="ck_feedback_logs_feedback_type",
        ),
        CheckConstraint(
            "rating IS NULL OR (rating >= 1 AND rating <= 5)",
            name="ck_feedback_logs_rating",
        ),
        Index("idx_feedback_session", "karaoke_session_id"),
        Index("idx_feedback_user", "user_id"),
        Index("idx_feedback_item", "playlist_item_id"),
        Index("idx_feedback_type", "feedback_type"),
        Index("idx_feedback_created_at", "created_at"),
    )

    karaoke_session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("karaoke_sessions.id"),
        nullable=False,
    )
    playlist_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("playlists.id"),
        nullable=True,
    )
    playlist_item_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("playlist_items.id"),
        nullable=True,
    )
    song_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("songs.id"),
        nullable=True,
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )
    feedback_type: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_payload: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    session: Mapped[KaraokeSession] = relationship(back_populates="feedback_logs")
    playlist: Mapped[Playlist | None] = relationship(back_populates="feedback_logs")
    playlist_item: Mapped[PlaylistItem | None] = relationship(
        back_populates="feedback_logs",
    )
    song: Mapped[Song | None] = relationship(back_populates="feedback_logs")
    user: Mapped[User | None] = relationship(back_populates="feedback_logs")


class AgentStep(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "agent_steps"
    __table_args__ = (
        CheckConstraint("step_index >= 1", name="ck_agent_steps_step_index"),
        CheckConstraint(
            "step_type IN ('plan', 'tool_call', 'rank', 'explain', "
            "'memory_write', 'finalize')",
            name="ck_agent_steps_step_type",
        ),
        CheckConstraint(
            "status IN ('queued', 'running', 'succeeded', 'failed', 'skipped')",
            name="ck_agent_steps_status",
        ),
        CheckConstraint(
            "latency_ms IS NULL OR latency_ms >= 0",
            name="ck_agent_steps_latency_ms",
        ),
        UniqueConstraint("agent_run_id", "step_index", name="uq_agent_steps_run_index"),
        Index("idx_agent_steps_run", "agent_run_id"),
        Index("idx_agent_steps_status", "status"),
        Index("idx_agent_steps_tool_name", "tool_name"),
    )

    agent_run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("agent_runs.id"),
        nullable=False,
    )
    step_index: Mapped[int] = mapped_column(Integer, nullable=False)
    step_type: Mapped[str] = mapped_column(Text, nullable=False)
    tool_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(Text, nullable=False)
    input_summary: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    output_summary: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    agent_run: Mapped[AgentRun] = relationship(back_populates="steps")


class RecommendationReason(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "recommendation_reasons"
    __table_args__ = (
        CheckConstraint(
            "reason_type IN ('scene_fit', 'group_fit', 'energy_curve', "
            "'memory', 'diversity')",
            name="ck_recommendation_reasons_reason_type",
        ),
        CheckConstraint(
            "confidence IS NULL OR (confidence >= 0 AND confidence <= 1)",
            name="ck_recommendation_reasons_confidence",
        ),
        Index("idx_reasons_playlist_item", "playlist_item_id"),
        Index("idx_reasons_agent_run", "agent_run_id"),
        Index("idx_reasons_type", "reason_type"),
    )

    playlist_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("playlist_items.id"),
        nullable=False,
    )
    agent_run_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("agent_runs.id"),
        nullable=True,
    )
    reason_type: Mapped[str] = mapped_column(Text, nullable=False)
    short_reason: Mapped[str] = mapped_column(Text, nullable=False)
    evidence: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    confidence: Mapped[Decimal | None] = mapped_column(Numeric(4, 3), nullable=True)

    playlist_item: Mapped[PlaylistItem] = relationship(
        back_populates="recommendation_reasons",
    )
    agent_run: Mapped[AgentRun | None] = relationship(
        back_populates="recommendation_reasons",
    )
