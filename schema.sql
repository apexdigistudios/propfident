-- Propfident Supabase schema
-- Fresh database schema for the current Next.js application.
-- Run this in the Supabase SQL Editor after confirming the project auth schema exists.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- Profiles
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro', 'elite')),
  telegram_chat_id TEXT,
  telegram_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- MT5 accounts: canonical account source for the dashboard and integrations
-- ============================================================================

CREATE TABLE public.mt5_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Current application names
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_password TEXT,
  broker_name TEXT NOT NULL,
  broker_server TEXT,

  -- Explicit MT5 integration names retained for direct SQL/API consumers
  login_id TEXT,
  password TEXT,
  server TEXT,
  broker TEXT,
  platform TEXT NOT NULL DEFAULT 'MT5' CHECK (platform = 'MT5'),
  connection_type TEXT NOT NULL DEFAULT 'metaapi'
    CHECK (connection_type IN ('manual', 'metaapi')),

  -- MetaApi provisioning and lifecycle state
  metaapi_account_id TEXT UNIQUE,
  connection_status TEXT NOT NULL DEFAULT 'CONNECTING'
    CHECK (connection_status IN ('CONNECTING', 'SYNCING', 'CONNECTED', 'ERROR', 'DISCONNECTED')),

  -- Account metadata and live trading metrics
  account_type TEXT NOT NULL DEFAULT 'evaluation'
    CHECK (account_type IN ('evaluation', 'verification', 'funded')),
  account_currency TEXT NOT NULL DEFAULT 'USD',
  currency TEXT NOT NULL DEFAULT 'USD',
  leverage INTEGER NOT NULL DEFAULT 0 CHECK (leverage >= 0),
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  equity NUMERIC(15, 2) NOT NULL DEFAULT 0,

  -- Compatibility fields consumed by existing dashboard/risk code
  current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  current_equity NUMERIC(15, 2) NOT NULL DEFAULT 0,
  high_water_mark NUMERIC(15, 2) NOT NULL DEFAULT 0,
  max_total_drawdown_pct NUMERIC(5, 2) NOT NULL DEFAULT 10,
  max_daily_drawdown_pct NUMERIC(5, 2) NOT NULL DEFAULT 5,
  daily_starting_balance NUMERIC(15, 2),
  drawdown_type TEXT NOT NULL DEFAULT 'trailing'
    CHECK (drawdown_type IN ('static', 'trailing', 'balance_based')),
  drawdown_status TEXT NOT NULL DEFAULT 'SAFE'
    CHECK (drawdown_status IN ('SAFE', 'WARNING', 'CRITICAL', 'BREACHED')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_breached BOOLEAN NOT NULL DEFAULT FALSE,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Legacy prop_accounts compatibility table
-- The current runtime reads mt5_accounts, but this entity remains in Drizzle
-- and is retained for compatibility with older deployments/data exports.
-- ============================================================================

CREATE TABLE public.prop_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  broker_name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('MT4', 'MT5')),
  account_number TEXT NOT NULL,
  metaapi_account_id TEXT UNIQUE,
  account_type TEXT NOT NULL DEFAULT 'evaluation'
    CHECK (account_type IN ('evaluation', 'verification', 'funded')),
  account_currency TEXT NOT NULL DEFAULT 'USD',
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 100000,
  current_balance NUMERIC(15, 2) NOT NULL DEFAULT 100000,
  current_equity NUMERIC(15, 2) NOT NULL DEFAULT 100000,
  high_water_mark NUMERIC(15, 2) NOT NULL DEFAULT 100000,
  max_total_drawdown_pct NUMERIC(5, 2) NOT NULL DEFAULT 10,
  max_daily_drawdown_pct NUMERIC(5, 2) NOT NULL DEFAULT 5,
  daily_starting_balance NUMERIC(15, 2),
  drawdown_type TEXT NOT NULL DEFAULT 'trailing'
    CHECK (drawdown_type IN ('static', 'trailing', 'balance_based')),
  drawdown_status TEXT NOT NULL DEFAULT 'SAFE'
    CHECK (drawdown_status IN ('SAFE', 'WARNING', 'CRITICAL', 'BREACHED')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_breached BOOLEAN NOT NULL DEFAULT FALSE,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Trades and journal records
-- ============================================================================

CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.mt5_accounts(id) ON DELETE SET NULL,
  deal_id TEXT UNIQUE,
  symbol VARCHAR(20) NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('BUY', 'SELL')),
  open_price NUMERIC(15, 5) NOT NULL,
  close_price NUMERIC(15, 5),
  stop_loss NUMERIC(15, 5),
  take_profit NUMERIC(15, 5),
  volume NUMERIC(10, 2) NOT NULL,
  pnl NUMERIC(15, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN', 'WIN', 'LOSS', 'BE', 'CLOSED')),
  notes TEXT,
  tags TEXT[],
  open_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  close_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Calculator presets
-- ============================================================================

CREATE TABLE public.calculator_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preset_name TEXT NOT NULL,
  default_risk_pct NUMERIC(5, 2) DEFAULT 1,
  default_stop_loss_pips NUMERIC(6, 1) DEFAULT 15,
  pair_specifications JSONB NOT NULL DEFAULT '{"EURUSD": 10, "GBPUSD": 10, "XAUUSD": 100}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Shared timestamp and drawdown functions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''), '')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_drawdown_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  drawdown_floor NUMERIC;
  headroom_pct NUMERIC;
  initial_balance_value NUMERIC;
  current_equity_value NUMERIC;
  high_water_mark_value NUMERIC;
  max_drawdown_pct NUMERIC;
BEGIN
  initial_balance_value := COALESCE(NEW.initial_balance, 0);
  current_equity_value := COALESCE(NEW.current_equity, 0);
  high_water_mark_value := COALESCE(NEW.high_water_mark, initial_balance_value);
  max_drawdown_pct := COALESCE(NEW.max_total_drawdown_pct, 10);

  IF COALESCE(NEW.drawdown_type, 'trailing') = 'static' THEN
    drawdown_floor := initial_balance_value * (1 - max_drawdown_pct / 100.0);
  ELSE
    drawdown_floor := high_water_mark_value * (1 - max_drawdown_pct / 100.0);
  END IF;

  IF initial_balance_value > 0 THEN
    headroom_pct := ((current_equity_value - drawdown_floor) / initial_balance_value) * 100.0;
  ELSE
    headroom_pct := 100;
  END IF;

  IF current_equity_value <= drawdown_floor THEN
    NEW.drawdown_status := 'BREACHED';
    NEW.is_breached := TRUE;
  ELSIF headroom_pct <= 1.5 THEN
    NEW.drawdown_status := 'CRITICAL';
    NEW.is_breached := FALSE;
  ELSIF headroom_pct <= 3.5 THEN
    NEW.drawdown_status := 'WARNING';
    NEW.is_breached := FALSE;
  ELSE
    NEW.drawdown_status := 'SAFE';
    NEW.is_breached := FALSE;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX idx_profiles_email ON public.profiles (email);

CREATE INDEX idx_mt5_accounts_user_id
  ON public.mt5_accounts (user_id);
CREATE INDEX idx_mt5_accounts_user_active_created
  ON public.mt5_accounts (user_id, is_active, created_at DESC);
CREATE INDEX idx_mt5_accounts_metaapi_account_id
  ON public.mt5_accounts (metaapi_account_id);

CREATE INDEX idx_prop_accounts_user_id
  ON public.prop_accounts (user_id);
CREATE INDEX idx_prop_accounts_metaapi_account_id
  ON public.prop_accounts (metaapi_account_id);

CREATE INDEX idx_trades_user_id_open_time
  ON public.trades (user_id, open_time DESC);
CREATE INDEX idx_trades_account_id
  ON public.trades (account_id);
CREATE INDEX idx_trades_deal_id
  ON public.trades (deal_id);

CREATE INDEX idx_calculator_presets_user_id
  ON public.calculator_presets (user_id);

-- ============================================================================
-- Updated-at and drawdown triggers
-- ============================================================================

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER mt5_accounts_updated_at
BEFORE UPDATE ON public.mt5_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER prop_accounts_updated_at
BEFORE UPDATE ON public.prop_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER mt5_accounts_drawdown_status
BEFORE INSERT OR UPDATE OF current_equity, high_water_mark, current_balance,
  initial_balance, max_total_drawdown_pct, drawdown_type
ON public.mt5_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_drawdown_status();

CREATE TRIGGER prop_accounts_drawdown_status
BEFORE INSERT OR UPDATE OF current_equity, high_water_mark, current_balance,
  initial_balance, max_total_drawdown_pct, drawdown_type
ON public.prop_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_drawdown_status();

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mt5_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prop_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculator_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_insert_own ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_delete_own ON public.profiles
FOR DELETE USING (auth.uid() = id);

CREATE POLICY mt5_accounts_select_own ON public.mt5_accounts
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY mt5_accounts_insert_own ON public.mt5_accounts
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY mt5_accounts_update_own ON public.mt5_accounts
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY mt5_accounts_delete_own ON public.mt5_accounts
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY prop_accounts_select_own ON public.prop_accounts
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY prop_accounts_insert_own ON public.prop_accounts
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY prop_accounts_update_own ON public.prop_accounts
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY prop_accounts_delete_own ON public.prop_accounts
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY trades_select_own ON public.trades
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY trades_insert_own ON public.trades
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY trades_update_own ON public.trades
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY trades_delete_own ON public.trades
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY calculator_presets_select_own ON public.calculator_presets
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY calculator_presets_insert_own ON public.calculator_presets
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY calculator_presets_update_own ON public.calculator_presets
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY calculator_presets_delete_own ON public.calculator_presets
FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- Supabase Realtime
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'mt5_accounts'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.mt5_accounts;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'trades'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
    END IF;
  END IF;
END;
$$;
