
---

# Uhmbrella AIMD CLI / HTTP Quick Reference

The `uhmbrella-api` Python package provides a CLI that wraps the public Uhmbrella AIMD API.

By default the CLI talks to:

```text
https://api.uhmbrella.io
```

You must provide an API key either via `--api-key` or the `UHM_API_KEY` environment variable.

Global flags:

* `--api-key` - API key for authentication.
* `--api-base` - override base URL (optional).

> The CLI lets you put `--api-key` anywhere, for example:
> `uhmbrella-api scan --input file.wav --api-key KEY` works the same as
> `uhmbrella-api --api-key KEY scan --input file.wav`.

---

## 1. Usage - check quota

### CLI

```bash
uhmbrella-api usage --api-key YOUR_API_KEY
```

This calls `GET /usage` and prints the JSON.

### HTTP / curl

```bash
curl "https://api.uhmbrella.io/usage" \
  -H "x-api-key: YOUR_API_KEY"
```

Example response shape:

```json
{
  "user_id": "test_user",
  "plan_name": "trial_100min",
  "quota_seconds": 6000,
  "used_seconds": 765,
  "remaining_seconds": 5235
}
```

---

## 2. Scan - synchronous analysis

The `scan` command:

* If `--input` is a file, uses `POST /v1/analyze`.
* If `--input` is a directory (small batches), uses `POST /v1/analyze-batch` and enforces a limit of 40 files.

Results are written to JSON files in `--output-dir`.

### 2.1 Single file

#### CLI

```bash
uhmbrella-api scan \
  --input "/path/to/audio.mp3" \
  --output-dir "./uhm_results" \
  --api-key YOUR_API_KEY
```

This sends the file to `/v1/analyze` and saves:

```text
./uhm_results/audio.mp3.analysis.json
```

#### HTTP / curl

```bash
curl -X POST "https://api.uhmbrella.io/v1/analyze" \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@/path/to/audio.mp3"
```

Example response shape:

```json
{
  "filename": "tmpabc123.mp3",
  "analysis_timestamp": "20251114_005043_554067",
  "time_actual": 255.0,
  "percentages": {
    "real": 82.95,
    "suno": 0.0,
    "udio": 16.99,
    "riff": 0.06,
    "realVox": 76.04,
    "sunoVox": 0.0,
    "udioVox": 1.89,
    "riffVox": 0.0
  },
  "segments": [ /* time segments by class */ ],
  "segmentsVox": [ /* vocal segments by class */ ],
  "uhm_filename": "audio.mp3",
  "audio_seconds": 254.81,
  "billed_seconds": 255,
  "usage": {
    "user_id": "test_user",
    "plan_name": "trial_100min",
    "quota_seconds": 6000,
    "used_seconds": 1020,
    "remaining_seconds": 4980
  }
}
```

The CLI writes this whole JSON into `<output-dir>/<original_name>.analysis.json`.

---

### 2.2 Small folder (up to 40 files)

#### CLI

```bash
uhmbrella-api scan \
  --input "./audio_folder" \
  --output-dir "./uhm_results" \
  --api-key YOUR_API_KEY
```

If there are 40 or fewer audio files, the CLI sends them as a batch to `/v1/analyze-batch`. It then writes one `.analysis.json` file per input file.

#### HTTP / curl

```bash
curl -X POST "https://api.uhmbrella.io/v1/analyze-batch" \
  -H "x-api-key: YOUR_API_KEY" \
  -F "files=@/path/to/track1.wav" \
  -F "files=@/path/to/track2.mp3"
```

Example response shape:

```json
{
  "total_files": 2,
  "total_audio_seconds": 520.4,
  "total_billed_seconds": 521,
  "results": [
    {
      "filename": "track1.wav",
      "analysis_timestamp": "20251114_010000_000000",
      "time_actual": 260,
      "percentages": { /* same structure as /v1/analyze */ },
      "segments": [ /* ... */ ],
      "segmentsVox": [ /* ... */ ],
      "uhm_filename": "track1.wav",
      "audio_seconds": 260.2,
      "billed_seconds": 260
    },
    {
      "filename": "track2.mp3",
      "analysis_timestamp": "20251114_010001_000000",
      "time_actual": 260,
      "percentages": { /* ... */ },
      "segments": [ /* ... */ ],
      "segmentsVox": [ /* ... */ ],
      "uhm_filename": "track2.mp3",
      "audio_seconds": 260.2,
      "billed_seconds": 260
    }
  ],
  "usage": {
    "user_id": "test_user",
    "plan_name": "pro_10h",
    "quota_seconds": 36000,
    "used_seconds": 2000,
    "remaining_seconds": 34000
  }
}
```

The CLI:

* Writes each `results[i]` object to `<output-dir>/<filename>.analysis.json`.
* Prints `[OK] Saved: ...` for each file.

