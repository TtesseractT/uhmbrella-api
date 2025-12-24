import { HttpClient } from "../http/createHttpClient";
import { AnalyzeFileInput, AnalyzeResponse } from "../types/";

const create_Analyze_Api = (httpClient: HttpClient) => {

  /**
 * @returns AnalyzeResponse 
 * */
  function f_analyze_File(file: Blob | File, file_name?: string): Promise<AnalyzeResponse> {
    const form = new FormData();

    form.append("file", file, file_name);

    return httpClient.post<AnalyzeResponse>("/v1/analyze", {
      body: form
    });
  }

  function f_analyze_Batch(files: Array<{ file: Blob | File; file_name?: string }>): Promise<AnalyzeResponse> {

    if (files.length == 1) {
      return f_analyze_File(files[0]!.file, files[0]?.file_name);
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
