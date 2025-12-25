import { PLAN_NAMES, MUSIC_CLASSES } from "./constants";
import { UsageInfo } from "./types";
import { AnalyzeResult, MusicClass, Percentages, Segment } from "./types/analyze";

export function assertObject(value: unknown, message = "Expected object"): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    throw new Error(message);
  }
}

export function assertNumber(value: unknown, name: string): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Expected ${name} to be a number`);
  }
}

export function assertString(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Expected ${name} to be a string`);
  }
}

export function assertArray<T>(value: unknown, name: string): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${name} to be an array`);
  }
}
export function assertOneOf<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  name: string
): asserts value is T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new Error(
      `Expected ${name} to be one of: ${allowed.join(", ")}`
    );
  }
}
export function assertArrayOneOf<K, T extends readonly string[]>(
  array: unknown,
  allowed: T,
  name: string
): asserts array is Array<T[number]> {
  assertArray<K>(array, name);

  for (const element of array) {
    if (typeof element !== "string" || !allowed.includes(element)) {
      throw new Error(
        `Expected ${name} to be one of: ${allowed.join(", ")}`
      );
    }

  }
}
export function assertUsageInfo(value: unknown): asserts value is UsageInfo {
  assertObject(value, "UsageInfo");

  assertString(value.user_id, "usage.user_id");
  assertOneOf(value.plan_name, PLAN_NAMES, "usage.plan_name");

  assertNumber(value.quota_seconds, "usage.quota_seconds");
  assertNumber(value.used_seconds, "usage.used_seconds");
  assertNumber(value.remaining_seconds, "usage.remaining_seconds");
}

export function assertMusicClass(value: unknown, name: string): asserts value is MusicClass {

  assertOneOf(value, MUSIC_CLASSES, name);
}

export function assertPercentagesStrict(value: unknown, name: string): asserts value is Percentages {

  assertObject(value, name);

  for (const key of MUSIC_CLASSES) {
    const v = value[key];

    assertNumber(v, `${name}.${key}`);

    if (v < 0 || v > 100) {
      throw new Error(`Expected ${name}.${key} to be between 0 and 100`);
    }
  }

  for (const key of Object.keys(value)) {
    assertMusicClass(key, `${name}.${key}`);
  }
}

export function assertPercentages(value: unknown, name: string): asserts value is Percentages {

  assertObject(value, name);

  for (const key of MUSIC_CLASSES) {
    assertNumber(value[key], `${name}.${key}`);

    if (value[key] < 0 || value[key] > 100) {
      throw new Error(`Expected ${name}.${key} to be between 0 and 100`);
    }

  }
}

export function assertSegment(object: unknown, name: string = 'segment'): asserts object is Segment {
  assertObject(object);
  assertMusicClass(object.class, name);
  assertNumber(object.start, `${name}.start`);
  assertNumber(object.end, `${name}.end`);


  if (object.start > object.end) {
    throw Error(`start time is greater than end time`);
  }

  assertFloatRange(object.confidence, `${name}.confidence`);
}

export function assertSegments(array: unknown, name: "result.segments" | "result.segmentsVox"): asserts array is Segment {

  assertArray(array, name);
  let idx = 0;
  for (const element of array) {
    assertSegment(element, `${name}[${idx}]`);
    idx++;
  }
}
export function assertFiniteNumber(value: unknown, name: string): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Expected ${name} to be a finite number`);
  }
}

export function assertFloatRange(
  value: unknown,
  name: string,
  min: number = 0,
  max: number = 1
): asserts value is number {
  assertFiniteNumber(value, name);

  if (Number.isInteger(value)) {
    if (value != min || value != max) {
      throw new Error(`Expected ${name} to be a floating-point number`);
    }
  }

}
export function assertAnalyzeResult(object: unknown, name: string = "result"): asserts object is AnalyzeResult {

  assertObject(object, "AnalyzeResult");

  assertString(object.filename, "result.filename");
  assertString(object.analysis_timestamp, "result.analysis_timestamp");
  assertFiniteNumber(object.time_actual, "result.time_actual");

  assertPercentages(object.percentages, "percentages");

  assertSegments(object.segments, "result.segments");
  assertSegments(object.segmentsVox, "result.segmentsVox");

  assertString(object.uhm_filename, "result.uhm_filename");
  assertNumber(object.audio_seconds, "result.audio_seconds");
  assertNumber(object.billed_seconds, "result.billed_seconds");

}

export function assertAnalyzeResults(array: unknown, name: string = "results"): asserts array is AnalyzeResult[] {

  assertArray(array, name);
  let idx = 0;
  for (const element of array) {
    assertAnalyzeResult(element, `${name}[${idx}]`);
    idx++;
  }

}

