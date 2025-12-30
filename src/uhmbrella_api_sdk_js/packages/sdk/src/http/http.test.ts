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
  it("must throw TimeoutError", async () => {
    await expect(abortHttpClient.get('/usage', {})).rejects.toMatchObject({
      name: "TimeoutError",
      status: 0
    });
  })

})
