import fs from "node:fs";
import path from "node:path";
import { LoadAudioFilesOptions, AudioFile } from "./types/index.js";

const DEFAULT_AUDIO_EXTENSIONS = new Set([
  ".mp3",
  ".wav",
  ".flac",
  ".m4a",
  ".aac",
  ".ogg"
]);



/**
 * Load audio files from a directory and return SDK-ready File objects.
 */
export function loadAudioFilesFromDirectory(dirPath: string, options: LoadAudioFilesOptions = {}): AudioFile[] {

  const { recursive = false,
    extensions = Array.from(DEFAULT_AUDIO_EXTENSIONS) } = options;

  const extSet = new Set(
    extensions.map(ext =>
      ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`
    )
  );

  const results: AudioFile[] = [];

  function walk(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (recursive) {
          walk(fullPath);
        }
        continue;
      }

      if (!entry.isFile()) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (!extSet.has(ext)) continue;

      const buffer = fs.readFileSync(fullPath);

      const file = new File([buffer], entry.name, { type: "application/octet-stream" });

      results.push({
        file, file_name: entry.name
      });
    }
  }

  walk(dirPath);
  return results;
}

