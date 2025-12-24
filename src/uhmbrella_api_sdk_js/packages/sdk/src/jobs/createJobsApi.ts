import { DEFAULT_CHUNK_SIZE } from "../constants";
import type { HttpClient } from "../http/createHttpClient";
import { CreateJobInput, JobCancelResponse, JobCreateResponse, JobResultsResponse, JobStatusResponse } from "../types";

export function create_Jobs_Api(http: HttpClient, chunkSize: number = DEFAULT_CHUNK_SIZE) {


  function f_get_Total_Bytes(files: Array<{ file: Blob }>): number {
    return files.reduce((sum, f) => sum + f.file.size, 0);
  }

  function* f_chunk_Blob(blob: Blob, cS: number) {
    let offset = 0;
    while (offset < blob.size) {
      const end = Math.min(offset + cS, blob.size);
      yield blob.slice(offset, end);
      offset = end;
    }
  }
  async function f_create_job(jobInput: CreateJobInput): Promise<JobCreateResponse> {
    const {
      files,
      onProgress,
      chunk_size = chunkSize
    } = jobInput;

    const init = await http.post<{ job_id: string }>("/v1/jobs/init", {});
    const jobId = init.job_id;

    const totalBytes = f_get_Total_Bytes(files);
    let sentBytes = 0;

    onProgress?.(sentBytes, totalBytes);

    for (const { file, file_name } of files) {
      const totalChunks = Math.ceil(file.size / chunk_size);
      let index = 0;

      for (const chunk of f_chunk_Blob(file, chunk_size)) {
        await http.post(
          `/v1/jobs/${jobId}/upload-chunk?` +
          new URLSearchParams({
            filename: file_name ?? `audio ${index + 1}`,
            index: String(index),
            total: String(totalChunks)
          }),
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

