import type { ApiError, ApiResult, ErrorEnvelope, JsonObject, JsonValue } from "./types";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000/api/v1";
const DEFAULT_TIMEOUT_MS = 5000;

type QueryValue = string | number | boolean | null | undefined;

type ApiRequestOptions = {
  params?: Record<string, QueryValue>;
  timeoutMs?: number;
  baseUrl?: string;
};

export function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return (configured || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export function getApiRootUrl() {
  try {
    return new URL(getApiBaseUrl()).origin;
  } catch {
    return "http://127.0.0.1:8000";
  }
}

export async function apiGet<T>(
  path: string,
  options: ApiRequestOptions = {}
) {
  return apiRequest<T>(path, options);
}

export async function apiRequest<T>(
  path: string,
  {
    params,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    baseUrl = getApiBaseUrl()
  }: ApiRequestOptions = {}
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl(baseUrl, path, params), {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
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
      data: parsed as T
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

function buildUrl(baseUrl: string, path: string, params?: Record<string, QueryValue>) {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${cleanBase}${cleanPath}`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
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
    message: error?.message ?? "API request failed.",
    details: error?.details ?? null,
    status
  };
}

function normalizeThrownError(error: unknown): ApiError {
  if (error instanceof DOMException && error.name === "AbortError") {
    return {
      code: "REQUEST_TIMEOUT",
      message: "API request timed out."
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
    message: "API request could not be completed."
  };
}

function isObject(value: JsonValue | undefined): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
