import { MUSIC_CLASSES } from "../constants";
import { MusicClass, } from "../types/analyze";
import { UhmbrellaAssertError } from "./error";


export function assertObject(value: unknown, name: string = "object", message = "Expected object"): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    throw new UhmbrellaAssertError({ value, body: message, key: name, expected_type: "object", recieved_type: typeof value });
  }
}

export function assertNumber(value: unknown, name: string): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new UhmbrellaAssertError({ value, body: `Expected ${name} to be a number, got ${value}`, key: name, expected_type: "number", recieved_type: typeof value });
  }
}

export function assertString(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string") {
    throw new UhmbrellaAssertError({ value, body: `Expected ${name} to be a string, got ${value}`, key: name, expected_type: "string", recieved_type: typeof value });
  }
}

export function assertArray<T>(value: unknown, name: string): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new UhmbrellaAssertError({ value, body: `Expected ${name} to be an array, got ${value}`, key: name, expected_type: typeof Array<T>, recieved_type: typeof value });
  }
}
export function assertOneOf<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  name: string
): asserts value is T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new UhmbrellaAssertError({ value, body: `Expected ${name} to be one of: ${allowed.join(", ")}`, key: name, expected_type: typeof allowed, recieved_type: typeof value })
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
      throw new UhmbrellaAssertError({ value: array, body: `Expected ${name} to be one of: ${allowed.join(", ")}`, key: name, expected_type: allowed.join(' | '), recieved_type: typeof array })
    }

  }
}

export function assertMusicClass(value: unknown, name: string): asserts value is MusicClass {

  assertOneOf(value, MUSIC_CLASSES, name);
}



export function assertFloatRange(
  value: unknown,
  name: string,
  min: number = 0,
  max: number = 1
): asserts value is number {
  assertNumber(value, name);

  if (value > max || value < min) {
    throw new UhmbrellaAssertError({ value, body: `Expected ${name} to be a floating-point number in range of ${min} and ${max}, got ${value}`, key: name, expected_type: 'number', recieved_type: typeof value, min_value: min, max_value: max });
  }


}


