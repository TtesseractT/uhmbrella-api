export namespace tests {
  export const valid_api_key = 'UHM-XYZWA-ATLOB-IJKLO';

  type MockRoute = {
    method?: string;
    path: string;
    status?: number;
    headers?: Record<string, string>;
    body?: unknown;
  };

  export function createMockFetch(routes: MockRoute[]): typeof fetch {

    return (async (input: string | Request, init) => {
      const url = typeof input === "string" ? input : input.url;
      const method = (init?.method ?? "GET").toUpperCase();

      const route = routes.find(r =>
        url.endsWith(r.path) &&
        (!r.method || r.method.toUpperCase() === method)
      );

      if (!route) {
        return new Response(
          JSON.stringify({ detail: "Not found" }),
          { status: 404, headers: { "content-type": "application/json" } }
        );
      }

      const headers = {
        ...(route.headers ?? {}),
        ...(route.body !== undefined
          ? { "content-type": "application/json" }
          : {})
      };

      const body =
        typeof route.body === "string"
          ? route.body
          : route.body !== undefined
            ? JSON.stringify(route.body)
            : undefined;

      return new Response(body, {
        status: route.status ?? 200,
        headers
      });
    }) as typeof fetch;
  }

  export function createAbortableMockFetch(delayMs = 0): typeof fetch {
    return ((input: RequestInfo | URL, init?: RequestInit) => {
      const signal = init?.signal;

      return new Promise<Response>((_resolve, reject) => {

        if (signal?.aborted) {
          reject(abortError());
          return;
        }

        const onAbort = () => {
          clearTimeout(timer);
          reject(abortError());
        };

        signal?.addEventListener("abort", onAbort, { once: true });

        const timer = setTimeout(() => {
          signal?.removeEventListener("abort", onAbort);

          // This should never resolve if timeoutMs === 0 in client
          _resolve(
            new Response("OK", {
              status: 200,
              headers: { "content-type": "text/plain" }
            })
          );
        }, delayMs);
      });
    }) as typeof fetch;
  }

  function abortError() {
    const err = new Error("The operation was aborted");
    (err as any).name = "AbortError";
    return err;
  }

  export function createNetworkErrorFetch(
    error: Error = new TypeError("Failed to fetch")
  ): typeof fetch {
    return (async () => {
      throw error;
    }) as typeof fetch;
  }
  export function createTextResponseFetch(
    status = 200,
    text = "OK"
  ): typeof fetch {
    return (async () =>
      new Response(text, {
        status,
        headers: { "content-type": "text/plain" }
      })
    ) as typeof fetch;
  }
}
