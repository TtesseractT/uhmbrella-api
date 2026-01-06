import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { createUhmbrellaClient } from "../client";
import { tests } from "../tests";
import { JobConfig, JobCreateResponse } from "../types";
import { createHttpClient } from "../http";
import { HttpClient } from "../http/createHttpClient";
import { DEFAULT_CHUNK_SIZE, MAX_CHUNK_SIZE } from "../constants";
import { UhmbrellaSDKError } from "../error";
import { f_getTotalBytes, f_chunkBlob } from "../utils";

describe("Jobs API testing", () => {
  const fetchInitWithoutJobId = tests.createMockFetch([
    {
      path: "/v1/jobs/init",
      method: "POST",
      status: 200,
      body: {}
    }
  ]);


  const mockFetch_incorrect_id = vi.fn(
    async (input: RequestInfo, init) => {
      const url = new URL(
        typeof input === "string" ? input : input.url,
        "http://localhost"
      );

      // Match PATH only
      if (url.pathname.endsWith("/init")) {
        return new Response(JSON.stringify({ job_id: "job-123" }), { status: 201, headers: { "content-type": "application/json" } });
      }
      if (
        url.pathname.startsWith("/v1/jobs/") &&
        url.pathname.endsWith("/upload-chunk")
      ) {
        return new Response("bad job id", { status: 401 });
      }

      return new Response("Not found", { status: 404 });
    }) as typeof fetch;

  it("throws if /jobs/init does not return job_id", async () => {
    const client = createUhmbrellaClient({
      api_key: tests.valid_api_key,
      f_fetch: fetchInitWithoutJobId
    });

    await expect(
      client.jobs.create({
        files: [{ file: new Blob(), file_name: "a.mp3" }]
      })
    ).rejects.toThrow(/job_id/i);
  });

  it("throws if upload-chunk returns non-201", async () => {
    const client = createUhmbrellaClient({
      api_key: tests.valid_api_key,
      f_fetch: mockFetch_incorrect_id
    });

    await expect(
      client.jobs.create({
        files: [{ file: new Blob(["abc"]), file_name: "a.mp3" }]
      })
    ).rejects.toThrow();
  });

  it("fails when starting with non-zero index", async () => {
    const fetch = tests.createStatefulUploadMockFetch();
    const http = createHttpClient({
      api_key: "UHM-TEST-KEY-123456789",
      base_url: "https://api.test",
      timeout_ms: 50000,
      f_fetch: fetch
    });

    const file = randomBlob(2048);
    await expect(
      f_create_job(
        http,
        {
          files: [{ file, file_name: "start-bad.mp3" }],
          options: { chunk_size: 1024 }
        },
        { startWithNonZeroIndex: true }
      )
    ).rejects.toThrow(/first_chunk_index_must_be_0/i);
  });

  it("fails when total changes midway through upload", async () => {
    const fetch = tests.createStatefulUploadMockFetch();
    const http = createHttpClient({
      api_key: "UHM-TEST-KEY-123456789",
      base_url: "https://api.test",
      timeout_ms: 50000,
      f_fetch: fetch
    });

    const file = randomBlob(3072); // 3 chunks
    await expect(
      f_create_job(
        http,
        {
          files: [{ file, file_name: "total-change.mp3" }],
          options: { chunk_size: 1024 }
        },
        { changeTotalMidway: true }
      )
    ).rejects.toThrow(/total_mismatch/i);
  });

  it("fails when index is randomized out of sequence", async () => {
    const fetch = tests.createStatefulUploadMockFetch();
    const http = createHttpClient({
      api_key: "UHM-TEST-KEY-123456789",
      base_url: "https://api.test",
      timeout_ms: 50000,
      f_fetch: fetch
    });

    const file = randomBlob(4096); // 4 chunks
    await expect(
      f_create_job(
        http,
        {
          files: [{ file, file_name: "random-index.mp3" }],
          options: { chunk_size: 10 }
        },
        { randomizeIndex: true }
      )
    ).rejects.toThrow(/out_of_sequence|out_of_order/i);
  });

  it("fails when index exceeds total", async () => {
    const fetch = tests.createStatefulUploadMockFetch();
    const http = createHttpClient({
      api_key: "UHM-TEST-KEY-123456789",
      base_url: "https://api.test",
      timeout_ms: 50000,
      f_fetch: fetch
    });

    const file = randomBlob(2048);
    await expect(
      f_create_job(
        http,
        {
          files: [{ file, file_name: "exceed-total.mp3" }],
          options: { chunk_size: 1024 }
        },
        { indexExceedsTotal: true }
      )
    ).rejects.toThrow(/exceeds_total/i);
  });

  it("fails when chunks are skipped", async () => {
    const fetch = tests.createStatefulUploadMockFetch();
    const http = createHttpClient({
      api_key: "UHM-TEST-KEY-123456789",
      base_url: "https://api.test",
      timeout_ms: 50000,
      f_fetch: fetch
    });

    const file = randomBlob(4096);
    await expect(
      f_create_job(
        http,
        {
          files: [{ file, file_name: "skip-chunks.mp3" }],
          options: { chunk_size: 1024 }
        },
        { skipIndices: [1] } // Skip chunk at index 1
      )
    ).rejects.toThrow(/out_of_sequence/i);
  });

  it("fails when chunks are duplicated", async () => {
    const fetch = tests.createStatefulUploadMockFetch();
    const http = createHttpClient({
      api_key: "UHM-TEST-KEY-123456789",
      base_url: "https://api.test",
      timeout_ms: 50000,
      f_fetch: fetch
    });

    const file = randomBlob(3072);
    await expect(
      f_create_job(
        http,
        {
          files: [{ file, file_name: "duplicate-chunks.mp3" }],
          options: { chunk_size: 1024 }
        },
        { duplicateChunks: [0] }
      )
    ).rejects.toThrow(/out_of_sequence/i);
  });

  it("succeeds with normal sequential upload", async () => {
    const fetch = tests.createStatefulUploadMockFetch();
    const http = createHttpClient({
      api_key: "UHM-TEST-KEY-123456789",
      base_url: "https://api.test",
      timeout_ms: 50000,
      f_fetch: fetch
    });

    const file = randomBlob(2048);
    const result = await f_create_job(
      http,
      {
        files: [{ file, file_name: "good.mp3" }],
        options: { chunk_size: 1024 }
      });

    expect(result.job_id).toBe("job-123");
    expect(result.status).toBe("queued");
  });

  function randomBlob(size: number): Blob {
    const bytes = crypto.getRandomValues(new Uint8Array(size));
    return new Blob([bytes], { type: "application/octet-stream" });
  }

});


