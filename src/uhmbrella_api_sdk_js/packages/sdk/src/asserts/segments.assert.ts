import { Segment } from "../types/analyze";
import { assertObject, assertMusicClass, assertNumber, assertFloatRange, assertArray } from "./assert-helpers";

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

export function assertSegments(array: unknown, name: string): asserts array is Segment[] {

  assertArray(array, name);
  let idx = 0;
  for (const element of array) {
    assertSegment(element, `${name}[${idx}]`);
    idx++;
  }
}

