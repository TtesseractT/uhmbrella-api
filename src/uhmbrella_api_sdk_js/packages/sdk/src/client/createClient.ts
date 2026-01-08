import { UhmbrellaSDK } from ".";
import { createAnalyzeApi } from "../analyze";
import { assertNumber } from "../asserts";
import { DEFAULT_CHUNK_SIZE, DEFAULT_TIMEOUT_MS, DEFAULT_URL, MAX_CHUNK_SIZE } from "../shared";
import { ApiError, createHttpClient } from "../http";
import { HttpClient } from "../http/createHttpClient";
import { createJobsApi } from "../jobs";
import { UhmbrellaClientConfigResolved, UhmbrellaClientConfig } from "./client";
import { createUsageApi } from "../usage";
import { UhmbrellaSDKConfigError } from "./error";
import { f_isStringValidHttpUrl } from "../shared/utils";

export function createUhmbrellaClient(config: UhmbrellaClientConfig): UhmbrellaSDK {

  f_resolveClientConfig(config);

  const httpClient = createHttpClient({
    api_key: config.api_key,
    base_url: config.base_url,
    timeout_ms: config.request_options.timeout_ms,
    f_fetch: config.f_fetch
  });

  return {
    usage: createUsageApi(httpClient),
    analyze: createAnalyzeApi(httpClient),
    jobs: createJobsApi(httpClient, config.jobs.chunk_size)

  };
}


export async function createUhmbrellaClientSafe(config: UhmbrellaClientConfig): Promise<UhmbrellaSDK> {
  let httpClient: HttpClient;

  try {
    f_resolveClientConfig(config);

    if (!(await isFetchCompatible(config.f_fetch))) {
      throw new UhmbrellaSDKConfigError({
        message: "Provided fetch is not WHATWG-compatible"
      });
    }

    httpClient = createHttpClient({
      api_key: config.api_key,
      base_url: config.base_url,
      timeout_ms: config.request_options.timeout_ms,
      f_fetch: config.f_fetch
    });


    await createUsageApi(httpClient).getUsage();


  } catch (error) {
    if (error instanceof ApiError && (error.status == 400 || error.status == 401)) {
      error.message = "Authentication Error: " + error.message;
    }
    throw error;
  }
  return {
    usage: createUsageApi(httpClient),
    analyze: createAnalyzeApi(httpClient),
    jobs: createJobsApi(httpClient, config.jobs.chunk_size)
  };
}

function f_resolveClientConfig(
  config: UhmbrellaClientConfig
): asserts config is UhmbrellaClientConfigResolved {

  if (!config.api_key || config.api_key.length != 21) {
    throw new UhmbrellaSDKConfigError({
      message: "API key is required, required length is 21. e.g.: UHM-XXXXX-XXXXX-XXXXX"
    });
  }
  if (!config.api_key.startsWith('UHM-')) {
    throw new UhmbrellaSDKConfigError({
      message: "Invalid API key format, must start with UHM-"
    });
  }
  config.request_options ??= { timeout_ms: DEFAULT_TIMEOUT_MS };
  config.request_options.timeout_ms ??= DEFAULT_TIMEOUT_MS;

  config.base_url ??= DEFAULT_URL;
  config.f_fetch ??= fetch;
  config.jobs ??= {};
  config.jobs.chunk_size ??= DEFAULT_CHUNK_SIZE;

  if (!f_isStringValidHttpUrl(config.base_url)) {
    throw new UhmbrellaSDKConfigError({ message: "Invalid base_url" });
  }

  if (typeof config.f_fetch !== "function") {
    throw new UhmbrellaSDKConfigError({ message: "Invalid f_fetch" });
  }
  if (!Number.isFinite(config.jobs.chunk_size)) {
    throw new UhmbrellaSDKConfigError({
      message: "chunk_size must be a finite integer"
    });
  }
  if (config.jobs.chunk_size > MAX_CHUNK_SIZE) {
    throw new UhmbrellaSDKConfigError({
      message: `chunk_size cannot exceed ${MAX_CHUNK_SIZE / 1024 / 1024} MB`
    });
  }

  if (config.jobs.chunk_size < 1024 * 1024) {
    throw new UhmbrellaSDKConfigError({
      message: "chunk_size cannot be smaller than 1 MB"
    });
  }

  assertNumber(config.request_options.timeout_ms, "config.request_options.timeout_ms");
  if (config.request_options.timeout_ms < 0) {

    throw new UhmbrellaSDKConfigError({
      message: `config.timeout_ms must be not a negative integer, got ${config.request_options.timeout_ms}`
    });
  }
  config.request_options.timeout_ms = Math.floor(config.request_options.timeout_ms);

}

async function isFetchCompatible(
  f: typeof fetch
): Promise<boolean> {
  try {
    const res = await f("data:text/plain,ok");
    return typeof res === "object" &&
      typeof res.ok === "boolean" &&
      typeof res.headers?.get === "function";
  } catch {
    return false;
  }
}


