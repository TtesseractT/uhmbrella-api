import { describe, expect, it } from "vitest";
import { assertAnalyzeResult, assertAnalyzeResults } from "../results.assert";


describe("assertAnalyzeResult", () => {

  it("reject non object", () => {
    expect(() => assertAnalyzeResult("string", "assertTest")).toThrow();
  });
  it("reject empty object", () => {
    expect(() => assertAnalyzeResult({}, "assertTest")).toThrow();
  });

  it("reject incomplete object", () => {
    expect(() => assertAnalyzeResult({ filename: "audio.mp3" }, "assertTest")).toThrow();
  });

});

describe("assertAnalyzeResults", () => {

  it("reject non Array type", () => {
    expect(() => assertAnalyzeResults({}, "assertTest")).toThrow();
  });
  it("accept empty array", () => {
    expect(() => assertAnalyzeResults([], "assertTest")).not.toThrow();
  });

})
