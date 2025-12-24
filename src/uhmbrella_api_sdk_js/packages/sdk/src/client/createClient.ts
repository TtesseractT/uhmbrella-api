import { create_Analyze_Api } from "../analyze/createAnalyzeApi";
import { DEFAULT_CHUNK_SIZE, MAX_CHUNK_SIZE } from "../constants";
import { ApiError, create_Http_Client } from "../http";
import { HttpClient } from "../http/createHttpClient";
import { create_Jobs_Api } from "../jobs";
import { UhmbrellaClientConfigResolved, UhmbrellaClientConfig } from "../types/clientConfig";
import { create_Usage_Api } from "../usage/createUsageApi";
import { UhmbrellaClientError } from "./error";


function createUhmbrellaClient(config: UhmbrellaClientConfig) {

  f_parse_client_config(config);

  const httpClient = create_Http_Client({
    api_key: config.api_key,
    base_url: config.base_url,
    f_fetch: config.f_fetch
  });

  return {
    usage: create_Usage_Api(httpClient),
    analyze: create_Analyze_Api(httpClient),
    jobs: create_Jobs_Api(httpClient, config.jobs.chunk_size)

  };
}

async function createUhmbrellaClientSafe(config: UhmbrellaClientConfig) {
  let httpClient: HttpClient;

  try {
    f_parse_client_config(config);

    console.log(config)
    httpClient = create_Http_Client({
      api_key: config.api_key,
      base_url: config.base_url,
      f_fetch: config.f_fetch
    });


    await create_Usage_Api(httpClient).getUsage();


  } catch (error) {
    if (error instanceof ApiError && (error.status == 400 || error.status == 401)) {
      error.message = "Authentication Error: " + error.message;
    }
    throw error;
  }
  return {
    usage: create_Usage_Api(httpClient),
    analyze: create_Analyze_Api(httpClient),
    jobs: create_Jobs_Api(httpClient, config.jobs.chunk_size)
  };
}

function f_parse_client_config(
  config: UhmbrellaClientConfig
): asserts config is UhmbrellaClientConfigResolved {

  if (!config.api_key || config.api_key.length < 21) {
    throw new UhmbrellaClientError({
      message: "API key is required, minimum length is 21. e.g.: UHM-XXXXX-XXXXX-XXXXX"
    });
  }

  config.base_url ??= "https://api.uhmbrella.io";
  config.f_fetch ??= fetch;
  config.jobs ??= {};
  config.jobs.chunk_size ??= DEFAULT_CHUNK_SIZE;

  if (!f_is_Valid_Http_Url(config.base_url)) {
    throw new UhmbrellaClientError({ message: "Invalid base_url" });
  }

  if (typeof config.f_fetch !== "function") {
    throw new UhmbrellaClientError({ message: "Invalid f_fetch" });
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


}

export function f_is_Valid_Http_Url(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
export { createUhmbrellaClient, createUhmbrellaClientSafe }

