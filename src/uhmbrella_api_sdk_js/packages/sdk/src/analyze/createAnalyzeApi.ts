import { assertAnalyzeResult } from "../asserts";
import { MAX_CHUNK_SIZE, MAX_SYNC_FILES } from "../constants";
import { UhmbrellaSDKError } from "../error";
import { HttpClient } from "../http/createHttpClient";
import { AnalyzeFileInput, AnalyzeOptions, AnalyzeBatchResponse, AnalyzeResult } from "../types/";
import { f_getTotalBytes } from "../utils";
import { f_resolveAnalyzeBatchResponse } from "./analyze.assert";

const createAnalyzeApi = (httpClient: HttpClient) => {

  /**
 * @returns AnalyzeResponse 
 * */
  function f_analyze_File(file: Blob | File, options?: AnalyzeOptions): Promise<AnalyzeResult> {
    if (f_getTotalBytes([{ file }]) > MAX_CHUNK_SIZE) {
      throw new UhmbrellaSDKError({ name: "Max size exeeded", message: `file ${options?.file_name ?? ''} is bigger than the ${(MAX_CHUNK_SIZE / 1024) / 1024} MB limit. Use jobs.create .` });
    }
    const form = new FormData();

    form.append("file", file, options?.file_name);

    return httpClient.post<AnalyzeResult>("/v1/analyze", {
      body: form
    },
      { timeout_ms: options?.timeout_ms }
    );
  }

  function f_analyze_Batch(files: Array<{ file: Blob | File; file_name?: string }>, options?: AnalyzeOptions): Promise<AnalyzeBatchResponse> {

    if (files.length > MAX_SYNC_FILES) {
      throw new UhmbrellaSDKError({ name: "Invalid params", message: `Number of audio files exeeded ${MAX_SYNC_FILES}, use jobs.create .` });
    } else if (f_getTotalBytes(files) > MAX_CHUNK_SIZE) {
      throw new UhmbrellaSDKError({ name: "Max size exeeded", message: `The total size ${f_getTotalBytes(files)} Bytes for all the files is more than the ${MAX_CHUNK_SIZE} Bytes limit. Use jobs.create to send data in chunks.` })
    }
    const form = new FormData();

    for (const { file, file_name } of files) {
      form.append("files", file, file_name);
    }

    return httpClient.post<AnalyzeBatchResponse>("/v1/analyze-batch", {
      body: form
    },
      { timeout_ms: options?.timeout_ms }
    );
  }


  function f_analyze(file: Blob | File, options?: AnalyzeOptions): Promise<AnalyzeResult>;

  function f_analyze(files: AnalyzeFileInput[], options?: AnalyzeOptions): Promise<AnalyzeBatchResponse>;

  function f_analyze(arg1: Blob | File | AnalyzeFileInput[], options: AnalyzeOptions = {}): Promise<AnalyzeBatchResponse | AnalyzeResult> {

    if (Array.isArray(arg1)) {
      return f_analyze_Batch(arg1, options);
    }

    return f_analyze_File(arg1, options);
  }

  async function f_analyzeSafe(file: Blob | File, options?: AnalyzeOptions): Promise<AnalyzeResult>;
  async function f_analyzeSafe(files: AnalyzeFileInput[], options?: AnalyzeOptions): Promise<AnalyzeBatchResponse>;
  async function f_analyzeSafe(arg1: Blob | File | AnalyzeFileInput[], options?: AnalyzeOptions): Promise<AnalyzeBatchResponse | AnalyzeResult> {
    const expectBatch = Array.isArray(arg1);

    const res = expectBatch
      ? arg1.length === 1
        ? await f_analyze_File(arg1[0]!.file, { file_name: arg1[0]!.file_name, ...options })
        : await f_analyze_Batch(arg1, { timeout_ms: options?.timeout_ms })
      : await f_analyze_File(arg1, options);

    if (expectBatch && arg1.length > 1) {
      if (!f_isAnalyzeBatchResponse(res)) {
        throw new UhmbrellaSDKError({
          name: "ValidationError",
          message: "Expected batch response but got single result - server contract violation"
        });
      }

      f_resolveAnalyzeBatchResponse(res);
      return res;

    } else {

      if (!f_isAnalyzeResult(res)) {
        throw new UhmbrellaSDKError({
          name: "ValidationError",
          message: "Expected single result but got batch response - server contract violation"
        });
      }

      assertAnalyzeResult(res);
      return res;
    }
  }

  return {
    analyze: f_analyze,
    analyzeSafe: f_analyzeSafe
  };
}

export { createAnalyzeApi };

//type guards
function f_isAnalyzeBatchResponse(value: unknown): value is AnalyzeBatchResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "results" in value &&
    Array.isArray((value as any).results) &&
    "total_files" in value
  );
}

function f_isAnalyzeResult(value: unknown): value is AnalyzeResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "filename" in value &&
    "percentages" in value &&
    ("segments" in value || "segmentsVox" in value)
  );
}

