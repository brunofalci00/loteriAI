-- =====================================================
-- Migration: Auto seed user_credits with 20 credits
-- Description: Ensures user_credits schema + default values and
--              extends handle_new_user trigger to grant credits automatically.
-- =====================================================

-- 1. Ensure user_credits table exists with the desired defaults
create table if not exists public.user_credits (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  credits_remaining integer not null default 20,
  credits_total integer not null default 20,
  last_reset_at timestamptz default now(),
  last_generation_at timestamptz,
  constraint user_credits_non_negative check (credits_remaining >= 0),
  constraint user_credits_not_above_total check (credits_remaining <= credits_total)
);

-- 2. Align existing columns with the new defaults (safe even if table already exists)
alter table if exists public.user_credits
  alter column credits_remaining set default 20;

alter table if exists public.user_credits
  alter column credits_total set default 20;

-- 3. Make sure RLS is enabled and the base policies exist
alter table if exists public.user_credits enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_credits'
      and policyname = 'Users can view own credits'
  ) then
    execute $$create policy "Users can view own credits"
      on public.user_credits for select
      using (auth.uid() = user_id);$$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_credits'
      and policyname = 'Users can update own credits'
  ) then
    execute $$create policy "Users can update own credits"
      on public.user_credits for update
      using (auth.uid() = user_id);$$;
  end if;
end$$;

-- 4. Recreate handle_new_user trigger function to also seed credits
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );

  insert into public.user_credits (user_id, credits_remaining, credits_total, last_reset_at, last_generation_at)
  values (new.id, 20, 20, now(), null)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Trigger remains the same (already created in previous migration)
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();

-- =====================================================
-- END OF MIGRATION
-- =====================================================
