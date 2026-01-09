import { describe, expect, expectTypeOf, it } from "vitest";
import { createUhmbrellaClient } from "../client/createClient";
import { tests } from "../tests";
import { AnalyzeResult } from "../shared";

describe("Analyze tests", () => {

  const validAnalyzeResponseFetch = tests.createPOSTJSONResponseFetch({
    filename: "test2.mp3",
    analysis_timestamp: "123123_23124",
    time_actual: 136,

    percentages: {
      real: 72.73412942886353,
      suno: 0.008230778621509671,
      udio: 27.251505851745605,
      riff: 0.006138449680292979,
      realVox: 45.57723104953766,
      sunoVox: 0,
      udioVox: 21.109232306480408,
      riffVox: 0
    },
    segments: [
      {
        start: 0,
        end: 132,
        class: "real",
        confidence: 0.902794326765415
      }
    ],
    segmentsVox: [
      {
        start: 0,
        end: 132,
        class: "realVox",
        confidence: 0.9591072784889397
      }
    ],
    uhm_filename: "test2.mp3",
    audio_seconds: 136.0195918367347,
    billed_seconds: 137
  }
    , 201);

  const invalidAnalyzeResponseFetch_2 = tests.createPOSTJSONResponseFetch({
    filename: "test2.mp3",
    analysis_timestamp: "123123_23124",
    time_actual: 136,

    percentages: {
      real: 72.73412942886353,
      // suno: 0.008230778621509671,
      udio: 27.251505851745605,
      riff: 0.006138449680292979,
      realVox: 45.57723104953766,
      sunoVox: 0,
      udioVox: 21.109232306480408,
      riffVox: 0
    },
    segments: [
      {
        start: 0,
        end: 132,
        class: "real",
        confidence: 0.902794326765415
      }
    ],
    segmentsVox: [
      {
        start: 0,
        end: 132,
        class: "realVox",
        confidence: 0.9591072784889397
      }
    ],
    uhm_filename: "test2.mp3",
    audio_seconds: 136.0195918367347,
    billed_seconds: 137
  }
    , 201);
  const invalidAnalyzeResponseFetch = tests.createPOSTJSONResponseFetch({
    filename: "test.mp3",
    analysis_timestamp: 12315,
  }, 201);



  it("throw error when response body does not match AnalyzeResult type", async () => {
    const client = createUhmbrellaClient({ api_key: tests.valid_api_key, f_fetch: invalidAnalyzeResponseFetch_2 })

    await expect(client.analyze.analyzeSafe(new Blob())).rejects.toMatchObject({
      message: "Expected result.percentages.suno to be a number, got undefined"
    });
  })

  it("should return AnalyzeResult", async () => {

    const client = createUhmbrellaClient({ api_key: tests.valid_api_key, f_fetch: validAnalyzeResponseFetch });

    const result = await client.analyze.analyzeSafe(new Blob());

    expect(result).toBeDefined();
    expectTypeOf(result).toEqualTypeOf<AnalyzeResult>();
  });

  it("should throw ValidationError", async () => {
    const client = createUhmbrellaClient({ api_key: tests.valid_api_key, f_fetch: invalidAnalyzeResponseFetch });

    await expect(client.analyze.analyzeSafe([{ file: new Blob(), file_name: "test1.mp3" },
    { file: new Blob(), file_name: "test2.mp3" }])).rejects.toMatchObject({ name: "ValidationError" });
  });

  it("should throw ValidationError", async () => {
    const client = createUhmbrellaClient({ api_key: tests.valid_api_key, f_fetch: validAnalyzeResponseFetch });

    await expect(client.analyze.analyzeSafe([{ file: new Blob(), file_name: "test1.mp3" },
    { file: new Blob(), file_name: "test2.mp3" }])).rejects.toMatchObject({ name: "ValidationError" });

  })
});
