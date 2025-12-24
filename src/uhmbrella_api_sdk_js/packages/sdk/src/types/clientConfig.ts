import { createUhmbrellaClient } from "../client";
import { ClientConfigSchema } from "../schemas/clientConfig.schema";

export type UhmbrellaClientConfig = {
  api_key: string;
  base_url?: string;
  jobs?: {
    chunk_size?: number;
  }

  f_fetch?: typeof fetch;
};

export type ParsedUhmbrellaClientConfig = ReturnType<typeof ClientConfigSchema.parse>;


export type UhmbrellaSDK = ReturnType<typeof createUhmbrellaClient>;
