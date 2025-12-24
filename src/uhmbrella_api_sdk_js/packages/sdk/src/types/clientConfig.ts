import { createUhmbrellaClient } from "../client";

export type UhmbrellaClientConfig = {
  api_key: string;
  base_url?: string;
  jobs?: {
    chunk_size?: number;
  }

  f_fetch?: typeof fetch;
};

export type UhmbrellaClientConfigResolved = Omit<UhmbrellaClientConfig, "jobs" | "base_url" | "f_fetch"> & {
  base_url: string;
  f_fetch: typeof fetch;
  jobs: {
    chunk_size: number;
  };
};

export type UhmbrellaSDK = ReturnType<typeof createUhmbrellaClient>;
