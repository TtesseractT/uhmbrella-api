import type { AnalyzeResult } from "./analyze.js";
import { RequestOptions } from "./clientConfig.js";
import type { UsageInfo } from "./usage.js";
import { J_STATUS } from "../constants.js";
export type JobProgressCallback = (sent: number, total: number) => void;
export type JobStatus = typeof J_STATUS[number];
export type CreateJobConfig = {
  files: Array<{
    file: Blob | File;
    file_name?: string;
  }>;

  options?: CreateJobOptions;
};

export type CreateJobOptions = {
  onProgress?: JobProgressCallback;

  /**
    *  Optional.
    *  Must be in the range of 1048576 and 52428800.
    *  Defaults to DEFAULT_CHUNK_SIZE
    */
  chunk_size?: number;
  /**
    * Optional, defaults to timeout_ms of RequestOptions.
    */
  chunk_upload_timeout?: number;

}
export type JobCreateResponse = {
  job_id: string;
  status: JobStatus;
  total_files: number;
  total_billed_seconds: number;
  remaining_seconds_before: number;
}

export type JobStatusResponse = Omit<JobCreateResponse, "remaining_seconds_before"> & Omit<UsageInfo, "user_id"> & {

  counts: ExactPartialRecord<JobStatus, number>;
  progress: number;


};

export type JobResultsResponse = Omit<JobCreateResponse, "total_files" | "total_billed_seconds" | "remaining_seconds_before"> & {

  results: [
    {
      filename: string;
      status: JobStatus;
      error?: string;

      result?: AnalyzeResult;
    }
  ]
};

export type JobCancelResponse = Omit<JobCreateResponse, "total_files" | "total_billed_seconds" | "remaining_seconds_before">;


type ExactPartialRecord<K extends PropertyKey, V> =
  Partial<Record<K, V>> &
  Record<Exclude<string, K>, never>;
