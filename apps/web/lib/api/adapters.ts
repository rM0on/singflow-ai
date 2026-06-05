import type { AgentStep, AgentStepStatus as UiAgentStepStatus, MockSong } from "@/lib/mock-data";

import type { AgentStepApiItem, JsonObject, SongApiItem } from "./types";

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
