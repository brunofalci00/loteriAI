--------------------------------------------------------------------------------
-- Migration: Remove Mega Tokens System
-- Date: 2025-01-13
-- Description: Remove exclusive mega_tokens tables and functions.
--              Event now uses unified user_credits system.
--
-- This migration:
-- 1. Drops the consume_mega_token RPC function
-- 2. Drops the expire_mega_tokens_job function
-- 3. Removes mega_token_transactions table
-- 4. Removes mega_tokens table
--
-- Note: This is safe to run as the system was only in beta and not in production.
--       If data retention is needed for audit, backup before migration.
--------------------------------------------------------------------------------

-- Drop RPC function for consuming mega tokens
drop function if exists public.consume_mega_token(uuid, text, integer, jsonb) cascade;

-- Drop job function for expiration
drop function if exists public.expire_mega_tokens_job() cascade;

-- Drop ledger table (transactions)
drop table if exists public.mega_token_transactions cascade;

-- Drop wallet table (tokens)
drop table if exists public.mega_tokens cascade;

-- Update schema comment
comment on schema public is 'Mega tokens system removed on 2025-01-13. Event now uses unified user_credits.';

--------------------------------------------------------------------------------
-- End of migration
--------------------------------------------------------------------------------
