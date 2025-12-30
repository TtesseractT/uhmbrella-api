import { describe, it, expect } from "vitest";
import { assertPercentages, assertPercentagesStrict } from "..";

describe("assertPercentagesStrict", () => {
  it("accepts valid percentages", () => {
    const value = {
      real: 10,
      suno: 20,
      udio: 30,
      riff: 10,
      realVox: 5,
      sunoVox: 5,
      udioVox: 10,
      riffVox: 10
    };

    expect(() => assertPercentagesStrict(value, "test")).not.toThrow();
  });

  it("rejects missing keys", () => {
    const value = {
      real: 10
    };

    expect(() => assertPercentagesStrict(value, "test")).toThrow();
  });

  it("rejects extra keys", () => {
    const value = {
      real: 10,
      suno: 20,
      udio: 30,
      riff: 10,
      realVox: 5,
      sunoVox: 5,
      udioVox: 10,
      riffVox: 10,

      extra: 50,
    };

    expect(() => assertPercentagesStrict(value, "test")).toThrow();
  });

  it("rejects out-of-range values", () => {
    const value = {
      real: 200,
      suno: 0,
      udio: 0,
      riff: 0,
      realVox: 0,
      sunoVox: 0,
      udioVox: 0,
      riffVox: 0
    };

    expect(() => assertPercentagesStrict(value, "test")).toThrow();
  });
});

describe("assertPercentages", () => {
  it("accepts valid percentages", () => {
    const value = {
      real: 10,
      suno: 20,
      udio: 30,
      riff: 10,
      realVox: 5,
      sunoVox: 5,
      udioVox: 10,
      riffVox: 10
    };

    expect(() => assertPercentages(value, "test")).not.toThrow();
  });

  it("rejects missing keys", () => {
    const value = {
      real: 10
    };

    expect(() => assertPercentages(value, "test")).toThrow();
  });

  it("accepts extra keys", () => {
    const value = {
      real: 10,
      suno: 20,
      udio: 30,
      riff: 10,
      realVox: 5,
      sunoVox: 5,
      udioVox: 10,
      riffVox: 10,

      extra: 50,
    };

    expect(() => assertPercentages(value, "test")).not.toThrow();
  });

  it("rejects out-of-range values", () => {
    const value = {
      real: 200,
      suno: 0,
      udio: 0,
      riff: 0,
      realVox: 0,
      sunoVox: 0,
      udioVox: 0,
      riffVox: 0
    };

    expect(() => assertPercentages(value, "test")).toThrow();
  });
});

