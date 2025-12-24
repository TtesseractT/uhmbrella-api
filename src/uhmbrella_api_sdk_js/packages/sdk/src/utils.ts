function f_get_Total_Bytes(files: Array<{ file: Blob }>): number {
  return files.reduce((sum, f) => sum + f.file.size, 0);
}

function* f_chunk_Blob(blob: Blob, chunkSize: number) {
  let offset = 0;
  while (offset < blob.size) {
    const end = Math.min(offset + chunkSize, blob.size);
    yield blob.slice(offset, end);
    offset = end;
  }
}

export { f_get_Total_Bytes, f_chunk_Blob };
