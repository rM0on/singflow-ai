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
export type AgentRunStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type AgentStepStatus = "queued" | "running" | "succeeded" | "failed" | "skipped";
export type AgentRunType = "playlist_generation" | "feedback_memory" | "dashboard_summary";

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
  target_energy_curve?: "ramp_up" | "steady" | "cool_down" | "wave" | null;
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
  profile_id: string;
  scene_type: SceneType;
  summary: string;
  confidence: number;
};

export type GroupMemberApiItem = {
  id: string;
  display_name: string;
  role: "host" | "guest" | "observer";
  preference_weight: number;
  profile_summary?: TasteProfileSummaryApiItem | null;
};

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

export type DashboardMetricViewModel = {
  label: string;
  value: string;
  delta: string;
};

export type DashboardFeedbackDistributionViewModel = {
  name: string;
  value: number;
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

export type ListResponse<T> = {
  items: T[];
};
