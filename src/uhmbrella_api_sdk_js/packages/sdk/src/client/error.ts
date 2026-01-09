import { UhmbrellaSDKError } from "../shared";

export type UhmbrellaSDKConfigErrorParams = {
  message: string;
};

export class UhmbrellaSDKConfigError extends UhmbrellaSDKError {

  constructor(params: UhmbrellaSDKConfigErrorParams) {
    super({ message: params.message, name: "Client configuation validation error" });
  }
}

