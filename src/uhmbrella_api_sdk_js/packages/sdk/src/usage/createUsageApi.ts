import { assertUsageInfo } from "../asserts";
import { type HttpClient } from "../http";
import { RequestOptions, UsageInfo } from "../shared/";
import { UsageApi } from "./usage";

export function createUsageApi(httpClient: HttpClient): UsageApi {

  function f_get_usage(options?: RequestOptions): Promise<UsageInfo> {
    return httpClient.get<UsageInfo>("/usage", {}, { timeout_ms: options?.timeout_ms });
  }

  function f_get_usage_safe(options?: RequestOptions): Promise<UsageInfo> {

    const response = httpClient.get<UsageInfo>('/usage', {}, { timeout_ms: options?.timeout_ms });
    assertUsageInfo(response);
    return response;
  }
  return { getUsage: f_get_usage, getUsageSafe: f_get_usage_safe };

}

