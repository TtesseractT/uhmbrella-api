import { createAnalyzeApi } from "../analyze";
import { createUhmbrellaClient } from "../client";
import { createJobsApi } from "../jobs";
import { createUsageApi } from "../usage";
import { JobOptions } from "./jobs";

export type RequestOptions = {
  /**
  * Defaults to 30000 ms.
  */
  timeout_ms?: number;
};

/**
 *@type UhmbrellaClientConfig - Required by createUhmbrellaClient
 *Resolves to UhmbrellaClientConfigResolved
 */
export type UhmbrellaClientConfig = {
  /**
   * Required, must be 21 characters in length.
   */
  api_key: string;
  /**
   * Defaults to "https://api.uhmbrella.io"
   */
  base_url?: string;

  jobs?: JobOptions;

  request_options?: RequestOptions;
  /**
   *@function fetch - Must conform to the WHATWG Fetch API. It should also return the Response object.
   *Optional.
   */
  f_fetch?: typeof fetch;
};

export type UhmbrellaClientConfigResolved = Omit<Required<UhmbrellaClientConfig>, "jobs" | "request_options"> & {
  jobs: Required<CreateJobOptions>;
  request_options: Required<RequestOptions>;
};
export type UhmbrellaSDK = {
  usage: ReturnType<typeof createUsageApi>,
  analyze: ReturnType<typeof createAnalyzeApi>,
  jobs: ReturnType<typeof createJobsApi>

};
