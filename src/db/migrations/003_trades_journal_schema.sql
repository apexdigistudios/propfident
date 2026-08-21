-- ============================================================================
-- Migration 003: Rebuild trades table for the repaired journal pipeline
-- ============================================================================
DROP TABLE IF EXISTS public.trades CASCADE;

CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.prop_accounts(id) ON DELETE SET NULL,
  symbol VARCHAR(20) NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('BUY', 'SELL')),
  open_price NUMERIC(15, 5) NOT NULL,
  close_price NUMERIC(15, 5),
  stop_loss NUMERIC(15, 5),
  take_profit NUMERIC(15, 5),
  volume NUMERIC(10, 2) NOT NULL,
  pnl NUMERIC(15, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'OPEN'
    CHECK (status IN ('OPEN', 'WIN', 'LOSS', 'BE', 'CLOSED')),
  notes TEXT,
  tags TEXT[],
  open_time TIMESTAMPTZ DEFAULT NOW(),
  close_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own trades" ON public.trades;
CREATE POLICY "Users can manage own trades"
  ON public.trades
  FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_trades_user_open_time
  ON public.trades (user_id, open_time DESC);

CREATE INDEX idx_trades_account_id
  ON public.trades (account_id);
