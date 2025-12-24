import {
  type AnalyzeResponse,
  ApiError,
  type CreateJobInput,
  createUhmbrellaClientSafe,
  type JobCancelResponse,
  type JobCreateResponse,
  type JobResultsResponse,
  type UhmbrellaClientConfig,
  UhmbrellaClientError,
  type UhmbrellaSDK,
  UhmbrellaSDKError,
  type UsageInfo
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
      // jobs: {
      //   chunk_size: 20 * 1024 * 1024 // default is 50 * 1024 * 1024
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
    // const { file, file_name } = loadAudio('./audio.mp3');

    /**
    * creating a job object with a callback function which will be called inside the jobs.create() function whenever a chunk or a file has been uploaded.
    * */
    const job_input: CreateJobInput = {
      files,
      onProgress(sent, total) {
        console.log(`upload progress update: ${Math.round((sent / total) * 100)}%`);
      },
      // chunk_size: 20 * 1024 * 1024
    }

    const job: JobCreateResponse = await client.jobs.create(job_input);
    console.log("Job Created: ", job);

    const job_status = await client.jobs.status(job.job_id);
    console.log("Job status: ", JSON.stringify(job_status));

    const job_result: JobResultsResponse = await client.jobs.results(job.job_id);
    // const job_cancel: JobCancelResponse = await client.jobs.cancel(job.job_id);

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
    // const result: AnalyzeResponse = await client.analyze.analyze(file, file_name);
    // const result: AnalyzeResponse = await client.analyze.analyze(files);
    // console.log(result);


  } catch (error) {
    if (error instanceof UhmbrellaSDKError) {
      console.error(error.name, ":", error.message);
    }
  }

}

await main();




