import { createHttpClient } from "./createHttpClient";

export type HttpClientConfig = {
  api_key: string;
  base_url: string;
  timeout_ms: number;
  f_fetch?: typeof fetch;
};

export type HttpClient = ReturnType<typeof createHttpClient>;
