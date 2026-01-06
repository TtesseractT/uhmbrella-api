import fs from "node:fs";
import path from "node:path";
import { AudioFile } from "./types/index.js";
import { UhmbrellaSDKError } from "@uhmbrella/sdk";
import { UhmbrellaReadError } from "./error.js";

export function loadAudio(filePath: string): AudioFile {
  let file: File;
  let fileName: string;
  try {

    const buffer = fs.readFileSync(filePath);
    fileName = path.basename(filePath);

    file = new File([buffer], fileName, { type: "application/octet-stream" });

  } catch (error) {
    throw new UhmbrellaReadError({ kind: 'readfile', path: filePath, error: error as Error });
  }
  return {
    file,
    file_name: fileName
  };

}

