import { UsageInfo } from "./usage";

const C_REAL = "real";
const C_REAL_V = "realVox";

const C_SUNO = "suno";
const C_SUNO_V = "sunoVox";

const C_UDIO = "udio";
const C_UDIO_V = "udioVox";

const C_RIFF = "riff";
const C_RIFF_V = "riffVox";

const CLASSES = [
  C_REAL, C_REAL_V, C_SUNO, C_SUNO_V, C_UDIO, C_UDIO_V, C_RIFF, C_RIFF_V
] as const;

export type MusicClass = typeof CLASSES[number];

interface Segment {
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
