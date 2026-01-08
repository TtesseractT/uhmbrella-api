import { DEFAULT_CHUNK_SIZE, MAX_CHUNK_SIZE, UhmbrellaSDKError } from "../shared";
import { f_getTotalBytes, f_chunkBlob } from "../shared/utils";
import type { HttpClient } from "../http/createHttpClient";
import { JobConfig, JobCancelResponse, JobCreateResponse, JobResultsResponse, JobStatusResponse, JobsApi } from "./jobs.d";
import { f_assertJobCreateResponse, f_assertJobResultResponse, f_assertJobStatusResponse } from "./jobs.assert";

export function createJobsApi(http: HttpClient, chunkSize: number = DEFAULT_CHUNK_SIZE): JobsApi {


  async function f_create_job(jobConfig: JobConfig): Promise<JobCreateResponse> {
    const {
      files,
    } = jobConfig;

    if (!files || files.length == 0) {
      throw new UhmbrellaSDKError({ name: "Invalid arguement", message: "No files received" });
    }
    const onProgress = jobConfig.options?.onProgress;
    const chunk_size = jobConfig.options?.chunk_size ?? chunkSize;
    const chunk_upload_timeout = jobConfig.options?.chunk_upload_timeout;

    const r_chunk_size = chunk_size > MAX_CHUNK_SIZE ? MAX_CHUNK_SIZE : chunk_size;

    const init = await http.post<{ job_id: string }>("/v1/jobs/init", {});

    if (!init.job_id) {
      throw new UhmbrellaSDKError({
        name: "ApiError",
        message: "jobs.init did not return job_id"
      });
    }

    const jobId = init.job_id;

    const totalBytes = f_getTotalBytes(files);
    let sentBytes = 0;

    onProgress?.(sentBytes, totalBytes);

    for (const { file, file_name } of files) {
      const totalChunks = Math.ceil(file.size / r_chunk_size);
      let index = 0;

      for (const chunk of f_chunkBlob(file, r_chunk_size)) {

        await http.post(`/v1/jobs/${jobId}/upload-chunk?` +
          new URLSearchParams(
            {
              filename: file_name ?? `audio ${index + 1}`,
              index: String(index),
              total: String(totalChunks)
            }
          ),
          { body: chunk },
          { timeout_ms: chunk_upload_timeout }
        );

        sentBytes += chunk.size;
        onProgress?.(sentBytes, totalBytes);

        index++;
      }
    }

    return http.post<JobCreateResponse>(`/v1/jobs/${jobId}/finalize`, {});
  }

  function f_job_status(jobId: string): Promise<JobStatusResponse> {
    return http.get<JobStatusResponse>(`/v1/jobs/${jobId}/status`, {});
  }

  function f_job_results(jobId: string): Promise<JobResultsResponse> {
    return http.get<JobResultsResponse>(`/v1/jobs/${jobId}/results`, {});
  }

  function f_cancel_job(jobId: string): Promise<JobCancelResponse> {

    return http.post<JobCancelResponse>(`/v1/jobs/${jobId}/cancel`, {});
  }

  async function f_create_job_safe(jobConfig: JobConfig) {

    const response = await f_create_job(jobConfig);
    f_assertJobCreateResponse(response);

    return response;
  }

  async function f_job_status_safe(jobId: string): Promise<JobStatusResponse> {
    const response = await http.get(`/v1/jobs/${jobId}/status`, {});
    f_assertJobStatusResponse(response);
    return response;
  }

  async function f_job_results_safe(jobId: string): Promise<JobResultsResponse> {

    const response = await http.get(`/v1/jobs/${jobId}/results`, {});
    f_assertJobResultResponse(response);
    return response;
  }


  return {
    create: f_create_job,
    createSafe: f_create_job_safe,

    status: f_job_status,
    statusSafe: f_job_status_safe,

    results: f_job_results,
    resultsSafe: f_job_results_safe,

    cancel: f_cancel_job
  };
}

