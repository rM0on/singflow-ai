"""Create Phase 2 core business tables.

Revision ID: 20260602_0001
Revises:
Create Date: 2026-06-02
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260602_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def uuid_pk() -> sa.Column:
    return sa.Column(
        "id",
        postgresql.UUID(as_uuid=True),
        primary_key=True,
        server_default=sa.text("gen_random_uuid()"),
    )


def created_at() -> sa.Column:
    return sa.Column(
        "created_at",
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.text("now()"),
    )


def updated_at() -> sa.Column:
    return sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True)


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    op.create_table(
        "songs",
        uuid_pk(),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("artist_name", sa.Text(), nullable=False),
        sa.Column("language", sa.Text(), nullable=False),
        sa.Column("genres", postgresql.ARRAY(sa.Text()), nullable=False),
        sa.Column("moods", postgresql.ARRAY(sa.Text()), nullable=False),
        sa.Column("scene_tags", postgresql.ARRAY(sa.Text()), nullable=False),
        sa.Column("energy", sa.Numeric(4, 3), nullable=False),
        sa.Column("danceability", sa.Numeric(4, 3), nullable=True),
        sa.Column("vocal_difficulty", sa.Numeric(4, 3), nullable=False),
        sa.Column("bpm", sa.Integer(), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("release_year", sa.Integer(), nullable=True),
        sa.Column("popularity", sa.Numeric(4, 3), nullable=True),
        sa.Column("cover_visual_seed", sa.Text(), nullable=True),
        sa.Column("source_type", sa.Text(), nullable=False),
        sa.Column("rights_status", sa.Text(), nullable=False),
        created_at(),
        updated_at(),
        sa.CheckConstraint(
            "language IN ('en', 'zh', 'cantonese', 'mixed')",
            name="ck_songs_language",
        ),
        sa.CheckConstraint(
            "energy >= 0 AND energy <= 1",
            name="ck_songs_energy_score",
        ),
        sa.CheckConstraint(
            "danceability IS NULL OR (danceability >= 0 AND danceability <= 1)",
            name="ck_songs_danceability_score",
        ),
        sa.CheckConstraint(
            "vocal_difficulty >= 0 AND vocal_difficulty <= 1",
            name="ck_songs_vocal_difficulty_score",
        ),
        sa.CheckConstraint(
            "popularity IS NULL OR (popularity >= 0 AND popularity <= 1)",
            name="ck_songs_popularity_score",
        ),
        sa.CheckConstraint(
            "source_type IN ('mock', 'licensed', 'public_domain')",
            name="ck_songs_source_type",
        ),
        sa.CheckConstraint(
            "rights_status IN ('demo_safe', 'licensed', 'unknown_blocked')",
            name="ck_songs_rights_status",
        ),
        sa.CheckConstraint("bpm IS NULL OR bpm > 0", name="ck_songs_bpm_positive"),
        sa.CheckConstraint(
            "duration_seconds IS NULL OR duration_seconds > 0",
            name="ck_songs_duration_positive",
        ),
    )

    op.create_table(
        "users",
        uuid_pk(),
        sa.Column("display_name", sa.Text(), nullable=False),
        sa.Column("avatar_seed", sa.Text(), nullable=True),
        sa.Column("locale", sa.Text(), nullable=True),
        sa.Column("demo_role", sa.Text(), nullable=True),
        created_at(),
        updated_at(),
        sa.CheckConstraint(
            "demo_role IS NULL OR demo_role IN "
            "('host', 'guest', 'reviewer', 'developer')",
            name="ck_users_demo_role",
        ),
    )

    op.create_table(
        "karaoke_sessions",
        uuid_pk(),
        sa.Column("host_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("scene_type", sa.Text(), nullable=False),
        sa.Column("scene_prompt", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False),
        sa.Column("target_energy_curve", sa.Text(), nullable=True),
        sa.Column(
            "constraints",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        created_at(),
        updated_at(),
        sa.ForeignKeyConstraint(["host_user_id"], ["users.id"]),
        sa.CheckConstraint(
            "scene_type IN ('ktv', 'car', 'home_party', 'custom')",
            name="ck_karaoke_sessions_scene_type",
        ),
        sa.CheckConstraint(
            "status IN ('draft', 'active', 'ended', 'archived')",
            name="ck_karaoke_sessions_status",
        ),
        sa.CheckConstraint(
            "target_energy_curve IS NULL OR target_energy_curve IN "
            "('ramp_up', 'steady', 'cool_down', 'wave')",
            name="ck_karaoke_sessions_target_energy_curve",
        ),
    )

    op.create_table(
        "agent_runs",
        uuid_pk(),
        sa.Column("karaoke_session_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("objective", sa.Text(), nullable=False),
        sa.Column("run_type", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False),
        sa.Column("model_provider", sa.Text(), nullable=False),
        sa.Column("model_name", sa.Text(), nullable=True),
        sa.Column(
            "input_summary",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column(
            "output_summary",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        created_at(),
        sa.ForeignKeyConstraint(["karaoke_session_id"], ["karaoke_sessions.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.CheckConstraint(
            "run_type IN "
            "('playlist_generation', 'feedback_memory', 'dashboard_summary')",
            name="ck_agent_runs_run_type",
        ),
        sa.CheckConstraint(
            "status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')",
            name="ck_agent_runs_status",
        ),
        sa.CheckConstraint(
            "model_provider IN ('mock', 'openai')",
            name="ck_agent_runs_model_provider",
        ),
        sa.CheckConstraint(
            "latency_ms IS NULL OR latency_ms >= 0",
            name="ck_agent_runs_latency_ms",
        ),
    )

    op.create_table(
        "group_members",
        uuid_pk(),
        sa.Column("karaoke_session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("role", sa.Text(), nullable=False),
        sa.Column(
            "preference_weight",
            sa.Numeric(4, 3),
            nullable=False,
            server_default=sa.text("1.000"),
        ),
        sa.Column("preference_hint", sa.Text(), nullable=True),
        sa.Column(
            "joined_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        created_at(),
        sa.ForeignKeyConstraint(["karaoke_session_id"], ["karaoke_sessions.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.CheckConstraint(
            "role IN ('host', 'guest', 'observer')",
            name="ck_group_members_role",
        ),
        sa.CheckConstraint(
            "preference_weight >= 0 AND preference_weight <= 1",
            name="ck_group_members_preference_weight",
        ),
        sa.UniqueConstraint(
            "karaoke_session_id",
            "user_id",
            name="uq_group_members_session_user",
        ),
    )

    op.create_table(
        "taste_profiles",
        uuid_pk(),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_name", sa.Text(), nullable=False),
        sa.Column("favorite_genres", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("avoided_genres", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column(
            "language_affinity",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column(
            "mood_affinity",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column(
            "artist_affinity",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column("energy_min", sa.Numeric(4, 3), nullable=True),
        sa.Column("energy_max", sa.Numeric(4, 3), nullable=True),
        sa.Column("vocal_difficulty_max", sa.Numeric(4, 3), nullable=True),
        sa.Column("confidence", sa.Numeric(4, 3), nullable=False),
        sa.Column("last_feedback_at", sa.DateTime(timezone=True), nullable=True),
        created_at(),
        updated_at(),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.CheckConstraint(
            "confidence >= 0 AND confidence <= 1",
            name="ck_taste_profiles_confidence",
        ),
        sa.CheckConstraint(
            "energy_min IS NULL OR (energy_min >= 0 AND energy_min <= 1)",
            name="ck_taste_profiles_energy_min",
        ),
        sa.CheckConstraint(
            "energy_max IS NULL OR (energy_max >= 0 AND energy_max <= 1)",
            name="ck_taste_profiles_energy_max",
        ),
        sa.CheckConstraint(
            "energy_min IS NULL OR energy_max IS NULL OR energy_min <= energy_max",
            name="ck_taste_profiles_energy_range",
        ),
        sa.CheckConstraint(
            "vocal_difficulty_max IS NULL OR "
            "(vocal_difficulty_max >= 0 AND vocal_difficulty_max <= 1)",
            name="ck_taste_profiles_vocal_difficulty_max",
        ),
        sa.UniqueConstraint(
            "user_id",
            "profile_name",
            name="uq_taste_profiles_user_name",
        ),
    )

    op.create_table(
        "playlists",
        uuid_pk(),
        sa.Column("karaoke_session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("agent_run_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("scene_type", sa.Text(), nullable=False),
        sa.Column("generation_prompt", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False),
        sa.Column("target_length", sa.Integer(), nullable=False),
        sa.Column(
            "score_summary",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        created_at(),
        updated_at(),
        sa.ForeignKeyConstraint(["karaoke_session_id"], ["karaoke_sessions.id"]),
        sa.ForeignKeyConstraint(["agent_run_id"], ["agent_runs.id"]),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
        sa.CheckConstraint(
            "scene_type IN ('ktv', 'car', 'home_party', 'custom')",
            name="ck_playlists_scene_type",
        ),
        sa.CheckConstraint(
            "status IN ('draft', 'generated', 'edited', 'archived')",
            name="ck_playlists_status",
        ),
        sa.CheckConstraint("target_length > 0", name="ck_playlists_target_length"),
    )

    op.create_table(
        "playlist_items",
        uuid_pk(),
        sa.Column("playlist_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("song_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("fit_score", sa.Numeric(5, 4), nullable=False),
        sa.Column(
            "score_breakdown",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column("transition_note", sa.Text(), nullable=True),
        sa.Column("source", sa.Text(), nullable=False),
        created_at(),
        updated_at(),
        sa.ForeignKeyConstraint(["playlist_id"], ["playlists.id"]),
        sa.ForeignKeyConstraint(["song_id"], ["songs.id"]),
        sa.CheckConstraint("position >= 1", name="ck_playlist_items_position"),
        sa.CheckConstraint(
            "fit_score >= 0 AND fit_score <= 1",
            name="ck_playlist_items_fit_score",
        ),
        sa.CheckConstraint(
            "source IN ('agent', 'manual', 'seed')",
            name="ck_playlist_items_source",
        ),
        sa.UniqueConstraint(
            "playlist_id",
            "position",
            name="uq_playlist_items_position",
        ),
    )

    op.create_table(
        "feedback_logs",
        uuid_pk(),
        sa.Column("karaoke_session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("playlist_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("playlist_item_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("song_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("feedback_type", sa.Text(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=True),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column(
            "event_payload",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        created_at(),
        sa.ForeignKeyConstraint(["karaoke_session_id"], ["karaoke_sessions.id"]),
        sa.ForeignKeyConstraint(["playlist_id"], ["playlists.id"]),
        sa.ForeignKeyConstraint(["playlist_item_id"], ["playlist_items.id"]),
        sa.ForeignKeyConstraint(["song_id"], ["songs.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.CheckConstraint(
            "feedback_type IN "
            "('liked', 'skipped', 'too_slow', 'too_intense', 'too_high', "
            "'wrong_language', 'great_for_group')",
            name="ck_feedback_logs_feedback_type",
        ),
        sa.CheckConstraint(
            "rating IS NULL OR (rating >= 1 AND rating <= 5)",
            name="ck_feedback_logs_rating",
        ),
    )

    op.create_table(
        "agent_steps",
        uuid_pk(),
        sa.Column("agent_run_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("step_index", sa.Integer(), nullable=False),
        sa.Column("step_type", sa.Text(), nullable=False),
        sa.Column("tool_name", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False),
        sa.Column(
            "input_summary",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column(
            "output_summary",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        created_at(),
        sa.ForeignKeyConstraint(["agent_run_id"], ["agent_runs.id"]),
        sa.CheckConstraint("step_index >= 1", name="ck_agent_steps_step_index"),
        sa.CheckConstraint(
            "step_type IN ('plan', 'tool_call', 'rank', 'explain', "
            "'memory_write', 'finalize')",
            name="ck_agent_steps_step_type",
        ),
        sa.CheckConstraint(
            "status IN ('queued', 'running', 'succeeded', 'failed', 'skipped')",
            name="ck_agent_steps_status",
        ),
        sa.CheckConstraint(
            "latency_ms IS NULL OR latency_ms >= 0",
            name="ck_agent_steps_latency_ms",
        ),
        sa.UniqueConstraint(
            "agent_run_id",
            "step_index",
            name="uq_agent_steps_run_index",
        ),
    )

    op.create_table(
        "recommendation_reasons",
        uuid_pk(),
        sa.Column("playlist_item_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("agent_run_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("reason_type", sa.Text(), nullable=False),
        sa.Column("short_reason", sa.Text(), nullable=False),
        sa.Column("evidence", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("confidence", sa.Numeric(4, 3), nullable=True),
        created_at(),
        sa.ForeignKeyConstraint(["playlist_item_id"], ["playlist_items.id"]),
        sa.ForeignKeyConstraint(["agent_run_id"], ["agent_runs.id"]),
        sa.CheckConstraint(
            "reason_type IN ('scene_fit', 'group_fit', 'energy_curve', "
            "'memory', 'diversity')",
            name="ck_recommendation_reasons_reason_type",
        ),
        sa.CheckConstraint(
            "confidence IS NULL OR (confidence >= 0 AND confidence <= 1)",
            name="ck_recommendation_reasons_confidence",
        ),
    )

    op.create_index("idx_songs_language", "songs", ["language"])
    op.create_index("idx_songs_genres_gin", "songs", ["genres"], postgresql_using="gin")
    op.create_index("idx_songs_moods_gin", "songs", ["moods"], postgresql_using="gin")
    op.create_index(
        "idx_songs_scene_tags_gin",
        "songs",
        ["scene_tags"],
        postgresql_using="gin",
    )
    op.create_index("idx_songs_energy", "songs", ["energy"])
    op.create_index("idx_songs_rights_status", "songs", ["rights_status"])
    op.execute(
        "CREATE INDEX idx_songs_search ON songs USING gin "
        "(to_tsvector('simple', coalesce(title, '') || ' ' || "
        "coalesce(artist_name, '')))"
    )

    op.create_index("idx_users_display_name", "users", ["display_name"])
    op.create_index("idx_users_locale", "users", ["locale"])

    op.create_index(
        "idx_sessions_host_user_id",
        "karaoke_sessions",
        ["host_user_id"],
    )
    op.create_index("idx_sessions_scene_type", "karaoke_sessions", ["scene_type"])
    op.create_index("idx_sessions_status", "karaoke_sessions", ["status"])
    op.create_index("idx_sessions_created_at", "karaoke_sessions", ["created_at"])

    op.create_index(
        "idx_group_members_session",
        "group_members",
        ["karaoke_session_id"],
    )
    op.create_index("idx_group_members_user", "group_members", ["user_id"])

    op.create_index("idx_taste_profiles_user", "taste_profiles", ["user_id"])
    op.create_index("idx_taste_profiles_updated_at", "taste_profiles", ["updated_at"])

    op.create_index("idx_playlists_session", "playlists", ["karaoke_session_id"])
    op.create_index("idx_playlists_agent_run", "playlists", ["agent_run_id"])
    op.create_index("idx_playlists_status", "playlists", ["status"])
    op.create_index("idx_playlists_created_at", "playlists", ["created_at"])

    op.create_index("idx_playlist_items_playlist", "playlist_items", ["playlist_id"])
    op.create_index("idx_playlist_items_song", "playlist_items", ["song_id"])
    op.create_index("idx_playlist_items_fit_score", "playlist_items", ["fit_score"])

    op.create_index("idx_feedback_session", "feedback_logs", ["karaoke_session_id"])
    op.create_index("idx_feedback_user", "feedback_logs", ["user_id"])
    op.create_index("idx_feedback_item", "feedback_logs", ["playlist_item_id"])
    op.create_index("idx_feedback_type", "feedback_logs", ["feedback_type"])
    op.create_index("idx_feedback_created_at", "feedback_logs", ["created_at"])

    op.create_index("idx_agent_runs_session", "agent_runs", ["karaoke_session_id"])
    op.create_index("idx_agent_runs_status", "agent_runs", ["status"])
    op.create_index("idx_agent_runs_type", "agent_runs", ["run_type"])
    op.create_index("idx_agent_runs_created_at", "agent_runs", ["created_at"])

    op.create_index("idx_agent_steps_run", "agent_steps", ["agent_run_id"])
    op.create_index("idx_agent_steps_status", "agent_steps", ["status"])
    op.create_index("idx_agent_steps_tool_name", "agent_steps", ["tool_name"])

    op.create_index(
        "idx_reasons_playlist_item",
        "recommendation_reasons",
        ["playlist_item_id"],
    )
    op.create_index(
        "idx_reasons_agent_run",
        "recommendation_reasons",
        ["agent_run_id"],
    )
    op.create_index("idx_reasons_type", "recommendation_reasons", ["reason_type"])


def downgrade() -> None:
    op.drop_index("idx_reasons_type", table_name="recommendation_reasons")
    op.drop_index("idx_reasons_agent_run", table_name="recommendation_reasons")
    op.drop_index("idx_reasons_playlist_item", table_name="recommendation_reasons")
    op.drop_index("idx_agent_steps_tool_name", table_name="agent_steps")
    op.drop_index("idx_agent_steps_status", table_name="agent_steps")
    op.drop_index("idx_agent_steps_run", table_name="agent_steps")
    op.drop_index("idx_agent_runs_created_at", table_name="agent_runs")
    op.drop_index("idx_agent_runs_type", table_name="agent_runs")
    op.drop_index("idx_agent_runs_status", table_name="agent_runs")
    op.drop_index("idx_agent_runs_session", table_name="agent_runs")
    op.drop_index("idx_feedback_created_at", table_name="feedback_logs")
    op.drop_index("idx_feedback_type", table_name="feedback_logs")
    op.drop_index("idx_feedback_item", table_name="feedback_logs")
    op.drop_index("idx_feedback_user", table_name="feedback_logs")
    op.drop_index("idx_feedback_session", table_name="feedback_logs")
    op.drop_index("idx_playlist_items_fit_score", table_name="playlist_items")
    op.drop_index("idx_playlist_items_song", table_name="playlist_items")
    op.drop_index("idx_playlist_items_playlist", table_name="playlist_items")
    op.drop_index("idx_playlists_created_at", table_name="playlists")
    op.drop_index("idx_playlists_status", table_name="playlists")
    op.drop_index("idx_playlists_agent_run", table_name="playlists")
    op.drop_index("idx_playlists_session", table_name="playlists")
    op.drop_index("idx_taste_profiles_updated_at", table_name="taste_profiles")
    op.drop_index("idx_taste_profiles_user", table_name="taste_profiles")
    op.drop_index("idx_group_members_user", table_name="group_members")
    op.drop_index("idx_group_members_session", table_name="group_members")
    op.drop_index("idx_sessions_created_at", table_name="karaoke_sessions")
    op.drop_index("idx_sessions_status", table_name="karaoke_sessions")
    op.drop_index("idx_sessions_scene_type", table_name="karaoke_sessions")
    op.drop_index("idx_sessions_host_user_id", table_name="karaoke_sessions")
    op.drop_index("idx_users_locale", table_name="users")
    op.drop_index("idx_users_display_name", table_name="users")
    op.execute("DROP INDEX IF EXISTS idx_songs_search")
    op.drop_index("idx_songs_rights_status", table_name="songs")
    op.drop_index("idx_songs_energy", table_name="songs")
    op.drop_index("idx_songs_scene_tags_gin", table_name="songs")
    op.drop_index("idx_songs_moods_gin", table_name="songs")
    op.drop_index("idx_songs_genres_gin", table_name="songs")
    op.drop_index("idx_songs_language", table_name="songs")

    op.drop_table("recommendation_reasons")
    op.drop_table("agent_steps")
    op.drop_table("feedback_logs")
    op.drop_table("playlist_items")
    op.drop_table("playlists")
    op.drop_table("taste_profiles")
    op.drop_table("group_members")
    op.drop_table("agent_runs")
    op.drop_table("karaoke_sessions")
    op.drop_table("users")
    op.drop_table("songs")
