import { PLAN_NAMES } from "../constants";

export type PlanName = typeof PLAN_NAMES[number];

export type UsageInfo = {
  user_id: string;
  plan_name: PlanName;
  quota_seconds: number;
  used_seconds: number;
  remaining_seconds: number;
};
