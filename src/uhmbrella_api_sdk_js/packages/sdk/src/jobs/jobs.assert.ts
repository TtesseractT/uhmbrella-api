import { assertAnalyzeResult, assertArray, assertNumber, assertObject, assertOneOf, assertString } from "../asserts";
import { AnalyzeResult } from "../shared";
import { J_STATUS } from "../shared/constants";
import { JobCreateResponse, JobResultsResponse, JobStatusResponse, JobStatus } from ".";

export function f_assertJobCreateResponse(response: unknown): asserts response is JobCreateResponse {

  assertObject(response);
  assertString(response.job_id, "job_id");
  assertOneOf(response.status, J_STATUS, "status");
  assertNumber(response.total_files, "total_files");
  assertNumber(response.total_billed_seconds, "total_billed_seconds");
  assertNumber(response.remaining_seconds_before, "remaining_seconds_before");

}

export function f_assertJobStatusResponse(response: unknown): asserts response is JobStatusResponse {

  assertObject(response);
  assertObject(response.counts);
  assertString(response.job_id, 'job_id');
  assertNumber(response.total_files, "total_files");
  assertOneOf(response.status, J_STATUS, "status");

  assertObject(response.counts);

  for (const key of Object.keys(response.counts)) {
    assertOneOf(key, J_STATUS, "counts key");
    assertNumber(
      (response.counts as Record<string, unknown>)[key],
      `counts.${key}`
    );
  }

  assertNumber(response.progress, "progress");

}

export function f_assertJobResultResponse(response: unknown): asserts response is JobResultsResponse {

  assertObject(response);

  assertString(response.job_id, 'job_id');
  assertOneOf(response.status, J_STATUS, "status");
  assertArray(response.results, "results");

  let idx = 0;
  for (const element of response.results) {
    f_assertJobResultsObject(element, `results[${idx}]`);
    idx++;
  }

}

function f_assertJobResultsObject(object: unknown, name: string): asserts object is { filename: string, status: JobStatus, error?: string, result?: AnalyzeResult } {

  assertObject(object, name);
  assertString(object.filename, `${name}.filename`);
  assertOneOf(object.status, J_STATUS, `${name}.status`);
  if (object.status == J_STATUS[4]) {
    assertString(object.error, `${name}.error`);
  }
  if (object.status == J_STATUS[3]) {
    assertAnalyzeResult(object.result, `${name}.result`);
  }
}
