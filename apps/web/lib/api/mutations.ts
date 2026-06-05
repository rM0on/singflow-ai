import { getApiBaseUrl } from "./client";
import type {
  ApiError,
  ApiResult,
  ErrorEnvelope,
  JsonObject,
  JsonValue,
  PlaylistGenerateRequest,
  PlaylistGenerateResponse,
  TasteFusionRequest,
  TasteFusionResponse
} from "./types";

const PLAYLIST_GENERATE_TIMEOUT_MS = 8000;
const TASTE_FUSION_TIMEOUT_MS = 8000;

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

export async function runTasteFusion(
  sessionId: string,
  payload: TasteFusionRequest
): Promise<ApiResult<TasteFusionResponse>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TASTE_FUSION_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/karaoke-sessions/${encodeURIComponent(sessionId)}/taste-fusion`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      }
    );
    const parsed = await parseJson(response);

    if (!response.ok) {
      return {
        ok: false,
        state: "fallback",
        error: normalizeError(parsed, response.status, "Taste fusion request failed.")
      };
    }

    return {
      ok: true,
      state: "connected",
      data: parsed as TasteFusionResponse
    };
  } catch (error) {
    return {
      ok: false,
      state: "fallback",
      error: normalizeThrownError(error, "Taste fusion request could not be completed.")
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

function normalizeError(
  value: JsonValue | undefined,
  status: number,
  fallbackMessage = "Playlist generation request failed."
): ApiError {
  const envelope = isObject(value) ? (value as ErrorEnvelope) : undefined;
  const error = envelope?.error;

  return {
    code: error?.code ?? `HTTP_${status}`,
    message: error?.message ?? fallbackMessage,
    details: error?.details ?? null,
    status
  };
}

function normalizeThrownError(
  error: unknown,
  fallbackMessage = "Playlist generation request could not be completed."
): ApiError {
  if (error instanceof DOMException && error.name === "AbortError") {
    return {
      code: "REQUEST_TIMEOUT",
      message:
        fallbackMessage === "Playlist generation request could not be completed."
          ? "Playlist generation request timed out."
          : "Taste fusion request timed out."
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
    message: fallbackMessage
  };
}

function isObject(value: JsonValue | undefined): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
