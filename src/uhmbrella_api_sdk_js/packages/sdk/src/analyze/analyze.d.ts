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
   * @param {Blob | File } file -  File size must not exceed {@link MAX_CHUNK_SIZE}
   * @param {AnalyzeOptions?} [options] - {@link AnalyzeOptions} 
   * @returns {(Promise<AnalyzeResult>)} Returns a Promise which resolves to either {@link AnalyzeResult}.
   * @throws {UhmbrellaSDKError} - Throws an {@link UhmbrellaSDKError} for request constraint violations, network failures.
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
   * @param {AnalyzeFileInput[]} files - Array<{@link AnalyzeFileInput}
   * - Maximum number of files: {@link MAX_SYNC_FILES}
   * - Combined payload size must not exceed {@link MAX_CHUNK_SIZE} 
   * @param {AnalyzeOptions?} [options] - {@link AnalyzeOptions} 
   * @returns {(Promise<AnalyzeResult>|Promise<AnalyzeBatchResponse>)} Returns a Promise which resolves to either {@link AnalyzeResult} for one file, or {@link AnalyzeBatchResponse} for multiple files.
   * @throws {UhmbrellaSDKError} - Throws an {@link UhmbrellaSDKError} for request constraint violations, network failures, or server contract mismatches.
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
   * - File size must not exceed {@link MAX_CHUNK_SIZE}
   * @param {AnalyzeOptions?} [options] - {@link AnalyzeOptions} 
   * @returns {(Promise<AnalyzeResult>)} Returns a Promise which resolves to either {@link AnalyzeResult}.
   * @throws {UhmbrellaAssertError} -  Throws an {@link UhmbrellaAssertError} if the response recieved is not {@link AnalyzeBatchResponse}.
   * @throws {UhmbrellaSDKError} - Throws an {@link UhmbrellaSDKError} for request constraint violations, network failures, or server contract mismatches.
   */
  (
    file: Blob | File,
    options?: AnalyzeOptions
  ): Promise<AnalyzeResult>;

  /**
   * Analyze multiple audio files in a single request.
   * @param {AnalyzeFileInput[]} files - Array<{@link AnalyzeFileInput}
   * - Maximum number of files: {@link MAX_SYNC_FILES}
   * - Combined payload size must not exceed {@link MAX_CHUNK_SIZE} 
   * @param {AnalyzeOptions?} [options] - {@link AnalyzeOptions} 
   * @returns {(Promise<AnalyzeResult>|Promise<AnalyzeBatchResponse>)} Returns a Promise which resolves to either {@link AnalyzeResult} for one file, or {@link AnalyzeBatchResponse} for multiple files.
   * @throws {UhmbrellaAssertError} -  Throws an {@link UhmbrellaAssertError} if the response recieved is not {@link AnalyzeBatchResponse}.
   * @throws {UhmbrellaSDKError} - Throws an {@link UhmbrellaSDKError} for request constraint violations, network failures, or server contract mismatches.
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
 * For larger workloads or chunked uploads, use {@link JobsApi}.
 */
export interface AnalyzeApi {
  /**
   * Analyze audio files.
   * For runtime validations and guaranteed AnalyzeResult, use {@link analyzeSafe}
   * @param {File | Blob | AnalyzeFileInput[]} arg1 - {@link File} or {@link Blob} or Array<{@link AnalyzeFileInput}>
   * @param {AnalyzeOptions?} [options] - {@link AnalyzeOptions} 
   * @returns {(Promise<AnalyzeResult>|Promise<AnalyzeBatchResponse>)} Returns a Promise which resolves to either {@link AnalyzeResult} for one file, or {@link AnalyzeBatchResponse} for multiple files.
   * @throws {UhmbrellaSDKError} - Throws an {@link UhmbrellaSDKError} for request constraint violations, network failures, or server contract mismatches.
   */
  analyze: AnalyzeFn;
  /**
   * Analyze audio files with strict runtime validation.
   * @param {File | Blob | AnalyzeFileInput[]} arg1 - {@link File} or {@link Blob} or Array<{@link AnalyzeFileInput}>
   * @param {AnalyzeOptions?} [options] - {@link AnalyzeOptions} 
   * @returns {(Promise<AnalyzeResult>|Promise<AnalyzeBatchResponse>)} Returns a Promise which resolves to either {@link AnalyzeResult} for one file, or {@link AnalyzeBatchResponse} for multiple files.
   * @throws {UhmbrellaAssertError} -  Throws an {@link UhmbrellaAssertError} if the response recieved is not {@link AnalyzeBatchResponse}.
   * @throws {UhmbrellaSDKError} - Throws an {@link UhmbrellaSDKError} for request constraint violations, network failures, or server contract mismatches.
   */
  analyzeSafe: AnalyzeSafeFn;
}
