import type {
  AnalyzeBatchResponse,
  AnalyzeFileInput,
  AnalyzeOptions,
  JobConfig,
  JobCancelResponse,
  JobCreateResponse,
  JobResultsResponse,
  UhmbrellaClientConfig,
  UsageInfo,
  UhmbrellaSDK,
  AnalyzeResult,
} from "@uhmbrella/sdk";

import {
  createUhmbrellaClientSafe,
  UhmbrellaSDKError,
  UhmbrellaSDKConfigError,
  UhmbrellaAssertError,
  ApiError,
  DEFAULT_CHUNK_SIZE,
} from "@uhmbrella/sdk";

import { loadAudio, loadAudioFilesFromDirectory, type AudioFile } from "@uhmbrella/sdk-node";
import "dotenv/config";

async function main() {
  try {

    const config: UhmbrellaClientConfig = {
      api_key: process.env.API_KEY!,
      // base_url: "",
      jobs: {
        chunk_size: DEFAULT_CHUNK_SIZE,
        // chunk_upload_timeout: 60000,
        // onProgress: 
      },
      // request_options: {
      //   timeout_ms: 30000
      // }
      // f_fetch:  // You can use your own fetch library, but it has to conform to the WHATWG Fetch API. It should also return the Response object.
    }

    /*
    * There are two functions to create an Uhmbrella client, the safe version like below pings the /usage endpoint to check if the api key actually belongs to an user or not.
    * The 'unsafe' one, createUhmbrellaClient, does not do this. But both of them run a runtime validation check, which checks if the API key is atleast 21 characters long.
    * **/
    const client: UhmbrellaSDK = await createUhmbrellaClientSafe(config);

    /**
     * Scanning a directory, loading the files into a buffer.
     * If some audio files aren't able to be read, it returns the errors.
     * Check the length of files before procediing.
   * */
    const { files, errors } = loadAudioFilesFromDirectory('./', { recursive: false });
    console.log(errors);


    /*
     * Or load a single file
     * */
    // const { file, file_name } = loadAudio('./audio.mp3');

    const job_input: JobConfig = {
      files,
      options: {
        onProgress: (sent, total) => {
          console.log(`upload progress update: ${Math.round((sent / total) * 100)}%`);
        },
        // chunk_size:
        // chunk_upload_timeout: 10000
      }
    }

    const job: JobCreateResponse = await client.jobs.createSafe(job_input);
    console.log("Job Created: ", job);
    //
    // const job_status = await client.jobs.status(job.job_id);
    // console.log("Job status: ", JSON.stringify(job_status));
    //
    const job_result: JobResultsResponse = await client.jobs.resultsSafe(job.job_id);
    // const job_cancel: JobCancelResponse = await client.jobs.cancel(job.job_id);
    //
    console.log("Job Result: ", JSON.stringify(job_result));
    // console.log("Job cancel response: ", JSON.stringify(job_cancel));

    /**
     * Getting usage info
     * */
    const usageInfo: UsageInfo = await client.usage.getUsage();
    console.log("User usage: ", usageInfo);

    /**
     * Synchrnous API
     * */

    // client.analyze.analyze
    // const result: AnalyzeResult = await client.analyze.analyze(file, { file_name, timeout_ms: 30000 });
    // const result = await client.analyze.analyzeSafe(files, { timeout_ms: 30000 });
    // console.log(result);


  } catch (error) {
    if (error instanceof UhmbrellaSDKError) {
      console.error(error);
    }
  }

}

await main();




