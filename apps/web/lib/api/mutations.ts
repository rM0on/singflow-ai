import { getApiBaseUrl } from "./client";
import type {
  ApiError,
  ApiResult,
  ErrorEnvelope,
  JsonObject,
  JsonValue,
  PlaylistGenerateRequest,
  PlaylistGenerateResponse
} from "./types";

const PLAYLIST_GENERATE_TIMEOUT_MS = 8000;

export async function generatePlaylist(
  payload: PlaylistGenerateRequest
): Promise<ApiResult<PlaylistGenerateResponse>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PLAYLIST_GENERATE_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiBaseUrl()}/playlists/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...payload,
        mode: "mock"
      }),
      signal: controller.signal
    });
    const parsed = await parseJson(response);

    if (!response.ok) {
      return {
        ok: false,
        state: "fallback",
        error: normalizeError(parsed, response.status)
      };
    }

    return {
      ok: true,
      state: "connected",
      data: parsed as PlaylistGenerateResponse
    };
  } catch (error) {
    return {
      ok: false,
      state: "fallback",
      error: normalizeThrownError(error)
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function parseJson(response: Response): Promise<JsonValue | undefined> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as JsonValue;
  } catch {
    return {
      error: {
        code: "INVALID_JSON",
        message: "API returned a response that could not be parsed as JSON."
      }
    };
  }
}

function normalizeError(value: JsonValue | undefined, status: number): ApiError {
  const envelope = isObject(value) ? (value as ErrorEnvelope) : undefined;
  const error = envelope?.error;

  return {
    code: error?.code ?? `HTTP_${status}`,
    message: error?.message ?? "Playlist generation request failed.",
    details: error?.details ?? null,
    status
  };
}

function normalizeThrownError(error: unknown): ApiError {
  if (error instanceof DOMException && error.name === "AbortError") {
    return {
      code: "REQUEST_TIMEOUT",
      message: "Playlist generation request timed out."
    };
  }

  if (error instanceof Error) {
    return {
      code: "API_UNAVAILABLE",
      message: error.message
    };
  }

  return {
    code: "API_UNAVAILABLE",
    message: "Playlist generation request could not be completed."
  };
}

function isObject(value: JsonValue | undefined): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
