import { describe, expect, it } from "vitest";
import { createHttpClient } from "./createHttpClient";
import { tests } from "../tests";
import { DEFAULT_URL } from "../constants";


describe("HTTP request tests", () => {
  const abortHttpClient = createHttpClient({
    api_key: tests.valid_api_key,
    timeout_ms: 0,
    base_url: DEFAULT_URL,
    f_fetch: tests.createAbortableMockFetch()
  })

  const networkErrortHttpClient = createHttpClient({
    api_key: tests.valid_api_key,
    timeout_ms: 0,
    base_url: DEFAULT_URL,
    f_fetch: tests.createNetworkErrorFetch()
  });

  const textResponseHttpClient = createHttpClient({
    api_key: tests.valid_api_key,
    timeout_ms: 0,
    base_url: DEFAULT_URL,
    f_fetch: tests.createTextResponseFetch()
  });


  it("must throw TimeoutError", async () => {
    await expect(abortHttpClient.get('/usage', {})).rejects.toMatchObject({
      name: "TimeoutError",
      status: 0
    });
  });

  it("must throw NetworkError", async () => {
    await expect(networkErrortHttpClient.get('/usage', {})).rejects.toMatchObject({
      name: "NetworkError",
      status: 0
    });
  });

  it("must throw error when response is not JSON", async () => {
    await expect(textResponseHttpClient.get('/usage', {})).rejects.toMatchObject({
      name: "ApiError",
      status: 200
    });
  })
})
