-- Allow Free users to create a non-credentialed manual tracking account.
ALTER TABLE public.mt5_accounts
  ALTER COLUMN account_password DROP NOT NULL,
  ALTER COLUMN broker_server DROP NOT NULL;

ALTER TABLE public.mt5_accounts
  ADD COLUMN IF NOT EXISTS connection_type TEXT NOT NULL DEFAULT 'metaapi';

ALTER TABLE public.mt5_accounts
  DROP CONSTRAINT IF EXISTS mt5_accounts_connection_type_check;

ALTER TABLE public.mt5_accounts
  ADD CONSTRAINT mt5_accounts_connection_type_check
  CHECK (connection_type IN ('manual', 'metaapi'));