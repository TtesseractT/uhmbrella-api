import { MUSIC_CLASSES } from "../constants.js";
import type { UsageInfo } from "./usage.js";

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

export type AnalyzeResponse = {
  total_files: number;
  total_audio_seconds: number;
  total_billed_seconds: number;
  results: AnalyzeResult[];
  usage: UsageInfo;
};

export type AnalyzeFileInput = {
  file: Blob | File;
  file_name?: string;
};

export type FileUploadCallback = (filename: string, sent: number, total: number) => void;

