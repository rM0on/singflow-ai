import { apiGet, getApiRootUrl } from "./client";
import type {
  AgentRunApiItem,
  AgentRunDetailApiResponse,
  AgentRunStatus,
  AgentRunType,
  AgentStepApiItem,
  DashboardAgentRunsApiResponse,
  DashboardOverviewApiResponse,
  DashboardRange,
  DemoUserApiItem,
  FeedbackListResponse,
  FeedbackType,
  HealthResponse,
  KaraokeSessionApiItem,
  KaraokeSessionDetailApiResponse,
  KaraokeSessionMemberApiItem,
  ListResponse,
  PaginatedResponse,
  SceneType,
  SessionStatus,
  SongApiItem
} from "./types";

export function getHealth() {
  return apiGet<HealthResponse>("/health", {
    baseUrl: getApiRootUrl()
  });
}

export function getApiHealth() {
  return apiGet<HealthResponse>("/health");
}

export function getSongs(params: { language?: string; scene_tag?: string; limit?: number; offset?: number } = {}) {
  return apiGet<PaginatedResponse<SongApiItem>>("/songs", { params });
}

export function getDemoUsers(params: { limit?: number; offset?: number } = {}) {
  return apiGet<ListResponse<DemoUserApiItem>>("/demo-users", { params });
}

export function getKaraokeSessions(
  params: {
    scene_type?: SceneType;
    status?: SessionStatus;
    limit?: number;
    offset?: number;
  } = {}
) {
  return apiGet<PaginatedResponse<KaraokeSessionApiItem>>("/karaoke-sessions", { params });
}

export function getKaraokeSession(sessionId: string) {
  return apiGet<KaraokeSessionDetailApiResponse>(`/karaoke-sessions/${sessionId}`);
}

export function getKaraokeSessionMembers(sessionId: string) {
  return apiGet<ListResponse<KaraokeSessionMemberApiItem>>(`/karaoke-sessions/${sessionId}/members`);
}

export function getSessionFeedback(
  sessionId: string,
  params: { feedback_type?: FeedbackType; user_id?: string; limit?: number; offset?: number } = {}
) {
  return apiGet<FeedbackListResponse>(`/karaoke-sessions/${sessionId}/feedback`, { params });
}

export function getDashboardOverview(params: { range?: DashboardRange } = {}) {
  return apiGet<DashboardOverviewApiResponse>("/dashboard/overview", { params });
}

export function getDashboardAgentRuns(params: { range?: DashboardRange } = {}) {
  return apiGet<DashboardAgentRunsApiResponse>("/dashboard/agent-runs", { params });
}

export function getAgentRuns(
  params: { status?: AgentRunStatus; run_type?: AgentRunType; limit?: number; offset?: number } = {}
) {
  return apiGet<ListResponse<AgentRunApiItem>>("/agent-runs", { params });
}

export function getAgentRun(agentRunId: string) {
  return apiGet<AgentRunDetailApiResponse>(`/agent-runs/${agentRunId}`);
}

export function getAgentRunSteps(agentRunId: string) {
  return apiGet<ListResponse<AgentStepApiItem>>(`/agent-runs/${agentRunId}/steps`);
}
