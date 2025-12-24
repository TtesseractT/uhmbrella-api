import { DEFAULT_CHUNK_SIZE, MAX_CHUNK_SIZE } from "../constants";
import type { HttpClient } from "../http/createHttpClient";
import { CreateJobInput, JobCancelResponse, JobCreateResponse, JobResultsResponse, JobStatusResponse } from "../types";
import { f_get_Total_Bytes, f_chunk_Blob } from "../utils";

export function create_Jobs_Api(http: HttpClient, chunkSize: number = DEFAULT_CHUNK_SIZE) {


  async function f_create_job(jobInput: CreateJobInput): Promise<JobCreateResponse> {
    const {
      files,
      onProgress,
      chunk_size = chunkSize
    } = jobInput;


    const r_chunk_size = chunk_size > MAX_CHUNK_SIZE ? MAX_CHUNK_SIZE : chunk_size;

    const init = await http.post<{ job_id: string }>("/v1/jobs/init", {});
    const jobId = init.job_id;

    const totalBytes = f_get_Total_Bytes(files);
    let sentBytes = 0;

    onProgress?.(sentBytes, totalBytes);

    for (const { file, file_name } of files) {
      const totalChunks = Math.ceil(file.size / r_chunk_size);
      let index = 0;

      for (const chunk of f_chunk_Blob(file, r_chunk_size)) {

        await http.post(`/v1/jobs/${jobId}/upload-chunk?` +
          new URLSearchParams(
            {
              filename: file_name ?? `audio ${index + 1}`,
              index: String(index),
              total: String(totalChunks)
            }
          ),
          { body: chunk }
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
  return {
    create: f_create_job,
    status: f_job_status,
    results: f_job_results,
    cancel: f_cancel_job
  };
}

