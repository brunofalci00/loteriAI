--------------------------------------------------------------------------------
-- Mega da Virada: token economy + consume RPC
--------------------------------------------------------------------------------

-- 1) Wallet table -------------------------------------------------------------
create table if not exists public.mega_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  plan_type text not null default 'limited'
    check (plan_type in ('limited', 'unlimited')),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists mega_tokens_expires_idx
  on public.mega_tokens (expires_at);

alter table public.mega_tokens enable row level security;

create policy "mega_tokens_select_own"
  on public.mega_tokens
  for select
  using (auth.uid() = user_id);

-- writes happen through server-side routines (webhook / RPC)


-- 2) Ledger table -------------------------------------------------------------
create table if not exists public.mega_token_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null
    check (type in ('purchase', 'consumption', 'adjustment', 'refund')),
  feature text,
  amount integer not null,
  contest_number integer,
  lottery_type text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists mega_token_tx_user_idx
  on public.mega_token_transactions (user_id, created_at desc);

alter table public.mega_token_transactions enable row level security;

create policy "mega_token_transactions_select_own"
  on public.mega_token_transactions
  for select
  using (auth.uid() = user_id);


-- 3) RPC to consume tokens ----------------------------------------------------
create or replace function public.consume_mega_token(
  p_user_id uuid,
  p_feature text,
  p_amount integer default 20,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_expires timestamptz;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'Operação não permitida para este usuário.';
  end if;

  if p_amount <= 0 then
    raise exception 'Quantidade inválida.';
  end if;

  select balance, expires_at
    into v_balance, v_expires
    from public.mega_tokens
    where user_id = p_user_id
    for update;

  if not found then
    raise exception 'Saldo indisponível. Compre um pacote para participar do evento.';
  end if;

  if v_expires < now() then
    raise exception 'Seus tokens expiraram. Adquira um novo pacote.';
  end if;

  if v_balance < p_amount then
    raise exception 'Saldo insuficiente para esta ação.';
  end if;

  update public.mega_tokens
     set balance = balance - p_amount,
         updated_at = now()
   where user_id = p_user_id;

  insert into public.mega_token_transactions (
    user_id,
    type,
    feature,
    amount,
    metadata
  ) values (
    p_user_id,
    'consumption',
    coalesce(nullif(p_feature, ''), 'unspecified'),
    -1 * p_amount,
    coalesce(p_metadata, '{}'::jsonb)
  );

  return jsonb_build_object(
    'success', true,
    'balance', v_balance - p_amount,
    'expires_at', v_expires
  );
end;
$$;

grant execute on function public.consume_mega_token(uuid, text, integer, jsonb)
  to authenticated;
