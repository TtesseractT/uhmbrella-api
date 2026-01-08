import { HttpClient } from "../http/createHttpClient";
import { UsageInfo } from "../types/usage";



const createUsageApi = (httpClient: HttpClient) => {

  function f_get_usage(): Promise<UsageInfo> {
    return httpClient.get<UsageInfo>("/usage", {});
  }

  return { getUsage: f_get_usage };
}

export { createUsageApi };
