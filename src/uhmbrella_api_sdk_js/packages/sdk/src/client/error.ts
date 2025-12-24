export type UhmbrellaClientConfigErrorParams = {
  message: string;
};

export class UhmbrellaClientError extends Error {

  constructor(params: UhmbrellaClientConfigErrorParams) {
    super(params.message);
    this.name = "Client configuation validation error";
  }
}

