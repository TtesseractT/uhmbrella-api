function f_getTotalBytes(files: Array<{ file: Blob }>): number {
  return files.reduce((sum, f) => sum + f.file.size, 0);
}

function* f_chunkBlob(blob: Blob, chunkSize: number) {
  let offset = 0;
  while (offset < blob.size) {
    const end = Math.min(offset + chunkSize, blob.size);
    yield blob.slice(offset, end);
    offset = end;
  }
}

function f_isStringValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export { f_getTotalBytes, f_chunkBlob, f_isStringValidHttpUrl };
