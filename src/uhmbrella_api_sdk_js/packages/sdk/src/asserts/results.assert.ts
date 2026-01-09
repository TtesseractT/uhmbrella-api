import { type AnalyzeResult } from "../shared";
import { assertObject, assertString, assertNumber, assertArray } from "./assert-helpers";
import { assertPercentages } from "./percentages.assert";
import { assertSegments } from "./segments.assert";

export function assertAnalyzeResult(object: unknown, name: string = "result"): asserts object is AnalyzeResult {

  assertObject(object, `${name}`);

  assertString(object.filename, `${name}.filename`);
  assertString(object.analysis_timestamp, `${name}.analysis_timestamp`);
  assertNumber(object.time_actual, `${name}.time_actual`);

  assertPercentages(object.percentages, `${name}.percentages`);

  assertSegments(object.segments, `${name}.segments`);
  assertSegments(object.segmentsVox, `${name}.segmentsVox`);

  assertString(object.uhm_filename, `${name}.uhm_filename`);
  assertNumber(object.audio_seconds, `${name}.audio_seconds`);
  assertNumber(object.billed_seconds, `${name}.billed_seconds`);

}

export function assertAnalyzeResults(array: unknown, name: string = "results"): asserts array is AnalyzeResult[] {

  assertArray(array, name);
  let idx = 0;
  for (const element of array) {
    assertAnalyzeResult(element, `${name}[${idx}]`);
    idx++;
  }

}
