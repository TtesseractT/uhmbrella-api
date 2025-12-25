export const MAX_SYNC_FILES = 40;
export const MAX_CHUNK_SIZE = 50 * 1024 * 1024;
export const DEFAULT_CHUNK_SIZE = 20 * 1024 * 1024;



export const PLAN_NAMES = [
  "trial",
  "starter_monthly",
  "starter_yearly",
  "advanced_monthly",
  "advanced_yearly",
  "professional_monthly",
  "professsional_yearly",
  "enterprise"
] as const;

const C_REAL = "real";
const C_REAL_V = "realVox";

const C_SUNO = "suno";
const C_SUNO_V = "sunoVox";

const C_UDIO = "udio";
const C_UDIO_V = "udioVox";

const C_RIFF = "riff";
const C_RIFF_V = "riffVox";

export const MUSIC_CLASSES = [
  C_REAL, C_REAL_V, C_SUNO, C_SUNO_V, C_UDIO, C_UDIO_V, C_RIFF, C_RIFF_V
] as const;


