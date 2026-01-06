import { UhmbrellaSDKError } from "@uhmbrella/sdk";


export class UhmbrellaReadError extends UhmbrellaSDKError {
  readonly kind: 'readdir' | 'readfile';
  readonly path: string;
  error: NodeJS.ErrnoException;

  constructor(params: { kind: 'readdir' | 'readfile', path: string, error: NodeJS.ErrnoException }) {
    super({ name: "UhmbrellaReadError", message: "error reading a file" });
    this.kind = params.kind;
    this.path = params.path;
    this.error = params.error;
  }
}
