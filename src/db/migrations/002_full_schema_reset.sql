-- ============================================================================
-- Propfident: Full Schema Reset (aligns with Supabase production migration)
-- ============================================================================
-- Drops trades/prop_accounts/profiles, recreates with updated columns,
-- installs drawdown status trigger, and enables RLS with user policies.
--
-- NOTE: auth.users / auth.uid() are Supabase-specific schemas that only exist
--       in the hosted Supabase project. In local dev we stub `auth.uid()` so
--       the RLS statements apply cleanly. The provided migration SQL above is
--       the canonical production version.
-- ============================================================================

-- ── 1. Drop preexisting drift ──────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_update_drawdown_status ON public.prop_accounts;
DROP TRIGGER IF EXISTS trigger_update_drawdown_status ON public.prop_accounts;
DROP FUNCTION IF EXISTS public.update_drawdown_status();
DROP TABLE IF EXISTS public.trades CASCADE;
DROP TABLE IF EXISTS public.prop_accounts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ── 2. profiles ────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro', 'elite')),
  telegram_chat_id TEXT,
  telegram_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. prop_accounts ──────────────────────────────────────────────────
CREATE TABLE public.prop_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  broker_name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('MT4', 'MT5')),
  account_number TEXT NOT NULL,
  metaapi_account_id TEXT UNIQUE,
  account_type TEXT NOT NULL DEFAULT 'evaluation'
    CHECK (account_type IN ('evaluation', 'verification', 'funded')),
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  current_balance NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  current_equity NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  high_water_mark NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  max_total_drawdown_pct NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  max_daily_drawdown_pct NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
  drawdown_type TEXT NOT NULL DEFAULT 'trailing'
    CHECK (drawdown_type IN ('static', 'trailing', 'balance_based')),
  drawdown_status TEXT NOT NULL DEFAULT 'SAFE'
    CHECK (drawdown_status IN ('SAFE', 'WARNING', 'CRITICAL', 'BREACHED')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_breached BOOLEAN NOT NULL DEFAULT FALSE,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. trades ──────────────────────────────────────────────────────────
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.prop_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ticket_id TEXT UNIQUE NOT NULL,
  symbol TEXT NOT NULL,
  trade_type TEXT NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
  lot_size NUMERIC(10, 2) NOT NULL,
  open_price NUMERIC(15, 5) NOT NULL,
  close_price NUMERIC(15, 5),
  stop_loss NUMERIC(15, 5),
  take_profit NUMERIC(15, 5),
  pnl NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  pips NUMERIC(10, 2) DEFAULT 0.00,
  r_multiple NUMERIC(6, 2),
  entry_time TIMESTAMPTZ NOT NULL,
  close_time TIMESTAMPTZ,
  setup_tag TEXT,
  notes TEXT,
  screenshot_url TEXT,
  auto_synced BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. Drawdown status trigger (same logic as provided) ────────────────
CREATE OR REPLACE FUNCTION public.update_drawdown_status()
RETURNS TRIGGER AS $$
DECLARE
  v_floor NUMERIC(15, 2);
  v_headroom_usd NUMERIC(15, 2);
  v_headroom_pct NUMERIC(10, 2);
  v_status TEXT;
BEGIN
  IF NEW.drawdown_type = 'trailing' THEN
    v_floor := NEW.high_water_mark * (1.0 - (NEW.max_total_drawdown_pct / 100.0));
  ELSE
    v_floor := NEW.initial_balance * (1.0 - (NEW.max_total_drawdown_pct / 100.0));
  END IF;

  v_headroom_usd := NEW.current_equity - v_floor;
  v_headroom_pct := (v_headroom_usd / NEW.initial_balance) * 100.0;

  IF NEW.current_equity <= v_floor THEN
    v_status := 'BREACHED';
    NEW.is_breached := TRUE;
  ELSIF v_headroom_pct <= 1.5 THEN
    v_status := 'CRITICAL';
  ELSIF v_headroom_pct <= 3.5 THEN
    v_status := 'WARNING';
  ELSE
    v_status := 'SAFE';
  END IF;

  NEW.drawdown_status := v_status;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_drawdown_status ON public.prop_accounts;
CREATE TRIGGER trigger_update_drawdown_status
BEFORE INSERT OR UPDATE OF current_equity, high_water_mark, current_balance,
                           initial_balance, max_total_drawdown_pct, drawdown_type
ON public.prop_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_drawdown_status();

-- ── 6. Row Level Security ─────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prop_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Local dev has no Supabase auth.uid(); we substitute a stub so that the
-- RLS statements below evaluate cleanly. In production, Supabase replaces
-- auth.uid() with its own implementation.
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
  SELECT NULL::UUID;
$$ LANGUAGE SQL STABLE;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own prop accounts"
  ON public.prop_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prop accounts"
  ON public.prop_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prop accounts"
  ON public.prop_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON public.trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);
