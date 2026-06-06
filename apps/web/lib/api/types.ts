export type ApiConnectionState = "mock" | "connected" | "fallback";
export type DashboardRange = "24h" | "7d" | "30d" | "all";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export type ApiError = {
  code: string;
  message: string;
  details?: JsonObject | null;
  status?: number;
};

export type ApiResult<T> =
  | {
      ok: true;
      data: T;
      state: Extract<ApiConnectionState, "connected">;
    }
  | {
      ok: false;
      error: ApiError;
      state: Extract<ApiConnectionState, "fallback">;
    };

export type ErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    details?: JsonObject | null;
  };
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export type HealthResponse = {
  status: string;
  environment?: string;
  llm_provider?: string;
  version?: string;
};

export type Language = "en" | "zh" | "cantonese" | "mixed";
export type SceneType = "ktv" | "car" | "home_party" | "custom";
export type SessionStatus = "draft" | "active" | "ended" | "archived";
export type TargetEnergyCurve = "ramp_up" | "steady" | "cool_down" | "wave";
export type AgentRunStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type AgentStepStatus = "queued" | "running" | "succeeded" | "failed" | "skipped";
export type AgentRunType = "playlist_generation" | "feedback_memory" | "dashboard_summary";
export type PlaylistStatus = "draft" | "generated" | "edited" | "archived";
export type PlaylistItemSource = "agent" | "manual" | "seed";
export type FeedbackType =
  | "liked"
  | "skipped"
  | "too_slow"
  | "too_intense"
  | "too_high"
  | "wrong_language"
  | "great_for_group";
export type RecommendationReasonType =
  | "scene_fit"
  | "group_fit"
  | "energy_curve"
  | "memory"
  | "diversity";

export type SongApiItem = {
  id: string;
  title: string;
  artist_name: string;
  language: Language;
  genres: string[];
  moods: string[];
  scene_tags: string[];
  energy: number;
  vocal_difficulty: number;
  rights_status: "demo_safe" | "licensed" | "unknown_blocked";
};

export type DemoUserApiItem = {
  id: string;
  display_name: string;
  avatar_seed: string;
  demo_role: "host" | "guest" | "reviewer" | "developer";
};

export type KaraokeSessionApiItem = {
  id: string;
  host_user_id?: string | null;
  title: string;
  scene_type: SceneType;
  status: SessionStatus;
  target_energy_curve?: TargetEnergyCurve | null;
  members_count: number;
  playlists_count: number;
  latest_playlist_id?: string | null;
  updated_at?: string | null;
};

export type KaraokeSessionDetailApiResponse = KaraokeSessionApiItem & {
  scene_prompt?: string | null;
  constraints?: JsonObject | null;
  feedback_count: number;
  latest_agent_run_id?: string | null;
  created_at: string;
};

export type TasteProfileSummaryApiItem = {
  favorite_genres?: string[] | null;
  language_affinity?: JsonObject | null;
  mood_affinity?: JsonObject | null;
  confidence?: number | null;
};

export type KaraokeSessionMemberApiItem = {
  id: string;
  user_id?: string | null;
  display_name: string;
  role: "host" | "guest" | "observer";
  preference_weight: number;
  profile_summary?: TasteProfileSummaryApiItem | null;
};

export type GroupMemberApiItem = KaraokeSessionMemberApiItem;

export type AgentRunApiItem = {
  id: string;
  run_type: AgentRunType;
  status: AgentRunStatus;
  objective: string;
  model_provider: "mock" | "openai";
  latency_ms?: number | null;
  created_at: string;
};

export type AgentRunDetailApiResponse = {
  id: string;
  run_type: AgentRunType;
  status: AgentRunStatus;
  objective: string;
  input_summary?: JsonObject | null;
  output_summary?: JsonObject | null;
  steps_count: number;
  latency_ms?: number | null;
};

export type AgentStepApiItem = {
  id: string;
  step_index: number;
  step_type: "plan" | "tool_call" | "rank" | "explain" | "memory_write" | "finalize";
  tool_name?: string | null;
  status: AgentStepStatus;
  input_summary?: JsonObject | null;
  output_summary?: JsonObject | null;
  error_message?: string | null;
  latency_ms?: number | null;
};

export type FeedbackTypeMetricApiItem = {
  feedback_type: string;
  count: number;
};

export type DashboardOverviewApiResponse = {
  sessions_count: number;
  playlists_count: number;
  feedback_count: number;
  avg_agent_latency_ms?: number | null;
  top_feedback_types: FeedbackTypeMetricApiItem[];
};

export type FeedbackCreateRequest = {
  karaoke_session_id: string;
  playlist_id?: string | null;
  playlist_item_id?: string | null;
  song_id?: string | null;
  user_id?: string | null;
  feedback_type: FeedbackType;
  rating?: number | null;
  reason?: string | null;
  event_payload?: JsonObject | null;
};

export type FeedbackMemoryUpdateApiItem = {
  status: "queued" | "updated" | "skipped" | "failed";
  profile_id?: string | null;
};

export type FeedbackCreateResponse = {
  id: string;
  status: "saved";
  memory_update?: FeedbackMemoryUpdateApiItem | null;
};

export type FeedbackLogApiItem = {
  id: string;
  feedback_type: FeedbackType;
  rating?: number | null;
  song_title?: string | null;
  user_display_name?: string | null;
  reason?: string | null;
  created_at: string;
};

export type FeedbackListResponse = {
  items: FeedbackLogApiItem[];
};

