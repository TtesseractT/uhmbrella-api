import { RequestOptions } from "../types";
import { ApiError } from "./errors";

export type HttpClientConfig = {
  api_key: string;
  base_url: string;
  timeout_ms: number;
  f_fetch?: typeof fetch;
};

export type HttpClient = ReturnType<typeof createHttpClient>;

export const createHttpClient = (clientConfig: HttpClientConfig) => {

  const { api_key, base_url, f_fetch = fetch } = clientConfig;
  const normalized_base_url = base_url.replace(/\/$/, "");

  async function request<T>(method: string, path: string, init: RequestInit = {}, options: RequestOptions = {}): Promise<T> {

    let res: Response;
    const controller = new AbortController();

    const timeoutMs = options.timeout_ms != undefined ? f_normalizeTimeoutMs(options.timeout_ms, clientConfig.timeout_ms) : clientConfig.timeout_ms;

    const timeout_id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      res = await f_fetch(`${normalized_base_url}${path}`, {
        ...init,
        method,
        signal: controller.signal,
        headers: {
          "x-api-key": api_key,
          ...(init.headers ?? {})
        }
      });
    } catch (err) {

      if (f_isAbortError(err)) {
        throw new ApiError({
          status: 0,
          name: "TimeoutError",
          message: `Request timed out after ${timeoutMs}ms`,
          body: err
        });
      }
      throw new ApiError({
        status: 0,
        message: "Network error: failed to connect to Uhmbrella API",
        body: err
      });

    } finally {
      clearTimeout(timeout_id);
    }

    const contentType = res.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      throw new ApiError({ status: res.status, message: "API response was not a JSON object." });
    }

    const body = await res.json();

    if (!res.ok) {
      throw new ApiError({
        status: res.status,
        message:
          typeof body === "string"
            ? body
            : (body as any)?.detail ?? "API request failed",
        body
      });
    }

    return body as T;
  }
  return {
    get: <T>(path: string, init: RequestInit, options: RequestOptions = {}) => request<T>("GET", path, init, options),
    post: <T>(path: string, init: RequestInit, options: RequestOptions = {}) => request<T>("POST", path, init, options)
  };
};

function f_normalizeTimeoutMs(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  if (value < 0) {
    return fallback;
  }

  return Math.floor(value);
}

function f_isAbortError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as any).name === "AbortError"
  );
}
