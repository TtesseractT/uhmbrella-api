import { assertUsageInfo } from "../asserts";
import { HttpClient } from "../http/createHttpClient";
import { RequestOptions, UsageInfo } from "../types";



const createUsageApi = (httpClient: HttpClient) => {

  function f_get_usage(options?: RequestOptions): Promise<UsageInfo> {
    return httpClient.get<UsageInfo>("/usage", {}, { timeout_ms: options?.timeout_ms });
  }

  /**
   * @throws {UhmbrellaAssertError}
   */
  function f_get_usage_safe(options?: RequestOptions): Promise<UsageInfo> {

    const response = httpClient.get<UsageInfo>('/usage', {}, { timeout_ms: options?.timeout_ms });
    assertUsageInfo(response);
    return response;
  }
  return { getUsage: f_get_usage, getUsageSafe: f_get_usage_safe };

}

export { createUsageApi };
