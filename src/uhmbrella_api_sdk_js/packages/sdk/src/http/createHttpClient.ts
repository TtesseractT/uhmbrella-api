import { ApiError } from "./errors";

export type HttpClientConfig = {
  api_key: string;
  base_url: string;
  f_fetch?: typeof fetch;
};

export type HttpClient = ReturnType<typeof createHttpClient>;

export const createHttpClient = (clientConfig: HttpClientConfig) => {

  const { api_key, base_url, f_fetch = fetch } = clientConfig;
  const normalized_base_url = base_url.replace(/\/$/, "");

  async function request<T>(method: string, path: string, init: RequestInit = {}): Promise<T> {

    let res: Response;

    try {
      res = await f_fetch(`${normalized_base_url}${path}`, {
        ...init,
        method,
        headers: {
          "x-api-key": api_key,
          ...(init.headers ?? {})
        }
      });
    } catch (err) {
      throw new ApiError({
        status: 0,
        message: "Network error: failed to connect to Uhmbrella API",
        body: err
      });
    }

    const contentType = res.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await res.json()
      : await res.text();

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
    get: <T>(path: string, init: RequestInit) => request<T>("GET", path, init),
    post: <T>(path: string, init: RequestInit) => request<T>("POST", path, init)
  };
};