export type DashboardAgentRunStatusMetricApiItem = {
  status: AgentRunStatus;
  count: number;
};

export type DashboardAgentToolMetricApiItem = {
  tool_name: string;
  count: number;
  avg_latency_ms?: number | null;
};

export type DashboardRecentFailureApiItem = {
  agent_run_id: string;
  run_type: AgentRunType;
  error_message?: string | null;
  created_at: string;
};

export type DashboardAgentRunsApiResponse = {
  by_status: DashboardAgentRunStatusMetricApiItem[];
  by_tool: DashboardAgentToolMetricApiItem[];
  recent_failures: DashboardRecentFailureApiItem[];
};

export type SongLiteApiItem = {
  id: string;
  title: string;
  artist_name: string;
};

export type RecommendationReasonApiItem = {
  reason_type: RecommendationReasonType;
  short_reason: string;
  confidence?: number | null;
  evidence?: JsonObject | null;
};

export type GeneratedPlaylistItemApiItem = {
  id: string;
  position: number;
  fit_score: number;
  song: SongLiteApiItem;
  score_breakdown?: JsonObject | null;
  transition_note?: string | null;
  source?: PlaylistItemSource | null;
  reasons: RecommendationReasonApiItem[];
};

export type GeneratedPlaylistApiItem = {
  id: string;
  karaoke_session_id: string;
  agent_run_id?: string | null;
  title: string;
  description?: string | null;
  status: PlaylistStatus;
  scene_type: SceneType;
  target_length: number;
  score_summary?: JsonObject | null;
  items: GeneratedPlaylistItemApiItem[];
  created_at?: string | null;
  updated_at?: string | null;
};

export type PlaylistGenerateRequest = {
  karaoke_session_id: string;
  created_by_user_id?: string | null;
  prompt: string;
  target_length: number;
  constraints?: JsonObject | null;
  mode: "mock";
};

export type PlaylistGenerateResponse = {
  playlist: GeneratedPlaylistApiItem;
  agent_run: {
    id: string;
    status: AgentRunStatus;
  };
};

export type TasteFusionMemberOverrideApiItem = {
  user_id: string;
  preference_weight: number;
};

export type TasteFusionRequest = {
  scene_type: SceneType;
  energy_curve?: TargetEnergyCurve | null;
  member_overrides?: TasteFusionMemberOverrideApiItem[] | null;
};

export type TasteFusionConflictApiItem = {
  dimension: string;
  summary: string;
};

export type TasteFusionResponse = {
  session_id: string;
  fusion: {
    languages?: Record<string, number> | null;
    genres?: Record<string, number> | null;
    energy_target?: {
      start?: number | null;
      middle?: number | null;
      end?: number | null;
    } | null;
    scene_type?: SceneType | string | null;
  };
  conflicts: TasteFusionConflictApiItem[];
};

export type DashboardMetricViewModel = {
  label: string;
  value: string;
  delta: string;
};

export type DashboardFeedbackDistributionViewModel = {
  name: string;
  value: number;
};

export type FeedbackMemorySignalViewModel = {
  id: string;
  feedbackTypeLabel: string;
  statusLabel: string;
  memoryStatusLabel: string;
  detailLabel: string;
  sourceLabel: string;
};

export type DashboardAgentSummaryViewModel = {
  totalRuns: number;
  succeededRuns: number;
  failedRuns: number;
  successRate: number | null;
  statusLabel: string;
};

export type AgentConsoleRunViewModel = {
  id: string;
  mode: string;
  objective: string;
  status: string;
  startedAt: string;
  totalLatencyMs: number;
  stepsCount: number;
};

export type TimelineSessionSummaryViewModel = {
  id: string;
  title: string;
  sceneLabel: string;
  statusLabel: string;
  durationLabel: string;
  membersLabel: string;
  playlistsLabel: string;
  feedbackLabel: string;
  latestPlaylistLabel: string;
  latestAgentRunLabel: string;
  updatedLabel: string;
};

export type TimelineSessionMemberViewModel = {
  id: string;
  name: string;
  role: string;
  weightLabel: string;
  profileLabel: string;
};

export type MixerMemberViewModel = {
  id: string;
  userId?: string | null;
  name: string;
  role: string;
  weight: number;
  weightLabel: string;
  languages: string[];
  difficultyLabel: string;
  tags: string[];
  confidenceLabel: string;
};

export type TasteFusionScoreViewModel = {
  label: string;
  value: number;
  valueLabel: string;
};

export type TasteFusionViewModel = {
  sessionId: string;
  workflowLabel: string;
  consensusSummary: string;
  sceneLabel: string;
  confidenceLabel: string;
  languages: TasteFusionScoreViewModel[];
  genres: TasteFusionScoreViewModel[];
  energyTarget: TasteFusionScoreViewModel[];
  conflicts: TasteFusionConflictApiItem[];
};

export type GeneratedPlaylistPreviewTrackViewModel = {
  id: string;
  title: string;
  artist: string;
  fitScoreLabel: string;
  reason: string;
};

export type GeneratedPlaylistPreviewViewModel = {
  playlistId: string;
  title: string;
  statusLabel: string;
  sceneLabel: string;
  trackCountLabel: string;
  targetLengthLabel: string;
  agentRunId: string;
  agentRunStatusLabel: string;
  workflowLabel: string;
  tracks: GeneratedPlaylistPreviewTrackViewModel[];
};

export type ListResponse<T> = {
  items: T[];
};
