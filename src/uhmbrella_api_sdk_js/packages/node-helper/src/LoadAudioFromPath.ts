import fs from "node:fs";
import path from "node:path";

export function loadAudio(filePath: string): File {
  const buffer = fs.readFileSync(filePath);
  return new File([buffer], path.basename(filePath));
}

