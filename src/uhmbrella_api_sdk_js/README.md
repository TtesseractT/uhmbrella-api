# uhmbrella-js

A monorepo that contains uhmbrella AIMD TypeScript SDK that is platform agnostic, it can be used in the browser, node.js, deno, bun or any other JavaScript runtime.
The SDK has first-class TypeScript support with node.js helper.

You can easily try it out in the playground by following the steps:

 1. ```pnpm install```
 2. ```pnpm build```
 3. create a .env file in the playground and paste your API key: ```API_KEY=<YOUR_UHMBRELLA_API_KEY>```
 4. The default playground code looks for audio files in the playground directory, so add a file or just comment out the lines in `playground\src\index.ts`
 5. From the root of the repository run: ```pnpm playground dev```

Refer to the [SDK core's README.md](packages/sdk/README.md) or the [SDK playground's code (for node.js only)](playground/src/index.ts) for usage of the sdk.
