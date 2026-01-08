import { PLAN_NAMES } from "../shared/constants"
import { UsageInfo } from "../shared";
import { assertObject, assertString, assertOneOf, assertNumber } from "./assert-helpers";

export function assertUsageInfo(value: unknown): asserts value is UsageInfo {
  assertObject(value, "UsageInfo");

  assertString(value.user_id, "usage.user_id");
  assertOneOf(value.plan_name, PLAN_NAMES, "usage.plan_name");

  assertNumber(value.quota_seconds, "usage.quota_seconds");
  assertNumber(value.used_seconds, "usage.used_seconds");
  assertNumber(value.remaining_seconds, "usage.remaining_seconds");
}

