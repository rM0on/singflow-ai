import type { ApiConnectionState, ApiResult } from "./types";

export function normalizeApiState<T>(
  result: ApiResult<T> | null | undefined,
  fallbackUsed = false
): ApiConnectionState {
  if (!result) {
    return fallbackUsed ? "mock" : "mock";
  }

  return result.ok ? "connected" : "fallback";
}

export function getApiStatusLabel(state: ApiConnectionState) {
  if (state === "connected") {
    return "API connected";
  }

  if (state === "fallback") {
    return "API unavailable, fallback to mock";
  }

  return "Mock data";
}

export function getApiStatusTone(state: ApiConnectionState) {
  if (state === "connected") {
    return "mint";
  }

  if (state === "fallback") {
    return "amber";
  }

  return "default";
}