If there are more than 40 files, the CLI prints an error and tells you to use `jobs create` instead.

---

## 3. Jobs create - async bulk job

### CLI

```bash
uhmbrella-api jobs create \
  --input "./audio_folder" \
  --api-key YOUR_API_KEY
```

This scans the folder for audio files and uploads them to `/v1/jobs` as a single job. The CLI prints the response JSON and a reminder of the follow up commands.

### HTTP / curl

```bash
curl -X POST "https://api.uhmbrella.io/v1/jobs" \
  -H "x-api-key: YOUR_API_KEY" \
  -F "files=@/path/to/track1.wav" \
  -F "files=@/path/to/track2.wav" \
  -F "files=@/path/to/track3.wav"
```

Example response shape:

```json
{
  "job_id": "7f3f696c-8052-43f8-a5c5-08b3767b030e",
  "status": "queued",
  "total_files": 3,
  "total_billed_seconds": 559,
  "remaining_seconds_before": 29971
}
```

You then use `jobs status` and `jobs results` with that `job_id`.

---

## 4. Jobs status - check job progress

### CLI

```bash
uhmbrella-api jobs status \
  --job-id 7f3f696c-8052-43f8-a5c5-08b3767b030e \
  --api-key YOUR_API_KEY
```

The CLI calls `/v1/jobs/{job_id}/status` and prints the JSON.

### HTTP / curl

```bash
curl "https://api.uhmbrella.io/v1/jobs/7f3f696c-8052-43f8-a5c5-08b3767b030e/status" \
  -H "x-api-key: YOUR_API_KEY"
```

Example response shape:

```json
{
  "job_id": "7f3f696c-8052-43f8-a5c5-08b3767b030e",
  "status": "processing",   // or queued, done, error, cancelling, cancelled
  "total_files": 3,
  "total_billed_seconds": 559,
  "counts": {
    "pending": 1,
    "processing": 1,
    "done": 1,
    "error": 0
  },
  "progress": 0.33,
  "plan_name": "trial_100min",
  "quota_seconds": 6000,
  "used_seconds": 765,
  "remaining_seconds": 5235
}
```

---

## 5. Jobs results - fetch per file results

### CLI

```bash
uhmbrella-api jobs results \
  --job-id 7f3f696c-8052-43f8-a5c5-08b3767b030e \
  --output-dir "./results" \
  --api-key YOUR_API_KEY
```

* Without `--output-dir`

  * Prints a summary, then the full raw JSON.
* With `--output-dir`

  * Prints a summary.
  * Writes one `.analysis.json` file per successful file.
  * Writes `.error.json` stubs for files that are not `status="done"`.

### HTTP / curl

```bash
curl "https://api.uhmbrella.io/v1/jobs/7f3f696c-8052-43f8-a5c5-08b3767b030e/results" \
  -H "x-api-key: YOUR_API_KEY"
```

Example response shape:

```json
{
  "job_id": "7f3f696c-8052-43f8-a5c5-08b3767b030e",
  "status": "done",
  "results": [
    {
      "filename": "track1.wav",
      "status": "done",
      "error": null,
      "result": {
        "filename": "track1.wav",
        "analysis_timestamp": "20251114_010000_000000",
        "time_actual": 240,
        "percentages": { /* same structure as /v1/analyze */ },
        "segments": [ /* ... */ ],
        "segmentsVox": [ /* ... */ ],
        "uhm_filename": "track1.wav",
        "audio_seconds": 240.1,
        "billed_seconds": 241
      }
    },
    {
      "filename": "track2.wav",
      "status": "error",
      "error": "Some error message",
      "result": null
    }
  ]
}
```
---

## 6. Cancel job - Cancel jobs that are processing

Use this to cooperatively stop a long running job. The worker finishes the current file then stops.

### CLI

```bash
uhmbrella-api jobs cancel \
  --job-id 7f3f696c-8052-43f8-a5c5-08b3767b030e \
  --api-key YOUR_API_KEY
```

### HTTP / curl (equivalent)

```bash
curl -X POST "https://api.uhmbrella.io/v1/jobs/7f3f696c-8052-43f8-a5c5-08b3767b030e/cancel" \
  -H "x-api-key: YOUR_API_KEY"
```

### Example responses

If cancellation is accepted:

```json
{
  "job_id": "7f3f696c-8052-43f8-a5c5-08b3767b030e",
  "status": "cancelling"
}
```

If the job has already finished or been cancelled, you just get its current status:

```json
{
  "job_id": "7f3f696c-8052-43f8-a5c5-08b3767b030e",
  "status": "done"
}
```

or

```json
{
  "job_id": "7f3f696c-8052-43f8-a5c5-08b3767b030e",
  "status": "cancelled"
}
```