interface TestConfig {
  randomizeIndex?: boolean;
  changeTotalMidway?: boolean;
  startWithNonZeroIndex?: boolean;
  indexExceedsTotal?: boolean;
  skipIndices?: number[];
  duplicateChunks?: number[]; // indices to send twice
}

async function f_create_job(
  http: HttpClient,
  jobConfig: JobConfig,
  testConfig?: TestConfig
): Promise<JobCreateResponse> {
  const { files } = jobConfig;
  const onProgress = jobConfig.options?.onProgress;
  const chunk_size = jobConfig.options?.chunk_size ?? DEFAULT_CHUNK_SIZE;
  const chunk_upload_timeout = jobConfig.options?.chunk_upload_timeout;
  const r_chunk_size = chunk_size > MAX_CHUNK_SIZE ? MAX_CHUNK_SIZE : chunk_size;

  const init = await http.post<{ job_id: string }>("/v1/jobs/init", {});
  if (!init.job_id) {
    throw new UhmbrellaSDKError({
      name: "ApiError",
      message: "jobs.init did not return job_id"
    });
  }
  const jobId = init.job_id;
  const totalBytes = f_getTotalBytes(files);
  let sentBytes = 0;
  onProgress?.(sentBytes, totalBytes);

  for (const { file, file_name } of files) {
    const totalChunks = Math.ceil(file.size / r_chunk_size);
    let index = testConfig?.startWithNonZeroIndex
      ? Math.floor(Math.random() * 3) + 1
      : 0;

    let currentTotal = totalChunks;
    const chunks = Array.from(f_chunkBlob(file, r_chunk_size));

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Skip chunks if configured
      if (testConfig?.skipIndices?.includes(i)) {
        index++;
        continue;
      }

      // Randomize index
      if (testConfig?.randomizeIndex && i > 0) {
        index = Math.floor(Math.random() * 10);
      }

      // Change total midway
      if (testConfig?.changeTotalMidway && i === Math.floor(chunks.length / 2)) {
        currentTotal = totalChunks + Math.floor(Math.random() * 5) + 1;
      }

      // Make index exceed total
      if (testConfig?.indexExceedsTotal && i === chunks.length - 1) {
        index = currentTotal + Math.floor(Math.random() * 3) + 1;
      }

      await http.post(
        `/v1/jobs/${jobId}/upload-chunk?` +
        new URLSearchParams({
          filename: file_name ?? `audio ${i + 1}`,
          index: String(index),
          total: String(currentTotal)
        }),
        { body: chunk },
        { timeout_ms: chunk_upload_timeout }
      );

      if (testConfig?.duplicateChunks?.includes(i)) {
        await http.post(
          `/v1/jobs/${jobId}/upload-chunk?` +
          new URLSearchParams({
            filename: file_name ?? `audio ${i + 1}`,
            index: String(index),
            total: String(currentTotal)
          }),
          { body: chunk },
          { timeout_ms: chunk_upload_timeout }
        );
      }

      sentBytes += chunk!.size;
      onProgress?.(sentBytes, totalBytes);

      if (!testConfig?.randomizeIndex) {
        index++;
      }
    }
  }

  return http.post<JobCreateResponse>(`/v1/jobs/${jobId}/finalize`, {});
}
