import { UhmbrellaSDKError } from "../error";

export type UhmbrellaClientConfigErrorParams = {
  message: string;
};

export class UhmbrellaClientError extends UhmbrellaSDKError {

  constructor(params: UhmbrellaClientConfigErrorParams) {
    super({ message: params.message, name: "Client configuation validation error" });
  }
}

