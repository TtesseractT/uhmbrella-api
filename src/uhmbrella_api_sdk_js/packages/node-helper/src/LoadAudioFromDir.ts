import fs from "node:fs";
import path from "node:path";
import type { LoadAudioFilesOptions, AudioFile } from "./index.d.ts";
import { UhmbrellaReadError } from "./error.js";

const DEFAULT_AUDIO_EXTENSIONS = new Set([
  ".mp3",
  ".wav",
  ".flac",
  ".m4a",
  ".aac",
  ".ogg"
]);

export function loadAudioFilesFromDirectory(dirPath: string, options: LoadAudioFilesOptions = {}): {
  files: AudioFile[];
  errors: UhmbrellaReadError[];
} {

  const { recursive = false,
    extensions = Array.from(DEFAULT_AUDIO_EXTENSIONS) } = options;

  const extSet = new Set(
    extensions.map(ext =>
      ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`
    )
  );

  const files: AudioFile[] = [];
  const errors: UhmbrellaReadError[] = [];

  function walk(currentPath: string) {
    let entries: fs.Dirent[];

    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch (e) {
      errors.push(new UhmbrellaReadError({
        kind: "readdir",
        path: currentPath,
        error: e as NodeJS.ErrnoException,
      }));
      return;
    }

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

      try {
        const buffer = fs.readFileSync(fullPath);
        const file = new File([buffer], entry.name, {
          type: "application/octet-stream",
        });

        files.push({ file, file_name: entry.name });
      } catch (e) {
        errors.push(new UhmbrellaReadError({
          kind: "readfile",
          path: fullPath,
          error: e as NodeJS.ErrnoException,
        }));
      }
    }
  }

  walk(dirPath);

  return { files, errors };
}
