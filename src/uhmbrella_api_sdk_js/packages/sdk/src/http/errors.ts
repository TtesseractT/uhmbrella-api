import { UhmbrellaSDKError } from "../error";

export type ApiErrorParams = {
  status: number;
  message: string;
  body?: unknown;
};

export class ApiError extends UhmbrellaSDKError {
  readonly status: number;
  readonly body?: unknown;

  constructor(params: ApiErrorParams) {
    super({ message: params.message, name: "API Error" });
    this.name = "ApiError";
    this.status = params.status;
    this.body = params.body;
  }
}

