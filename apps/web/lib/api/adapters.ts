import type { AgentStep, AgentStepStatus as UiAgentStepStatus, MockSong } from "@/lib/mock-data";

import type {
  AgentStepApiItem,
  DashboardAgentRunsApiResponse,
  DashboardAgentSummaryViewModel,
  DashboardFeedbackDistributionViewModel,
  DashboardMetricViewModel,
  DashboardOverviewApiResponse,
  JsonObject,
  SongApiItem
} from "./types";

const coverTones: MockSong["coverTone"][] = ["cyan", "mint", "amber", "coral", "violet"];

export function scoreToDisplayScore(score: number | null | undefined) {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return 0;
  }

  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}

export function toCamelCaseKey(value: string) {
  return value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function shallowCamelCase<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [toCamelCaseKey(key), item])
  );
}

export function mapAgentStepStatus(status: AgentStepApiItem["status"]): UiAgentStepStatus {
  if (status === "succeeded") return "completed";
  if (status === "running") return "running";
  if (status === "queued") return "queued";
  return "warning";
}

export function adaptSongToMockSong(song: SongApiItem, index = 0): MockSong {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist_name,
    language: song.language,
    mood: song.moods[0] ?? "demo",
    energy: scoreToDisplayScore(song.energy),
    vocalDifficulty: scoreToDisplayScore(song.vocal_difficulty),
    fitScore: 88,
    sceneTags: song.scene_tags,
    reason: "Loaded from the verified backend demo catalog.",
    coverTone: coverTones[index % coverTones.length]
  };
}

export function adaptAgentStepToMockStep(step: AgentStepApiItem): AgentStep {
  return {
    id: step.id,
    tool: step.tool_name ?? step.step_type,
    status: mapAgentStepStatus(step.status),
    latencyMs: step.latency_ms ?? 0,
    inputSummary: summarizeJson(step.input_summary),
    outputSummary: summarizeJson(step.output_summary ?? errorSummary(step.error_message))
  };
}

export function isDashboardOverviewUsable(overview: DashboardOverviewApiResponse | null | undefined) {
  if (!overview) {
    return false;
  }

  const hasCounts =
    isPositiveNumber(overview.sessions_count) ||
    isPositiveNumber(overview.playlists_count) ||
    isPositiveNumber(overview.feedback_count);
  const hasFeedbackTypes = Array.isArray(overview.top_feedback_types) && overview.top_feedback_types.length > 0;
  const hasLatency = isUsableNumber(overview.avg_agent_latency_ms);

  return hasCounts || hasFeedbackTypes || hasLatency;
}

export function isDashboardAgentRunsUsable(agentRuns: DashboardAgentRunsApiResponse | null | undefined) {
  if (!agentRuns) {
    return false;
  }

  const statusTotal = (agentRuns.by_status ?? []).reduce((sum, item) => sum + safeCount(item.count), 0);
  const toolTotal = (agentRuns.by_tool ?? []).reduce((sum, item) => sum + safeCount(item.count), 0);

  return statusTotal > 0 || toolTotal > 0 || (agentRuns.recent_failures ?? []).length > 0;
}

export function adaptDashboardAgentRunsToSummary(
  agentRuns: DashboardAgentRunsApiResponse
): DashboardAgentSummaryViewModel {
  const succeededRuns = countAgentRunsByStatus(agentRuns, "succeeded");
  const failedRuns = countAgentRunsByStatus(agentRuns, "failed");
  const totalRuns = (agentRuns.by_status ?? []).reduce((sum, item) => sum + safeCount(item.count), 0);
  const successRate = totalRuns > 0 ? Math.round((succeededRuns / totalRuns) * 100) : null;

  return {
    totalRuns,
    succeededRuns,
    failedRuns,
    successRate,
    statusLabel: totalRuns > 0 ? `${succeededRuns}/${totalRuns} succeeded` : "No persisted runs"
  };
}

export function adaptDashboardOverviewToMetrics(
  overview: DashboardOverviewApiResponse,
  agentSummary: DashboardAgentSummaryViewModel | null = null
): DashboardMetricViewModel[] {
  const avgLatency = formatLatency(overview.avg_agent_latency_ms);

  return [
    {
      label: "Sessions",
      value: formatCount(overview.sessions_count),
      delta: "API"
    },
    {
      label: "Playlists",
      value: formatCount(overview.playlists_count),
      delta: "API"
    },
    {
      label: "Feedback logs",
      value: formatCount(overview.feedback_count),
      delta: "API"
    },
    {
      label: agentSummary ? "Agent success" : "Avg latency",
      value: agentSummary?.successRate != null ? `${agentSummary.successRate}%` : avgLatency,
      delta: agentSummary?.statusLabel ?? "API"
    }
  ];
}

export function adaptDashboardFeedbackDistribution(
  overview: DashboardOverviewApiResponse
): DashboardFeedbackDistributionViewModel[] {
  return (overview.top_feedback_types ?? [])
    .filter((item) => safeCount(item.count) > 0)
    .map((item) => ({
      name: formatFeedbackType(item.feedback_type),
      value: safeCount(item.count)
    }));
}

export function summarizeJson(value: JsonObject | null | undefined) {
  if (!value) {
    return "No summary provided.";
  }

  const summary = value.summary;
  if (typeof summary === "string") {
    return summary;
  }

  return Object.entries(value)
    .slice(0, 3)
    .map(([key, item]) => `${toCamelCaseKey(key)}: ${formatSummaryValue(item)}`)
    .join("; ");
}

function errorSummary(errorMessage: string | null | undefined): JsonObject | null {
  if (!errorMessage) {
    return null;
  }

  return {
    summary: errorMessage
  };
}

function formatSummaryValue(value: unknown) {
  if (Array.isArray(value)) {
    return `${value.length} items`;
  }

  if (value && typeof value === "object") {
    return "object";
  }

  return String(value ?? "none");
}

function countAgentRunsByStatus(agentRuns: DashboardAgentRunsApiResponse, status: string) {
  return safeCount((agentRuns.by_status ?? []).find((item) => item.status === status)?.count);
}

function formatCount(value: number | null | undefined) {
  return safeCount(value).toLocaleString("en-US");
}

function formatLatency(value: number | null | undefined) {
  if (!isUsableNumber(value)) {
    return "n/a";
  }

  return `${Math.round(Math.max(0, value))}ms`;
}

function formatFeedbackType(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function safeCount(value: number | null | undefined) {
  return isUsableNumber(value) ? Math.max(0, Math.round(value)) : 0;
}

function isPositiveNumber(value: number | null | undefined) {
  return isUsableNumber(value) && value > 0;
}

function isUsableNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
