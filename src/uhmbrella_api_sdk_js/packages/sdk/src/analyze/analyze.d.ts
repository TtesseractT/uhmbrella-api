import { type UsageInfo, type RequestOptions, MUSIC_CLASSES } from "../shared";


export type AnalyzeBatchResponse = {
  total_files: number;
  total_audio_seconds: number;
  total_billed_seconds: number;
  results: AnalyzeResult[];
  usage: UsageInfo;
};

export type AnalyzeFileInput = {
  file: Blob | File;
  file_name?: string;
};

export type AnalyzeOptions = RequestOptions & {
  file_name?: string;
};

export interface AnalyzeFn {
  /**
    * Analyze a single audio file.
   * @param {Blob | File } file -  File size must not exceed  MAX_CHUNK_SIZE
   * @param {AnalyzeOptions?} [options] - AnalyzeOptions
   * @returns {(Promise<AnalyzeResult>)} Returns a Promise which resolves to AnalyzeResult
   * @throws {UhmbrellaSDKError} - Throws an UhmbrellaSDKError for request constraint violations, network failures.
   * @example
   * ```ts
    * const result = await clienti.analyze.analyze(file);
    * console.log(result.percentages);
    * ```
  */
  (
    file: Blob | File,
    options?: AnalyzeOptions
  ): Promise<AnalyzeResult>;

  /**
   * Analyze multiple audio files in a single request.
   * @param {AnalyzeFileInput[]} files - Array<AnalyzeFileInput>
   * - Maximum number of files: MAX_SYNC_FILES
   * - Combined payload size must not exceed MAX_CHUNK_SIZE
   * @param {AnalyzeOptions?} [options] - AnalyzeOptions
   * @returns {(Promise<AnalyzeResult>|Promise<AnalyzeBatchResponse>)} Returns a Promise which resolves to either AnalyzeResult for one file, or AnalyzeBatchResponse for multiple files.
   * @throws {UhmbrellaSDKError} - Throws an UhmbrellaSDKError for request constraint violations, network failures, or server contract mismatches.
    * @example
  * ```ts
    * const batch = await client.analyze([
    *   { file: kick, file_name: "kick.wav" },
    *   { file: snare, file_name: "snare.wav" }
    * ]);
    * ```
  */
  (
    files: AnalyzeFileInput[],
    options?: AnalyzeOptions
  ): Promise<AnalyzeBatchResponse | AnalyzeResult>;

}

export interface AnalyzeSafeFn {

  /**
   * Analyze a single audio file.
   * @param {Blob | File } file 
   * - File size must not exceed MAX_CHUNK_SIZE
   * @param {AnalyzeOptions?} [options] - AnalyzeOptions
   * @returns {(Promise<AnalyzeResult>)} Returns a Promise which resolves to either AnalyzeResult.
   * @throws {UhmbrellaAssertError} -  Throws an UhmbrellaAssertError if the response recieved is not AnalyzeBatchResponse.
   * @throws {UhmbrellaSDKError} - Throws an UhmbrellaSDKError for request constraint violations, network failures, or server contract mismatches.
   */
  (
    file: Blob | File,
    options?: AnalyzeOptions
  ): Promise<AnalyzeResult>;

  /**
   * Analyze multiple audio files in a single request.
   * @param {AnalyzeFileInput[]} files - Array<AnalyzeFileInput>
   * - Maximum number of files: MAX_SYNC_FILES
   * - Combined payload size must not exceed MAX_CHUNK_SIZE 
   * @param {AnalyzeOptions?} [options] - AnalyzeOptions 
   * @returns {(Promise<AnalyzeResult>|Promise<AnalyzeBatchResponse>)} Returns a Promise which resolves to either AnalyzeResult for one file, or AnalyzeBatchResponse for multiple files.
   * @throws {UhmbrellaAssertError} -  Throws an UhmbrellaAssertError if the response recieved is not AnalyzeBatchResponse.
   * @throws {UhmbrellaSDKError} - Throws an UhmbrellaSDKError for request constraint violations, network failures, or server contract mismatches.
   */
  (
    files: AnalyzeFileInput[],
    options?: AnalyzeOptions
  ): Promise<AnalyzeBatchResponse | AnalyzeResult>;
}

/**
 * Synchronous audio analysis API.
 *
 * Provides audio analysis for small payloads.
 * For larger workloads or chunked uploads, use JobsApi.
 */
export interface AnalyzeApi {
  /**
   * Analyze audio files.
   * For runtime validations and guaranteed AnalyzeResult, use  analyzeSafe
   * @param {File | Blob | AnalyzeFileInput[]} arg1 - File or Blob or Array<AnalyzeFileInput>
   * @param {AnalyzeOptions?} [options] - AnalyzeOptions 
   * @returns {(Promise<AnalyzeResult>|Promise<AnalyzeBatchResponse>)} Returns a Promise which resolves to either AnalyzeResult for one file, or AnalyzeBatchResponse for multiple files.
   * @throws {UhmbrellaSDKError} - Throws an UhmbrellaSDKError for request constraint violations, network failures, or server contract mismatches.
   */
  analyze: AnalyzeFn;
  /**
   * Analyze audio files with strict runtime validation.
   * @param {File | Blob | AnalyzeFileInput[]} arg1 - File or Blob or Array<AnalyzeFileInput>
   * @param {AnalyzeOptions?} [options] - AnalyzeOptions 
   * @returns {(Promise<AnalyzeResult>|Promise<AnalyzeBatchResponse>)} Returns a Promise which resolves to either AnalyzeResult for one file, or AnalyzeBatchResponse for multiple files.
   * @throws {UhmbrellaAssertError} -  Throws an UhmbrellaAssertError if the response recieved is not AnalyzeBatchResponse.
   * @throws {UhmbrellaSDKError} - Throws an UhmbrellaSDKError for request constraint violations, network failures, or server contract mismatches.
   */
  analyzeSafe: AnalyzeSafeFn;
}
