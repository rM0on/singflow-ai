import { apiGet, getApiRootUrl } from "./client";
import type {
  AgentRunApiItem,
  AgentRunDetailApiResponse,
  AgentStepApiItem,
  DashboardAgentRunsApiResponse,
  DashboardOverviewApiResponse,
  DemoUserApiItem,
  GroupMemberApiItem,
  HealthResponse,
  KaraokeSessionApiItem,
  KaraokeSessionDetailApiResponse,
  ListResponse,
  PaginatedResponse,
  SceneType,
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
    status?: string;
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
  return apiGet<ListResponse<GroupMemberApiItem>>(`/karaoke-sessions/${sessionId}/members`);
}

export function getDashboardOverview() {
  return apiGet<DashboardOverviewApiResponse>("/dashboard/overview");
}

export function getDashboardAgentRuns() {
  return apiGet<DashboardAgentRunsApiResponse>("/dashboard/agent-runs");
}

export function getAgentRuns(params: { status?: string; run_type?: string; limit?: number; offset?: number } = {}) {
  return apiGet<ListResponse<AgentRunApiItem>>("/agent-runs", { params });
}

export function getAgentRun(agentRunId: string) {
  return apiGet<AgentRunDetailApiResponse>(`/agent-runs/${agentRunId}`);
}

export function getAgentRunSteps(agentRunId: string) {
  return apiGet<ListResponse<AgentStepApiItem>>(`/agent-runs/${agentRunId}/steps`);
}
