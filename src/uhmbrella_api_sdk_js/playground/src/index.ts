import type {
  AnalyzeBatchResponse,
  AnalyzeFileInput,
  AnalyzeOptions,
  CreateJobConfig,
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
  UhmbrellaClientError,
  ApiError,
} from "@uhmbrella/sdk";

import { loadAudio, loadAudioFilesFromDirectory, type AudioFile } from "@uhmbrella/sdk-node";
import "dotenv/config";

/**
 * In other runtimes you can feed a buffer to a File object and pass that to the analyzeFile function.
 * const file = new File(
 * [buffer],
 * path.basename(filePath),
 * { type: "audio/mpeg" }
 *);
 * And in browser code you can create a blob and do the same.
 * */
async function main() {
  try {

    /*Creating the Uhmbrella Client with config options*/
    const config: UhmbrellaClientConfig = {
      api_key: process.env.API_KEY!,
      // base_url: "",
      jobs: {
        chunk_size: 20 * 1024 * 1024,
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
         * Below is how you use the Jobs API.
         * Scanning a directory, loading the files into a buffer.
         * */
    const files: AudioFile[] = loadAudioFilesFromDirectory('./', { recursive: false });

    /*Or load a single file*/
    const { file, file_name } = loadAudio('./audio.mp3');

    /**
    * creating a job object with a callback function which will be called inside the jobs.create() function whenever a chunk or a file has been uploaded.
    * */
    const job_input: CreateJobConfig = {
      files,
      options: {
        onProgress: (sent, total) => {
          console.log(`upload progress update: ${Math.round((sent / total) * 100)}%`);
        },
        // chunk_size:
        // chunk_upload_timeout: 100
      }
    }

    // const job: JobCreateResponse = await client.jobs.createSafe(job_input);
    // console.log("Job Created: ", job);
    //
    // const job_status = await client.jobs.status("c03810c1-222e-4325-a408-24138364399f");
    // console.log("Job status: ", JSON.stringify(job_status));
    //
    const job_result: JobResultsResponse = await client.jobs.resultsSafe("c03810c1-222e-4325-a408-24138364399f");
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
    // const result: AnalyzeResult = await client.analyze.analyzeSafe(file, { file_name, timeout_ms: 30000 });
    // const result: AnalyzeBatchResponse= await client.analyze.analyzeSafe(files, { timeout_ms: 30000 });
    // console.log(result);


  } catch (error) {
    if (error instanceof UhmbrellaSDKError) {
      console.error(error);
    }
  }

}

await main();




