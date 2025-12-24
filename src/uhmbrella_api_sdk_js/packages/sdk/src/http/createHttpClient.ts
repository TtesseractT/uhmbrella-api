import { ApiError } from "./errors";

export type HttpClientConfig = {
  api_key: string;
  base_url: string;
  f_fetch?: typeof fetch;
};

export type HttpClient = ReturnType<typeof create_Http_Client>;

export const create_Http_Client = (clientConfig: HttpClientConfig) => {

  const { api_key, base_url, f_fetch = fetch } = clientConfig;
  const normalized_base_url = base_url.replace(/\/$/, "");

  async function f_request<T>(method: string, path: string, init: RequestInit = {}): Promise<T> {

    const res = await f_fetch(`${normalized_base_url}${path}`,
      {
        ...init,
        method,
        headers: {
          "x-api-key": api_key,
          ...(init.headers ?? {})
        }
      }
    );

    let body: unknown;
    const contentType = res.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }

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
    get: <T>(path: string, init: RequestInit) => f_request<T>("GET", path, init),
    post: <T>(path: string, init: RequestInit) => f_request<T>("POST", path, init)
  };
};
