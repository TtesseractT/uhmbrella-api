export type UsageInfo = {
  user_id: string;
  plan_name: 'trial' | 'starter_monthly' | 'starter_yearly' | 'advanced_monthly' | 'advanced_yearly' | 'professional_monthly' | 'professsional_yearly' | 'enterprise';
  quota_seconds: number;
  used_seconds: number;
  remaining_seconds: number;
};
