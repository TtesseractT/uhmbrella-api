import { createAnalyzeApi } from "../analyze";
import { createUhmbrellaClient } from "../client";
import { createJobsApi } from "../jobs";
import { createUsageApi } from "../usage";

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
  jobs?: {
    /**
     *  Optional.
     *  Must be in the range of 1048576 and 52428800.
     *  Defaults to DEFAULT_CHUNK_SIZE
     */
    chunk_size?: number;
  }

  /**
   *@function fetch - Must conform to the WHATWG Fetch API. It should also return the Response object.
   *Optional.
   */
  f_fetch?: typeof fetch;
};

export type UhmbrellaClientConfigResolved = Omit<UhmbrellaClientConfig, "jobs" | "base_url" | "f_fetch"> & {
  base_url: string;
  f_fetch: typeof fetch;
  jobs: {
    chunk_size: number;
  };
};

export type UhmbrellaSDK = {
  usage: ReturnType<typeof createUsageApi>,
  analyze: ReturnType<typeof createAnalyzeApi>,
  jobs: ReturnType<typeof createJobsApi>

};
