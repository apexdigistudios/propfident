export type NullableStringOrNumber = string | number | null;

export type PropFirmNewsTrading = boolean | string;
export type PropFirmWeekendHolding = boolean | string;

export interface PropFirmRules {
  profit_target_p1_percent: number | null;
  profit_target_p2_percent: number | null;
  daily_drawdown_percent: number | null;
  daily_drawdown_type: string;
  max_drawdown_percent: number;
  max_drawdown_type: string;
  drawdown_lock_point: string;
  min_trading_days_p1: NullableStringOrNumber;
  min_trading_days_p2: NullableStringOrNumber;
  time_limit: string;
  max_leverage_forex: string;
  profit_split_percent: number;
  weekend_holding: PropFirmWeekendHolding;
  news_trading: PropFirmNewsTrading;
  ea_allowed: boolean;
  copy_trading: string;
  mandatory_stop_loss: boolean;
  inactivity_limit_days: NullableStringOrNumber;
  reset_discount: string;
}

export interface PropFirmModel {
  firm_name: string;
  account_model: string;
  account_size: number;
  rules: PropFirmRules;
}
