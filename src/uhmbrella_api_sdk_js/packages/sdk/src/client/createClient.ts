import { create_Analyze_Api } from "../analyze/createAnalyzeApi";
import { ApiError, create_Http_Client } from "../http";
import { HttpClient } from "../http/createHttpClient";
import { create_Jobs_Api } from "../jobs";
import { ClientConfigSchema } from "../schemas/clientConfig.schema";
import { ParsedUhmbrellaClientConfig, UhmbrellaClientConfig } from "../types/clientConfig";
import { create_Usage_Api } from "../usage/createUsageApi";
import { UhmbrellaClientError } from "./error";
import { ZodError } from "zod";


function createUhmbrellaClient(config: UhmbrellaClientConfig) {

  const parsed = ClientConfigSchema.parse(config);

  const httpClient = create_Http_Client({
    api_key: parsed.api_key,
    base_url: parsed.base_url,
    f_fetch: fetch
  });

  return {
    usage: create_Usage_Api(httpClient),
    analyze: create_Analyze_Api(httpClient),
    jobs: create_Jobs_Api(httpClient, parsed.jobs?.chunk_size)

  };
}

async function createUhmbrellaClientSafe(config: UhmbrellaClientConfig) {
  let httpClient: HttpClient;
  let parsed: ParsedUhmbrellaClientConfig;

  try {
    parsed = ClientConfigSchema.parse(config);

    httpClient = create_Http_Client({
      api_key: parsed.api_key,
      base_url: parsed.base_url,
      f_fetch: fetch
    });


    await create_Usage_Api(httpClient).getUsage();


  } catch (error) {
    if (error instanceof ApiError && (error.status == 400 || error.status == 401)) {
      error.message = "Authentication Error: " + error.message;
    } else if (error instanceof ZodError) {
      throw new UhmbrellaClientError({ message: error.errors[0]!.message });
    }
    throw error;
  }
  return {
    usage: create_Usage_Api(httpClient),
    analyze: create_Analyze_Api(httpClient),
    jobs: create_Jobs_Api(httpClient, parsed.jobs?.chunk_size)
  };
}

export { createUhmbrellaClient, createUhmbrellaClientSafe }

