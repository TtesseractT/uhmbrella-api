import { describe, expect, expectTypeOf, it } from "vitest";
import { createUhmbrellaClient, createUhmbrellaClientSafe } from "./createClient";
import { UhmbrellaSDK } from ".";
import { tests } from "../tests";
import { PLAN_NAMES } from "../shared";


describe("Client creation tests", () => {

  const valid_api_key = tests.valid_api_key;
  it.each([
    { key: undefined, case: "undefined" },
    { key: '', case: "empty, too short" },
    { key: "ABC-AB1SZ-LPQYD-ANB11", case: "bad prefix" },
    { key: "UHM-AB1SZ-LPQYD-ANB11-TYWXP", case: "too long" },
  ])("rejects invalid API key ($case)", ({ key }) => {

    expect(() =>
      createUhmbrellaClient({ api_key: key })
    ).toThrow();

  });
  it('accept valid API key', () => {

    const client = createUhmbrellaClient({ api_key: valid_api_key });

    expect(client).toBeDefined();
    expectTypeOf(client).toEqualTypeOf<UhmbrellaSDK>();
  });

  it.each([
    { key: { api_key: valid_api_key, base_url: "string that is not an URL" }, case: "invalid URL." },
    { key: { api_key: valid_api_key, jobs: { chunk_size: 100 * 1024 * 1024 } }, case: "jobs.chunk_size is bigger than the allowed max size" },
    { key: { api_key: valid_api_key, f_fetch: {} }, case: "invalid fetch type" },
    { key: { api_key: valid_api_key, request_options: { timeout_ms: -1 } }, case: "timeout_ms less than 0 ms" }
  ])('Rejects invalid options ($case)', ({ key }) => {
    expect(() => createUhmbrellaClient(key)).toThrow();
  });

});

describe("safe client tests", () => {
  const fetch200UsageInfo = tests.createMockFetch([
    {
      path: "/usage",
      method: "GET",
      status: 200,
      body: { user_id: "user_1", plan_name: PLAN_NAMES[0], quota_seconds: 700, used_seconds: 0, remaining_seconds: 0 }
    }
  ]);
  const fetch401UsageInfo = tests.createMockFetch([
    {
      path: "/usage",
      method: "GET",
      status: 401,
      body: { detail: "invalid_api_key" }
    }
  ]);
  it("safe client instance is returned when usage API returns 200", async () => {

    const client = await createUhmbrellaClientSafe({ api_key: tests.valid_api_key, f_fetch: fetch200UsageInfo });
    expect(client).toBeDefined();
    expectTypeOf(client).toEqualTypeOf<UhmbrellaSDK>();
  })

  it('Error thrown when f_fetch does not satisfy fetch type', async () => {
    await expect(async () => createUhmbrellaClientSafe({ api_key: tests.valid_api_key, f_fetch: () => { } })).rejects.toThrow("Provided fetch is not WHATWG-compatible");
  });

  it("error when API key does not belong to any user", async () => {
    await expect(async () => createUhmbrellaClientSafe({ api_key: 'UHM-AB1SZ-LPQYD-ANB11', f_fetch: fetch401UsageInfo })).rejects.toThrow(`Authentication Error: invalid_api_key`)
  });

  it('Error thrown when network error and timeout', async () => {
    const networkErrorFetch = tests.createNetworkErrorFetch();
    const abortFetch = tests.createAbortableMockFetch();
    await expect(async () => createUhmbrellaClientSafe({ api_key: tests.valid_api_key, f_fetch: networkErrorFetch })).rejects.toThrow();
    await expect(async () => createUhmbrellaClientSafe({ api_key: tests.valid_api_key, request_options: { timeout_ms: 0 }, f_fetch: abortFetch })).rejects.toMatchObject({ name: "TimeoutError", status: 0 });

  });

  it("throws when response is not JSON", async () => {
    const fetch = tests.createTextResponseFetch();
    const client = createUhmbrellaClient({
      api_key: tests.valid_api_key,
      f_fetch: fetch
    });

    await expect(async () =>
      await client.usage.getUsage()
    ).rejects.toMatchObject({ name: "ApiError" });
  });
})
