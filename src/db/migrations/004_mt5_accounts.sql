-- Canonical MT5 account storage.
-- Existing prop_accounts rows are copied so current users keep their accounts.

CREATE TABLE IF NOT EXISTS public.mt5_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_password TEXT NOT NULL,
  broker_name TEXT NOT NULL,
  broker_server TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'MT5' CHECK (platform = 'MT5'),
  metaapi_account_id TEXT UNIQUE,
  connection_status TEXT NOT NULL DEFAULT 'CONNECTING'
    CHECK (connection_status IN ('CONNECTING', 'SYNCING', 'CONNECTED', 'ERROR', 'DISCONNECTED')),
  account_type TEXT NOT NULL DEFAULT 'evaluation'
    CHECK (account_type IN ('evaluation', 'verification', 'funded')),
  account_currency TEXT NOT NULL DEFAULT 'USD',
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  equity NUMERIC(15, 2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  current_equity NUMERIC(15, 2) NOT NULL DEFAULT 0,
  high_water_mark NUMERIC(15, 2) NOT NULL DEFAULT 0,
  max_total_drawdown_pct NUMERIC(5, 2) NOT NULL DEFAULT 10,
  max_daily_drawdown_pct NUMERIC(5, 2) NOT NULL DEFAULT 5,
  daily_starting_balance NUMERIC(15, 2),
  drawdown_type TEXT NOT NULL DEFAULT 'trailing',
  drawdown_status TEXT NOT NULL DEFAULT 'SAFE',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_breached BOOLEAN NOT NULL DEFAULT FALSE,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.mt5_accounts (
  id, user_id, account_name, account_number, account_password,
  broker_name, broker_server, platform, metaapi_account_id,
  connection_status, account_type, account_currency, initial_balance,
  balance, equity, current_balance, current_equity, high_water_mark,
  max_total_drawdown_pct, max_daily_drawdown_pct, daily_starting_balance,
  drawdown_type, drawdown_status, is_active, is_breached, last_synced_at,
  created_at, updated_at
)
SELECT
  p.id, p.user_id, p.account_name, p.account_number, '' AS account_password,
  p.broker_name, p.broker_name, p.platform,
  p.metaapi_account_id,
  CASE WHEN p.metaapi_account_id LIKE 'local_%' THEN 'SYNCING' ELSE 'CONNECTED' END,
  p.account_type, COALESCE(p.account_currency, 'USD'), p.initial_balance,
  p.current_balance, p.current_equity, p.current_balance, p.current_equity,
  p.high_water_mark, p.max_total_drawdown_pct, p.max_daily_drawdown_pct,
  p.daily_starting_balance, p.drawdown_type, p.drawdown_status, p.is_active,
  p.is_breached, p.last_synced_at, p.created_at, p.updated_at
FROM public.prop_accounts p
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.trades DROP CONSTRAINT IF EXISTS trades_account_id_fkey;
ALTER TABLE public.trades
  ADD CONSTRAINT trades_account_id_fkey
  FOREIGN KEY (account_id) REFERENCES public.mt5_accounts(id) ON DELETE SET NULL;

ALTER TABLE public.mt5_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own MT5 accounts" ON public.mt5_accounts;
DROP POLICY IF EXISTS "Users can insert own MT5 accounts" ON public.mt5_accounts;
DROP POLICY IF EXISTS "Users can update own MT5 accounts" ON public.mt5_accounts;
DROP POLICY IF EXISTS "Users can delete own MT5 accounts" ON public.mt5_accounts;
CREATE POLICY "Users can view own MT5 accounts" ON public.mt5_accounts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own MT5 accounts" ON public.mt5_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own MT5 accounts" ON public.mt5_accounts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own MT5 accounts" ON public.mt5_accounts
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_mt5_accounts_user_active
  ON public.mt5_accounts (user_id, is_active, created_at DESC);

DROP TRIGGER IF EXISTS trigger_update_mt5_drawdown_status ON public.mt5_accounts;
CREATE TRIGGER trigger_update_mt5_drawdown_status
BEFORE INSERT OR UPDATE OF current_equity, high_water_mark, current_balance,
                           initial_balance, max_total_drawdown_pct, drawdown_type
ON public.mt5_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_drawdown_status();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1
       FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'mt5_accounts'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mt5_accounts;
  END IF;
END $$;
