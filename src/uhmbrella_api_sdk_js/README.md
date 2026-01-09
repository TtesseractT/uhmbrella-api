# uhmbrella-js

A pnpm monorepo that contains uhmbrella AIMD TypeScript SDK.It can be used in the browser, node.js, deno, bun or any other JavaScript runtime.
The SDK has first-class TypeScript support with node.js helper.

You can easily try it out through 2 ways:

- Initialize an empty workspace if you haven't got one:

```
npm init
```

- Then install the @uhmbrella/sdk package:

```
npm install @uhmbrella/sdk
```

- (Optional) For node.js and bun runtime, you can also get the node-helper package:

```
npm install @uhmbrella/sdk-node
```

or in the playground by following the steps (pnpm is required):

 1. Clone the repository and then ```cd uhmbrella-api/src/uhmbrella_api_sdk_js/```
 2. ```pnpm install```
 3. ```pnpm build```
 4. create a .env file in the playground directory and paste your API key: ```API_KEY=<YOUR_UHMBRELLA_API_KEY>```
 5. The default playground code looks for audio files in the playground directory, so add a file or just comment out the lines in `playground/src/index.ts`
 6. From the root of the repository run: ```pnpm playground dev```

Refer to the [TypeScript SDK package README.md](packages/sdk/README.md) or the [SDK playground's code (for node.js only)](playground/src/index.ts) for usage of the sdk.
