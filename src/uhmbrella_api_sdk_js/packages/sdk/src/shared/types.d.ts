import { PLAN_NAMES } from "./constants";

export type PlanName = typeof PLAN_NAMES[number];

export type UsageInfo = {
  user_id: string;
  plan_name: PlanName;
  quota_seconds: number;
  used_seconds: number;
  remaining_seconds: number;
};

export type MusicClass = typeof MUSIC_CLASSES[number];

export interface Segment {
  start: number;
  end: number;
  class: MusicClass,
  confidence: number;
};

export type Percentages = Record<MusicClass, number>;

export type AnalyzeResult = {
  filename: string;
  analysis_timestamp: string;
  time_actual: number;

  percentages: Percentages;

  segments: Segment[];
  segmentsVox: Segment[];

  uhm_filename: string;
  audio_seconds: number;
  billed_seconds: number;
};

export type RequestOptions = {
  /**
  * Defaults to 30000 ms.
  */
  timeout_ms?: number;
};

