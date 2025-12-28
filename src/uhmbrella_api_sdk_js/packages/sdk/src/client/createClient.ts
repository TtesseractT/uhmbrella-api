import { createAnalyzeApi } from "../analyze";
import { assertNumber } from "../assert-helpers";
import { DEFAULT_CHUNK_SIZE, DEFAULT_TIMEOUT_MS, MAX_CHUNK_SIZE } from "../constants";
import { ApiError, createHttpClient } from "../http";
import { HttpClient } from "../http/createHttpClient";
import { createJobsApi } from "../jobs";
import { UhmbrellaClientConfigResolved, UhmbrellaClientConfig, UhmbrellaSDK } from "../types/clientConfig";
import { createUsageApi } from "../usage";
import { f_isStringValidHttpUrl } from "../utils";
import { UhmbrellaClientError } from "./error";

/**
 * @function createUhmbrellaClient - Creates the Uhmbrella API SDK client.
 * @param {UhmbrellaClientConfig} config
 * @returns {UhmbrellaSDK} - Returns a client, call UhmbrellaSDK.usage.usage() to check if key is valid.
 *
 * Validates the config using assertion.
 */
function createUhmbrellaClient(config: UhmbrellaClientConfig): UhmbrellaSDK {

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

/**
 * @function createUhmbrellaClient - Creates the Uhmbrella API SDK client.
 * @param {UhmbrellaClientConfig} config
 * @returns {Promise<UhmbrellaSDK>} - Returns a safe, ready to use client.
 *
 * Validates the config using assertion.
 * Calls the Usage API to verify if the provided API key belongs to a valid User or not.
 */
async function createUhmbrellaClientSafe(config: UhmbrellaClientConfig): Promise<UhmbrellaSDK> {
  let httpClient: HttpClient;

  try {
    f_resolveClientConfig(config);

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

  if (!config.api_key || config.api_key.length < 21) {
    throw new UhmbrellaClientError({
      message: "API key is required, minimum length is 21. e.g.: UHM-XXXXX-XXXXX-XXXXX"
    });
  }

  config.request_options ??= { timeout_ms: DEFAULT_TIMEOUT_MS };
  config.request_options.timeout_ms ??= DEFAULT_TIMEOUT_MS;

  config.base_url ??= "https://api.uhmbrella.io";
  config.f_fetch ??= fetch;
  config.jobs ??= {};
  config.jobs.chunk_size ??= DEFAULT_CHUNK_SIZE;

  if (!f_isStringValidHttpUrl(config.base_url)) {
    throw new UhmbrellaClientError({ message: "Invalid base_url" });
  }

  if (typeof config.f_fetch !== "function") {
    throw new UhmbrellaClientError({ message: "Invalid f_fetch" });
  }
  if (!Number.isFinite(config.jobs.chunk_size)) {
    throw new UhmbrellaClientError({
      message: "chunk_size must be a finite integer"
    });
  }
  if (config.jobs.chunk_size > MAX_CHUNK_SIZE) {
    throw new UhmbrellaClientError({
      message: `chunk_size cannot exceed ${MAX_CHUNK_SIZE / 1024 / 1024} MB`
    });
  }

  if (config.jobs.chunk_size < 1024 * 1024) {
    throw new UhmbrellaClientError({
      message: "chunk_size cannot be smaller than 1 MB"
    });
  }

  assertNumber(config.request_options.timeout_ms, "config.request_options.timeout_ms");
  if (config.request_options.timeout_ms < 1) {

    throw new UhmbrellaClientError({
      message: `config.timeout_ms must be a positive integer, got ${config.request_options.timeout_ms}`
    });
  }
  config.request_options.timeout_ms = Math.floor(config.request_options.timeout_ms);

}


export { createUhmbrellaClient, createUhmbrellaClientSafe }

