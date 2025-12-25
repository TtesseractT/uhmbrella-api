import { assertObject, assertNumber, assertArray, assertString, assertUsageInfo, assertPercentages, assertSegments, assertAnalyzeResults } from "../assert-helpers";
import { AnalyzeResponse } from "../types";

export function f_resolveAnalyzeResponse(response: unknown): asserts response is AnalyzeResponse {

  assertObject(response, "AnalyzeResponse");

  assertNumber(response.total_files, "total_files");
  assertNumber(response.total_audio_seconds, "total_audio_seconds");
  assertNumber(response.total_billed_seconds, "total_billed_seconds");

  assertAnalyzeResults(response.results, "results");

  assertObject(response.usage, "usage");
  assertUsageInfo(response.usage);


}
