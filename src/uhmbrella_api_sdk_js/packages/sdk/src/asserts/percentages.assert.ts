import { MUSIC_CLASSES } from "../constants";
import { Percentages } from "../types/analyze";
import { assertObject, assertNumber, assertMusicClass } from "./assert-helpers";

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
