import { AnalyzeResult } from "./analyze";
import { UsageInfo } from "./usage";

export type JobProgressCallback = (sent: number, total: number) => void;

export type CreateJobInput = {
  files: Array<{
    file: Blob | File;
    file_name?: string;
  }>;
  onProgress?: JobProgressCallback;
  chunk_size?: number;
};

export type JobCreateResponse = {
  job_id: string;
  status: 'queued' | 'processing' | 'done' | 'error' | 'cancelling' | 'cancelled';
  total_files: string;
  total_billed_seconds: number;
  remaining_seconds_before: number;
}

export type JobStatusResponse = Omit<JobCreateResponse, "remaining_seconds_before"> & Omit<UsageInfo, "user_id"> & {
  counts: {
    pending: number;
    processing: number;
    done: number;
    error: number;
  };
  progress: number;


};

export type JobResultsResponse = Omit<JobCreateResponse, "total_files" | "total_billed_seconds" | "remaining_seconds_before"> & {

  results: [
    {
      filename: string;
      status: string;
      error?: string;

      result?: AnalyzeResult;
    }
  ]
};

export type JobCancelResponse = Omit<JobCreateResponse, "total_files" | "total_billed_seconds" | "remaining_seconds_before">;
