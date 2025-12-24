export type ApiErrorParams = {
  status: number;
  message: string;
  body?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;

  constructor(params: ApiErrorParams) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.body = params.body;
  }
}

