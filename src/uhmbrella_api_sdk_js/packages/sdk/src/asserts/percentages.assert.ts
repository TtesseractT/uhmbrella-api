import { MUSIC_CLASSES } from "../shared/constants"
import { Percentages } from "../shared/types.d";
import { assertObject, assertNumber, assertMusicClass, assertFloatRange } from "./assert-helpers";

export function assertPercentagesStrict(value: unknown, name: string): asserts value is Percentages {

  assertObject(value, name);

  for (const key of MUSIC_CLASSES) {
    const v = value[key];

    assertNumber(v, `${name}.${key}`);

    assertFloatRange(v, `${name}.${key}`, 0, 100);

  }

  for (const key of Object.keys(value)) {
    assertMusicClass(key, `${name}.${key}`);
  }
}

export function assertPercentages(value: unknown, name: string): asserts value is Percentages {

  assertObject(value, name);

  for (const key of MUSIC_CLASSES) {
    const v = value[key];

    assertNumber(v, `${name}.${key}`);
    assertFloatRange(v, `${name}.${key}`, 0, 100);

  }
}
