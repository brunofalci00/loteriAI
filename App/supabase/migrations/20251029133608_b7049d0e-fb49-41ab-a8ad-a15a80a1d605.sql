-- Criar tabela de pagamentos
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  hubla_transaction_id text unique not null,
  hubla_invoice_id text,
  amount numeric not null,
  status text not null default 'active',
  product_name text,
  payment_method text,
  customer_name text,
  customer_email text not null,
  processed_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Habilitar RLS
alter table public.payments enable row level security;

-- Política: Usuários veem apenas seus próprios pagamentos
create policy "Users can view own payments"
on public.payments
for select
to authenticated
using (auth.uid() = user_id);

-- Índices para performance
create index idx_payments_user_id on public.payments(user_id);
create index idx_payments_transaction_id on public.payments(hubla_transaction_id);
create index idx_payments_status on public.payments(status);
create index idx_payments_email on public.payments(customer_email);