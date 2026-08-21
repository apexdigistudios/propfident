-- ========================================================
-- CLEAN DATABASE RESET & SCHEMA DEPLOYMENT
-- ========================================================

-- Drop all old tables in reverse dependency order
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS prop_accounts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. PROFILES TABLE
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  telegram_chat_id TEXT,
  telegram_alerts_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROP ACCOUNTS TABLE
CREATE TABLE prop_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  broker_name TEXT NOT NULL,
  platform VARCHAR(10) NOT NULL DEFAULT 'MT5',
  account_number TEXT NOT NULL,
  metaapi_account_id TEXT,
  account_type VARCHAR(20) NOT NULL DEFAULT 'evaluation'
    CHECK (account_type IN ('evaluation', 'verification', 'funded')),
  account_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  current_balance NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  current_equity NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  high_water_mark NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  max_total_drawdown_pct NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  max_daily_drawdown_pct NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
  daily_starting_balance NUMERIC(15, 2),
  drawdown_type VARCHAR(20) NOT NULL DEFAULT 'trailing', -- 'trailing', 'static', 'balance-based'
  drawdown_status VARCHAR(20) DEFAULT 'SAFE', -- 'SAFE', 'WARNING', 'CRITICAL', 'BREACHED'
  is_active BOOLEAN DEFAULT TRUE,
  is_breached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prop_accounts_user_active
  ON prop_accounts (user_id, is_active DESC, created_at DESC);

-- 3. TRADES TABLE
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES prop_accounts(id) ON DELETE SET NULL,
  deal_id TEXT UNIQUE, -- MetaApi deal ticket for idempotent upserts
  symbol VARCHAR(20) NOT NULL,
  action VARCHAR(10) NOT NULL DEFAULT 'BUY', -- 'BUY', 'SELL'
  open_price NUMERIC(15, 5) NOT NULL,
  close_price NUMERIC(15, 5),
  stop_loss NUMERIC(15, 5),
  take_profit NUMERIC(15, 5),
  volume NUMERIC(10, 2) NOT NULL, -- Lot size
  pnl NUMERIC(15, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'CLOSED', -- 'OPEN', 'WIN', 'LOSS', 'BE', 'CLOSED'
  notes TEXT,
  tags TEXT[],
  open_time TIMESTAMPTZ DEFAULT NOW(),
  close_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trades_user_open_time ON trades (user_id, open_time DESC);
CREATE INDEX idx_trades_account_id ON trades (account_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prop_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Users manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users manage own prop accounts" ON prop_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own trades" ON trades
  FOR ALL USING (auth.uid() = user_id);

-- TRIGGER FOR AUTOMATIC PROFILE CREATION ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$ BEGIN   INSERT INTO public.profiles (id, email, full_name)   VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');   RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================
-- DRAWDOWN STATUS AUTOMATION
-- Recomputes drawdown_status + is_breached whenever equity,
-- balance, HWM, or the risk rules change, so the Drawdown
-- Shield stays in sync without app-side polling.
-- ========================================================
CREATE OR REPLACE FUNCTION public.update_drawdown_status()
RETURNS TRIGGER AS $$
DECLARE
  v_effective_hwm NUMERIC(15, 2);
  v_max_floor NUMERIC(15, 2);
  v_daily_floor NUMERIC(15, 2);
  v_breach_floor NUMERIC(15, 2);
  v_buffer_usd NUMERIC(15, 2);
  v_buffer_pct NUMERIC(10, 2);
  v_daily_base NUMERIC(15, 2);
BEGIN
  v_effective_hwm := GREATEST(
    COALESCE(NEW.high_water_mark, NEW.initial_balance),
    COALESCE(NEW.current_equity, 0),
    COALESCE(NEW.current_balance, 0)
  );

  IF NEW.drawdown_type = 'trailing' THEN
    v_max_floor := LEAST(
      v_effective_hwm * (1.0 - NEW.max_total_drawdown_pct / 100.0),
      NEW.initial_balance
    );
  ELSIF NEW.drawdown_type IN ('balance-based', 'balance_based') THEN
    v_max_floor := NEW.current_balance * (1.0 - NEW.max_total_drawdown_pct / 100.0);
  ELSE
    v_max_floor := NEW.initial_balance * (1.0 - NEW.max_total_drawdown_pct / 100.0);
  END IF;

  v_daily_base := COALESCE(NEW.daily_starting_balance, NEW.initial_balance);
  v_daily_floor := v_daily_base * (1.0 - NEW.max_daily_drawdown_pct / 100.0);

  v_breach_floor := GREATEST(v_max_floor, v_daily_floor);
  v_buffer_usd := NEW.current_equity - v_breach_floor;

  IF NEW.initial_balance > 0 THEN
    v_buffer_pct := (v_buffer_usd / NEW.initial_balance) * 100.0;
  ELSE
    v_buffer_pct := 100;
  END IF;

  IF v_buffer_usd <= 0 THEN
    NEW.drawdown_status := 'BREACHED';
    NEW.is_breached := TRUE;
  ELSIF v_buffer_pct <= 1.5 THEN
    NEW.drawdown_status := 'CRITICAL';
  ELSIF v_buffer_pct <= 3.5 THEN
    NEW.drawdown_status := 'WARNING';
  ELSE
    NEW.drawdown_status := 'SAFE';
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_drawdown_status ON prop_accounts;
CREATE TRIGGER trigger_update_drawdown_status
  BEFORE INSERT OR UPDATE OF current_equity, current_balance, high_water_mark,
                             initial_balance, max_total_drawdown_pct,
                             max_daily_drawdown_pct, drawdown_type
  ON prop_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_drawdown_status();
