-- ============================================================================
-- Propfident: Drawdown Status Trigger + Telegram Alerts Schema
-- ============================================================================
-- Adds:
--   1. `prop_accounts.drawdown_status` column
--   2. `profiles.telegram_chat_id` + `profiles.telegram_alerts_enabled`
--   3. `update_drawdown_status()` trigger function
--   4. Trigger that recomputes status before UPDATE
-- ============================================================================

-- 1. Ensure required columns exist
ALTER TABLE public.prop_accounts
  ADD COLUMN IF NOT EXISTS drawdown_status TEXT NOT NULL DEFAULT 'SAFE'
  CHECK (drawdown_status IN ('SAFE', 'WARNING', 'CRITICAL', 'BREACHED'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Trigger function: computes drawdown_status BEFORE the row update fires
CREATE OR REPLACE FUNCTION public.update_drawdown_status()
RETURNS TRIGGER AS $$
DECLARE
  drawdown_floor NUMERIC;
  headroom_pct NUMERIC;
  max_dd_pct NUMERIC;
  initial_bal NUMERIC;
  new_equity NUMERIC;
  hwm NUMERIC;
  dd_type TEXT;
BEGIN
  initial_bal := COALESCE(NEW.initial_balance, 0);
  new_equity := COALESCE(NEW.current_equity, 0);
  hwm := COALESCE(NEW.high_water_mark, initial_bal);
  max_dd_pct := COALESCE(NEW.max_total_drawdown_pct, 10);
  dd_type := COALESCE(NEW.drawdown_type, 'trailing');

  -- Compute drawdown floor based on type
  IF dd_type = 'static' THEN
    drawdown_floor := initial_bal * (1 - max_dd_pct / 100.0);
  ELSE
    -- trailing or balance_based
    drawdown_floor := hwm * (1 - max_dd_pct / 100.0);
  END IF;

  -- Headroom as % of initial balance
  IF initial_bal > 0 THEN
    headroom_pct := ((new_equity - drawdown_floor) / initial_bal) * 100.0;
  ELSE
    headroom_pct := 100;
  END IF;

  -- Determine status
  IF new_equity <= drawdown_floor THEN
    NEW.drawdown_status := 'BREACHED';
    NEW.is_breached := TRUE;
  ELSIF headroom_pct <= 1.5 THEN
    NEW.drawdown_status := 'CRITICAL';
  ELSIF headroom_pct <= 3.5 THEN
    NEW.drawdown_status := 'WARNING';
  ELSE
    NEW.drawdown_status := 'SAFE';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger: fire on any INSERT or UPDATE that changes equity/HWM/balance
DROP TRIGGER IF EXISTS trg_update_drawdown_status ON public.prop_accounts;

CREATE TRIGGER trg_update_drawdown_status
  BEFORE INSERT OR UPDATE OF current_equity, high_water_mark, current_balance,
                             initial_balance, max_total_drawdown_pct, drawdown_type
  ON public.prop_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_drawdown_status();

-- 4. (Supabase-only) Notify webhook to POST to /api/notify/telegram
--    Uncomment the pg_net section below when running on Supabase.
--    Requires `pg_net` extension enabled and NEXT_PUBLIC_APP_URL set.
-- ============================================================================
-- CREATE EXTENSION IF NOT EXISTS pg_net;
--
-- CREATE OR REPLACE FUNCTION public.notify_telegram_on_status_change()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF NEW.drawdown_status IN ('WARNING', 'CRITICAL', 'BREACHED')
--      AND NEW.drawdown_status IS DISTINCT FROM OLD.drawdown_status THEN
--     PERFORM net.http_post(
--       url := current_setting('app.settings.webhook_url'),
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer ' || current_setting('app.settings.webhook_secret')
--       ),
--       body := jsonb_build_object(
--         'user_id', NEW.user_id,
--         'account_id', NEW.id,
--         'account_number', NEW.account_number,
--         'account_name', NEW.account_name,
--         'current_equity', NEW.current_equity,
--         'drawdown_status', NEW.drawdown_status
--       )
--     );
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
--
-- DROP TRIGGER IF EXISTS trg_notify_telegram ON public.prop_accounts;
-- CREATE TRIGGER trg_notify_telegram
--   AFTER UPDATE OF drawdown_status ON public.prop_accounts
--   FOR EACH ROW
--   EXECUTE FUNCTION public.notify_telegram_on_status_change();
