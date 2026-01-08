import { UhmbrellaSDKError } from "../shared";

export type AssertErrorParams = {
  name?: string;
  expected_type: string;
  recieved_type: string;
  key: string;
  value: any;
  min_value?: number;
  max_value?: number;
  body?: string;

}
export class UhmbrellaAssertError extends UhmbrellaSDKError {
  readonly expected_type: string;
  readonly recieved_type: string;
  readonly key: string;
  readonly value: any;
  readonly min_value?: number;
  readonly max_value?: number;

  constructor(params: AssertErrorParams) {
    super({ message: params.body ?? 'assert error.', name: params.name ?? "UhmbrellaClientAssertError" });
    this.expected_type = params.expected_type;
    this.recieved_type = params.recieved_type;
    this.key = params.key;
    this.value = params.value;
    this.max_value = params.max_value ?? undefined;
    this.min_value = params.min_value ?? undefined;
  }
}
