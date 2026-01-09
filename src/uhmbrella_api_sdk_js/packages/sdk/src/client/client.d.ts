import { AnalyzeApi, } from "../analyze/";
import { JobsApi } from "../jobs/";
import { UsageApi } from "../usage/";
import { JobOptions } from "../jobs/";

export interface UhmbrellaSDK {
  usage: UsageApi,

  /**
   * Synchronous audio analysis API.
   *
   * Provides audio analysis for small payloads.
   * For larger workloads or chunked uploads, use {@link JobsApi}.
   */
  analyze: AnalyzeApi,

  /**
   * Asynchronous audo analysis API.
   *
   * Provides functions for creation, cancellation of jobs, retrieve status and results of jobs.
   */
  jobs: JobsApi
};

/**
* @function createUhmbrellaClientSafe - Creates the Uhmbrella API SDK client. It calls the usage API to verify if the provided API key belongs to a valid user or not.
* @param {UhmbrellaClientConfig} config - {@link UhmbrellaClientConfig}
*
* @throws an {@link UhmbrellaSDKConfigError} if the configuration is invalid or inconsistent.
* 
* @returns an {@link UhmbrellaSDK}. Returns a Promise which resolves into a safe, ready to use client.
*
* Validates the config using assertions.
* Calls the Usage API to verify if the provided API key belongs to a valid User or not.
*/
export function createUhmbrellaClientSafe(config: UhmbrellaClientConfig): Promise<UhmbrellaSDK>;

/**
 * @function createUhmbrellaClient - Creates the Uhmbrella API SDK client.
 *
 * @param {UhmbrellaClientConfig} config - {@link UhmbrellaClientConfig}
 *
 * @throws an {@link UhmbrellaSDKConfigError}
 * 
 * Thrown if the configuration is invalid or inconsistent.
 * 
 * @returns an {@link UhmbrellaSDK}. Returns a client, call UhmbrellaSDK.usage.usage() to check if key is valid.
 *
 * Validates the config using assertion.
 */
export function createUhmbrellaClient(config: UhmbrellaClientConfig): UhmbrellaSDK;


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

