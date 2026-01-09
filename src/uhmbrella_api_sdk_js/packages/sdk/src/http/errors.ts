import { UhmbrellaSDKError } from "../shared";

export type ApiErrorParams = {
  status: number;
  message: string;
  body?: unknown;
  name?: string;
};

export class ApiError extends UhmbrellaSDKError {
  readonly status: number;
  readonly body?: unknown;

  constructor(params: ApiErrorParams) {
    super({ message: params.message, name: "API Error" });
    this.name = params.name ?? "ApiError";
    this.status = params.status;
    this.body = params.body;
  }
}

