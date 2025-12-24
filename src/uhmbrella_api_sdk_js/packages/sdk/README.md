# Uhmbrella-sdk

[Uhmbrella Homepage](https://home.uhmbrella.io/api)

Uhmbrella AIMD TypeScript SDK for detecting AI-generated audio.
The SDK is platform-agnostic and works in:

- Browsers

- Node.js (18+)

- Deno

- Bun

- Edge / Workers

It provides first-class TypeScript support, a clean API surface, and an explicit separation between synchronous analysis and async, job-based uploads with progress tracking.

## Installation

```bash
npm install @uhmbrella/sdk
```

For Node.js helpers (filesystem support):

```bash
npm install @uhmbrella/sdk-node
```

## Basic Usage

```TypeScript
import { createUhmbrellaClientSafe } from "@uhmbrella/sdk";

const client = await createUhmbrellaClientSafe({
  api_key: process.env.API_KEY!,
//base_url: "",
//jobs: {
//  chunk_size: 20 * 1024 * 1024 // default is 50 * 1024 * 1024
// }
//f_fetch:  // You can use your own fetch library, but it has to conform to the WHATWG Fetch API. It should also return the Response object.

});
```


### Client creation modes

There are two ways to create a client:

#### Safe (recommended)
```TypeScript
await createUhmbrellaClientSafe(config);
```

- Performs a runtime config validation

- Calls the /usage endpoint once

- Fails early if the API key is invalid

#### Unsafe (but slightly faster)

```TypeScript
createUhmbrellaClient(config);
```

- No network call on creation

- Errors occur on first API request

Both variants validate the API key format at runtime.

### Jobs API (Recommended for large uploads)

The Jobs API supports:

- Large files

- Multiple files

- upload progress tracking using a callback

- Chunked uploads

#### Node.js example (directory upload)

```TypeScript
import { createUhmbrellaClientSafe } from "@uhmbrella/sdk";
import { loadAudioFilesFromDirectory } from "@uhmbrella/sdk-node";

const client = await createUhmbrellaClientSafe({
  api_key: process.env.API_KEY!
});

const files = loadAudioFilesFromDirectory("./audio", {
  recursive: false
});

const job = await client.jobs.create({
  files,
  onProgress(sent, total) {
    console.log(`Upload: ${Math.round((sent / total) * 100)}%`);
  }
});

console.log("Job created:", job.job_id);
```

#### Check job status

```TypeScript
const status = await client.jobs.status(job.job_id);
console.log(status);
```

#### Fetch job results

```TypeScript
const results = await client.jobs.results(job.job_id);
console.log(results);

```

#### Cancel a job

```TypeScript
const result = await client.jobs.cancel(job.job_id);

```

### Synchronous Analyze API (Small files only)

The synchronous API is intended for:

- Small uploads

- Quick checks

- No progress tracking

#### Single file

```TypeScript
const result = await client.analyze.analyze(file, "audio.mp3");
```

#### Multiple files (limited)

```TypeScript
const result = await client.analyze.analyze(files);
```

##### Important limits

- Total size is capped

- File count is capped

- No upload progress


### File Handling

#### Browser

```TypeScript
const file = new File([blob], "audio.wav", {
  type: "audio/wav"
});

await client.analyze.analyze(file);
```

#### Node.js (using sdk-node)

```TypeScript
import { loadAudio } from "@uhmbrella/sdk-node";

const { file, file_name } = loadAudio("./audio.mp3");
await client.analyze.analyze(file, file_name);

Directory loading (Node.js)
import { loadAudioFilesFromDirectory } from "@uhmbrella/sdk-node";

const files = loadAudioFilesFromDirectory("./audio", {
  recursive: true
});
```

### Usage & Quota

```TypeScript
const usage = await client.usage.getUsage();
console.log(usage);
```

- Returns userid, quota, usage, and remaining seconds.

## Error Handling

All SDK errors extend UhmbrellaSDKError.

```TypeScript
try {
  await client.jobs.create(input);
} catch (err) {
  if (err instanceof UhmbrellaSDKError) {
    console.error(err.name, err.message);
  }
}
```

### Error types

- UhmbrellaSDKError – client-side validation / limits

- UhmbrellaClientError - client-configuration validation errors

- ApiError – API response errors (4xx / 5xx)



## Custom Fetch Support

You may provide a custom fetch implementation:

```TypeScript
createUhmbrellaClient({
  api_key,
  f_fetch: customFetch
});
```

### Requirements:

- Must conform to the WHATWG Fetch API

- Must return a Response

## Design Principles

- Platform agnostic

- No fs in core SDK

- Explicit progress semantics using JobProgressCallback function 

- Jobs own chunking & progress

## License

Apache License Version 2.0

