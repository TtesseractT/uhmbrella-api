export type UhmbrellaSDKErrorParams = {
  name: string;
  message: string;
};

export class UhmbrellaSDKError extends Error {

  constructor(params: UhmbrellaSDKErrorParams) {
    super(params.message);
    this.name = params.name;
  }
}

