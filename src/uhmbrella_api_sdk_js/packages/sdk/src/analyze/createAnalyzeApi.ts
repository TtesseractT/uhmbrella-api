import { MAX_CHUNK_SIZE, MAX_SYNC_FILES } from "../constants";
import { UhmbrellaSDKError } from "../error";
import { HttpClient } from "../http/createHttpClient";
import { AnalyzeFileInput, AnalyzeResponse } from "../types/";
import { f_get_Total_Bytes } from "../utils";

const create_Analyze_Api = (httpClient: HttpClient) => {

  /**
 * @returns AnalyzeResponse 
 * */
  function f_analyze_File(file: Blob | File, file_name?: string): Promise<AnalyzeResponse> {
    if (f_get_Total_Bytes([{ file }]) > MAX_CHUNK_SIZE) {
      throw new UhmbrellaSDKError({ name: "Max size exeeded", message: `file ${file_name} is bigger than the ${(MAX_CHUNK_SIZE / 1024) / 1024} MB limit. Use jobs.create .` });
    }
    const form = new FormData();

    form.append("file", file, file_name);

    return httpClient.post<AnalyzeResponse>("/v1/analyze", {
      body: form
    });
  }

  function f_analyze_Batch(files: Array<{ file: Blob | File; file_name?: string }>): Promise<AnalyzeResponse> {

    if (files.length == 1) {
      return f_analyze_File(files[0]!.file, files[0]?.file_name);
    } else if (files.length > MAX_SYNC_FILES) {
      throw new UhmbrellaSDKError({ name: "Invalid params", message: `Number of audio files exeeded ${MAX_SYNC_FILES}, use jobs.create .` });
    } else if (f_get_Total_Bytes(files) > MAX_CHUNK_SIZE) {
      throw new UhmbrellaSDKError({ name: "Max size exeeded", message: `The total size ${f_get_Total_Bytes(files)} Bytes for all the files is more than the ${MAX_CHUNK_SIZE} Bytes limit. Use jobs.create to send data in chunks.` })
    }
    const form = new FormData();

    for (const { file, file_name } of files) {
      form.append("files", file, file_name);
    }

    return httpClient.post<AnalyzeResponse>("/v1/analyze-batch", {
      body: form
    });
  }


  function f_analyze(file: Blob | File, file_name?: string): Promise<AnalyzeResponse>;
  function f_analyze(files: AnalyzeFileInput[]): Promise<AnalyzeResponse>;
  function f_analyze(arg1: Blob | File | AnalyzeFileInput[], file_name?: string): Promise<AnalyzeResponse> {

    if (Array.isArray(arg1)) {
      return f_analyze_Batch(arg1);
    }

    return f_analyze_File(arg1, file_name);
  }

  return {
    analyze: f_analyze
  };
}

export { create_Analyze_Api };
