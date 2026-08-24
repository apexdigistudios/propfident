-- Propfident canonical Supabase schema
--
-- This file describes the current runtime architecture. `mt5_accounts` is the
-- single trading-account table for both manual Free accounts and automated
-- MetaApi accounts. The older `prop_accounts` table is intentionally absent.
-- Run against a fresh Supabase project after auth.users is available.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- Profiles and subscription state
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro', 'elite')),
  -- Billing is currently represented by the profile tier. No payment provider
  -- or subscription API is used by the application yet.
  subscription_status TEXT NOT NULL DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing')),
  telegram_chat_id TEXT,
  telegram_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Trading accounts: manual Free and automated MetaApi paid connections
-- ============================================================================

CREATE TABLE public.mt5_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  -- Manual accounts do not collect credentials. MetaApi accounts require the
  -- investor/trader password at connection time.
  account_password TEXT,
  broker_name TEXT NOT NULL,
  broker_server TEXT,
  platform TEXT NOT NULL DEFAULT 'MT5'
    CHECK (platform IN ('MT4', 'MT5')),
  connection_type TEXT NOT NULL DEFAULT 'metaapi'
    CHECK (connection_type IN ('manual', 'metaapi')),
  metaapi_account_id TEXT UNIQUE,
  connection_status TEXT NOT NULL DEFAULT 'CONNECTING'
    CHECK (connection_status IN ('CONNECTING', 'SYNCING', 'CONNECTED', 'ERROR', 'DISCONNECTED')),

  account_type TEXT NOT NULL DEFAULT 'evaluation'
    CHECK (account_type IN ('evaluation', 'verification', 'funded')),
  account_currency TEXT NOT NULL DEFAULT 'USD',
  currency TEXT NOT NULL DEFAULT 'USD',
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (initial_balance >= 0),
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  equity NUMERIC(15, 2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  current_equity NUMERIC(15, 2) NOT NULL DEFAULT 0,
  high_water_mark NUMERIC(15, 2) NOT NULL DEFAULT 0,
  max_total_drawdown_pct NUMERIC(5, 2) NOT NULL DEFAULT 10
    CHECK (max_total_drawdown_pct > 0 AND max_total_drawdown_pct <= 100),
  max_daily_drawdown_pct NUMERIC(5, 2) NOT NULL DEFAULT 5
    CHECK (max_daily_drawdown_pct > 0 AND max_daily_drawdown_pct <= 100),
  daily_starting_balance NUMERIC(15, 2),
  drawdown_type TEXT NOT NULL DEFAULT 'trailing'
    CHECK (drawdown_type IN ('static', 'trailing', 'balance_based')),
  drawdown_status TEXT NOT NULL DEFAULT 'SAFE'
    CHECK (drawdown_status IN ('SAFE', 'WARNING', 'CRITICAL', 'BREACHED')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_breached BOOLEAN NOT NULL DEFAULT FALSE,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Manual records have no MetaApi identity or broker server. Automated
  -- records must have the MetaApi connection marker and credentials are kept
  -- nullable for the manual path only.
  CONSTRAINT mt5_accounts_connection_consistency CHECK (
    (connection_type = 'manual' AND metaapi_account_id IS NULL)
    OR connection_type = 'metaapi'
  )
);

-- ============================================================================
-- Trade journal: manual entries and MetaApi-synced deals share one table
-- ============================================================================

CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.mt5_accounts(id) ON DELETE SET NULL,
  -- MetaApi deal identity. Manual entries leave this null.
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

-- Alerts are delivered by /api/notify/telegram from the drawdown webhook. The
-- current application does not persist alert rows, so no unused notifications
-- table is introduced here.

-- ============================================================================
-- User profile creation and shared timestamps
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_drawdown_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  max_floor NUMERIC;
  daily_floor NUMERIC;
  breach_floor NUMERIC;
  buffer_usd NUMERIC;
  buffer_pct NUMERIC;
  daily_base NUMERIC;
  effective_hwm NUMERIC;
BEGIN
  effective_hwm := GREATEST(
    COALESCE(NEW.high_water_mark, NEW.initial_balance),
    COALESCE(NEW.current_equity, 0),
    COALESCE(NEW.current_balance, 0)
  );

  IF NEW.drawdown_type = 'trailing' THEN
    max_floor := LEAST(
      effective_hwm * (1 - NEW.max_total_drawdown_pct / 100.0),
      NEW.initial_balance
    );
  ELSIF NEW.drawdown_type = 'balance_based' THEN
    max_floor := NEW.current_balance * (1 - NEW.max_total_drawdown_pct / 100.0);
  ELSE
    max_floor := NEW.initial_balance * (1 - NEW.max_total_drawdown_pct / 100.0);
  END IF;

  daily_base := COALESCE(NEW.daily_starting_balance, NEW.initial_balance);
  daily_floor := daily_base * (1 - NEW.max_daily_drawdown_pct / 100.0);
  breach_floor := GREATEST(max_floor, daily_floor);
  buffer_usd := NEW.current_equity - breach_floor;

  IF NEW.initial_balance > 0 THEN
    buffer_pct := (buffer_usd / NEW.initial_balance) * 100.0;
  ELSE
    buffer_pct := 100;
  END IF;

  IF buffer_usd <= 0 THEN
    NEW.drawdown_status := 'BREACHED';
    NEW.is_breached := TRUE;
  ELSIF buffer_pct <= 1.5 THEN
    NEW.drawdown_status := 'CRITICAL';
    NEW.is_breached := FALSE;
  ELSIF buffer_pct <= 3.5 THEN
    NEW.drawdown_status := 'WARNING';
    NEW.is_breached := FALSE;
  ELSE
    NEW.drawdown_status := 'SAFE';
    NEW.is_breached := FALSE;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER mt5_accounts_updated_at
BEFORE UPDATE ON public.mt5_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER mt5_accounts_drawdown_status
BEFORE INSERT OR UPDATE OF current_equity, current_balance, high_water_mark,
  initial_balance, max_total_drawdown_pct, max_daily_drawdown_pct, drawdown_type
ON public.mt5_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_drawdown_status();

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX idx_profiles_email ON public.profiles (email);
CREATE INDEX idx_mt5_accounts_user_id ON public.mt5_accounts (user_id);
CREATE INDEX idx_mt5_accounts_user_active_created
  ON public.mt5_accounts (user_id, is_active, created_at DESC);
CREATE INDEX idx_mt5_accounts_metaapi_account_id
  ON public.mt5_accounts (metaapi_account_id);
CREATE INDEX idx_trades_user_open_time ON public.trades (user_id, open_time DESC);
CREATE INDEX idx_trades_account_id ON public.trades (account_id);
CREATE INDEX idx_trades_deal_id ON public.trades (deal_id);
CREATE INDEX idx_calculator_presets_user_id ON public.calculator_presets (user_id);

-- ============================================================================
-- Row-level security
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mt5_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculator_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY mt5_accounts_select_own ON public.mt5_accounts
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY mt5_accounts_insert_own ON public.mt5_accounts
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY mt5_accounts_update_own ON public.mt5_accounts
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY mt5_accounts_delete_own ON public.mt5_accounts
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
        AND schemaname = 'public' AND tablename = 'mt5_accounts'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.mt5_accounts;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public' AND tablename = 'trades'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
    END IF;
  END IF;
END;
$$;
