import fs from "node:fs";
import path from "node:path";
import { AudioFile } from "./types/index.js";

export function loadAudio(filePath: string): AudioFile {
  const buffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const file = new File([buffer], fileName, { type: "application/octet-stream" });

  return {
    file,
    file_name: fileName
  };
}

