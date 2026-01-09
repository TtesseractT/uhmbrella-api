import { type RequestOptions, type UsageInfo, type AnalyzeResult, J_STATUS } from "../shared";
import { UhmbrellaAssertError } from "../asserts";


export type JobProgressCallback = (sent: number, total: number) => void;
export type JobStatus = typeof J_STATUS[number];
export type JobConfig = {
  files: Array<{
    file: Blob | File;
    file_name?: string;
  }>;

  options?: JobOptions;
};

export type JobOptions = {

  /**
   * invoked when the job is created and after every chunk upload.
   */
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

export interface JobsApi {
  /**
   * @function createSafe - creates a job with the set params.
   * @param {JobConfig} jobConfig - The job config options JobConfig.
   * @returns {Promise<JobCreateResponse>} Returns a Promise which resolves to JobCreateResponse.
   */
  create(jobConfig: JobConfig): Promise<JobCreateResponse>;
  /**
   * @function createSafe - creates a job with the set params.
   * @param {JobConfig} jobConfig - The job config options JobConfig.
   * @returns {Promise<JobCreateResponse>} Returns a Promise which resolves to JobCreateResponse.
   * @throws An UhmbrellaAssertError - When the response json body is not type of JobCreateResponse.
   * @throws An UhmbrellaSDKError - For invalid arguements or errors when creating the job.
   */
  createSafe(jobConfig: JobConfig): Promise<JobCreateResponse>;


  /**
    * @function status - fetch the status of a job
    * @param {string} jobId
    * @returns {Promise<JobStatusResponse>} - possible values of status : JobStatus.
    */
  status(jobId: string): Promise<JobStatusResponse>;
  /**
    * @function statusSafe - fetch the status of a job with assertions on the response body.
    * @param {string} jobId
    * @returns {Promise<JobStatusResponse>} - returns a promise which resolves to a JobStatusResponse. Possible values of status : JobStatus.
    * @throws {UhmbrellaAssertError} - Throws an UhmbrellaAssertError if the returned response body is not in the format of JobStatusResponse.
    */
  statusSafe(jobId: string): Promise<JobStatusResponse>;


  /**
   * @function results - fetch the results of a job.
   * @param {string} jobId
   * @returns {Promise<JobResultsResponse>} - returns a JobResultsResponse containing a results array, each element is an object with filename, status, error key value pairs and a result property which is AnalyzeResult 
   */
  results(jobId: string): Promise<JobResultsResponse>;
  /**
 * @function resultsSafe - fetch the results of a job with assertions on the response body.
 * @param {string} jobId
 * @returns {Promise<JobResultsResponse>} - returns a promise which resolves to a JobResultsResponse containing a results array, each element is an object with filename, status, error key value pairs and a result property which is AnalyzeResult
 * @throws {UhmbrellaAssertError} - Throws an UhmbrellaAssertError if the returned response body is not in the format of JobResultsResponse.
 */
  resultsSafe(jobId: string): Promise<JobResultsResponse>;


  /**
   * @function cancel - cancels a job if the job associated with the jobId is still queued or processing.
   * @param {string} jobId
   * @returns {Promise<JobCancelResponse>} - returns a promise which resolves to a JobCancelResponse
   */
  cancel(jobId: string): Promise<JobCancelResponse>;
}

