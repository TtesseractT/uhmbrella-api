import { assertObject, assertNumber, assertUsageInfo, assertAnalyzeResults } from "../asserts";
import { AnalyzeBatchResponse } from ".";

export function f_resolveAnalyzeBatchResponse(response: unknown): asserts response is AnalyzeBatchResponse {

  assertObject(response, "AnalyzeResponse");

  assertNumber(response.total_files, "total_files");
  assertNumber(response.total_audio_seconds, "total_audio_seconds");
  assertNumber(response.total_billed_seconds, "total_billed_seconds");

  assertAnalyzeResults(response.results, "results");

  assertObject(response.usage, "usage");
  assertUsageInfo(response.usage);


}
