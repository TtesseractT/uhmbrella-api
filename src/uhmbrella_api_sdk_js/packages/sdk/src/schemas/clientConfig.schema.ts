import { z } from "zod";
import { DEFAULT_CHUNK_SIZE, MAX_CHUNK_SIZE } from "../constants";

export const ClientConfigSchema = z.object({
  api_key: z.string().min(21, "API key is required, minimum length is 21. e.g.: UHM-XXXXX-XXXXX-XXXXX"),
  base_url: z.string().url().optional().default('https://api.uhmbrella.io'),

  jobs: z.object({
    chunk_size: z.number().min(1).max(MAX_CHUNK_SIZE).default(DEFAULT_CHUNK_SIZE)
  }).optional()
});
