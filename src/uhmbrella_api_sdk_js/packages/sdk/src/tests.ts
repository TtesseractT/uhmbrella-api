export namespace tests {
  export const valid_api_key = 'UHM-XYZWA-ATLOB-IJKLO';

  type MockRoute = {
    method?: string;
    path: string;
    status?: number;
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

      return new Response(
        route.body ? JSON.stringify(route.body) : undefined,
        {
          status: route.status ?? 200,
          headers: { "content-type": "application/json" }
        }
      );
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
  };

  export function createPOSTJSONResponseFetch(body: Record<string, any>, status = 201): typeof fetch {

    return (async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" }
      })
    ) as typeof fetch;
  };

  type UploadState = {
    total: number;
    nextIndex: number;
  };

  type JobState = {
    files: Map<string, UploadState>;
  };

  export function createStatefulUploadMockFetch(options?: {
    jobId?: string;
  }): typeof fetch {
    const jobId = options?.jobId ?? "job-123";

    const job: JobState = {
      files: new Map()
    };

    return (async (input: RequestInfo, init) => {
      const url = typeof input === "string" ? input : input.url;
      const method = (init?.method ?? "GET").toUpperCase();

      if (url.endsWith("/v1/jobs/init") && method === "POST") {
        return json(201, { job_id: jobId });
      }

      if (
        url.includes(`/v1/jobs/${jobId}/upload-chunk`) &&
        method === "POST"
      ) {
        const u = new URL(url);
        const filename = u.searchParams.get("filename");
        const indexStr = u.searchParams.get("index");
        const totalStr = u.searchParams.get("total");

        if (!filename || indexStr === null || totalStr === null) {
          return json(400, { detail: "Missing query params" });
        }

        const index = Number(indexStr);
        const total = Number(totalStr);

        if (!Number.isInteger(index) || index < 0) {
          return json(400, { detail: "Invalid index" });
        }

        if (!Number.isInteger(total) || total <= 0) {
          return json(400, { detail: "Invalid total" });
        }

        let state = job.files.get(filename);

        if (!state) {
          if (index !== 0) {
            return json(400, {
              detail: "chunk_out_of_order_first_chunk_index_must_be_0"
            });
          }

          state = {
            total,
            nextIndex: 1
          };
          job.files.set(filename, state);

          return json(201, {
            status: "ok",
            job_id: jobId,
            filename: filename,
            chunk_index: index,
            total_chunks: total
          })
        }

        if (total !== state.total) {
          return json(400, {
            detail: "chunk_total_mismatch_for_file"
          });
        }

        if (index >= total) {
          return json(400, {
            detail: "chunk_index_exceeds_total"
          });
        }

        if (index !== state.nextIndex) {
          return json(400, {
            detail: `chunk_index_out_of_sequence`
          });
        }


        state.nextIndex++;


        return json(201, {
          status: "ok",
          job_id: jobId,
          filename: filename,
          chunk_index: index,
          total_chunks: total
        })
      }

      if (url.endsWith(`/v1/jobs/${jobId}/finalize`) && method === "POST") {
        for (const [filename, state] of job.files) {
          if (state.nextIndex !== state.total) {
            return json(400, {
              detail: `job_metadata_missing`
            });
          }
        }

        return json(201, {
          job_id: jobId,
          status: "queued"
        });
      }

      if (url.includes("/v1/jobs/") && url.includes("/upload-chunk")) {
        return json(404, { detail: "Job not found" });
      }

      return json(404, { detail: "Not found" });
    }) as typeof fetch;
  }


  function json(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" }
    });
  }




}
