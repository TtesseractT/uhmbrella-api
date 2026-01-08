import { describe, expect, it } from "vitest";
import { assertSegment, assertSegments } from "../segments.assert";
import { MUSIC_CLASSES } from "../../shared/constants";


describe("assertSegment", () => {

  it("reject non object", () => {
    const value = "{}";
    expect(() => assertSegment(value, "assertSegment")).toThrow();

  })
  it("reject unknown music class", () => {
    const value = {
      class: "fake",
      start: 0,
      end: 100,
      confidence: 0.50,
    };
    expect(() => assertSegment(value), "assertSegment").toThrow();
  })

  it("reject confidence greater than 1", () => {
    const value = {
      class: MUSIC_CLASSES[0],
      start: 0,
      end: 100,
      confidence: 1.5,
    };
    expect(() => assertSegment(value), "assertSegment").toThrow();
  });

  it("reject confidence less than 0", () => {
    const value = {
      class: MUSIC_CLASSES[0],
      start: 0,
      end: 100,
      confidence: -0.5,
    };
    expect(() => assertSegment(value), "assertSegment").toThrow();
  });

  it("accept confidence equal to 1", () => {
    const value = {
      class: MUSIC_CLASSES[0],
      start: 0,
      end: 100,
      confidence: 1,
    };
    expect(() => assertSegment(value), "assertSegment").not.toThrow();
  });

  it("accept confidence equal to 0", () => {
    const value = {
      class: MUSIC_CLASSES[0],
      start: 0,
      end: 100,
      confidence: 0,
    };
    expect(() => assertSegment(value), "assertSegment").not.toThrow();
  });

  it("accept confidence in range", () => {
    const value = {
      class: MUSIC_CLASSES[0],
      start: 0,
      end: 100,
      confidence: 0.5,
    };
    expect(() => assertSegment(value), "assertSegment").not.toThrow();
  });

  it("reject start time greater than end time", () => {
    const value = {
      class: MUSIC_CLASSES[0],
      start: 200,
      end: 100,
      confidence: -0.5,
    };
    expect(() => assertSegment(value), "assertSegment").toThrow();
  });

});

describe("assertSegments", () => {

  it("reject non array", () => {
    const value = "string";
    expect(() => assertSegments(value, "assertSegments")).toThrow();
  });
  it("accept empty array", () => {
    const value: unknown = [];
    expect(() => assertSegments(value, "assertSegments")).not.toThrow();
  });


})
