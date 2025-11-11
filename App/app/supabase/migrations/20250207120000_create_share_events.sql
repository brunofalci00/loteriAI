-- Create table to persist share tracking events
create table if not exists public.share_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    context text not null,
    lottery_type text,
    contest_number int,
    numbers_shared smallint,
    payload jsonb,
    message_length int,
    created_at timestamptz not null default timezone('utc', now())
);

comment on table public.share_events is 'Histórico de compartilhamentos feitos pelos usuários dentro do app.';

create index if not exists share_events_user_created_idx
    on public.share_events (user_id, created_at desc);

-- Enable RLS and limit inserts/selects ao próprio usuário autenticado
alter table public.share_events enable row level security;

drop policy if exists "share_events_insert_own" on public.share_events;
create policy "share_events_insert_own"
    on public.share_events
    for insert
    with check (auth.uid() = user_id);

drop policy if exists "share_events_select_own" on public.share_events;
create policy "share_events_select_own"
    on public.share_events
    for select
    using (auth.uid() = user_id);
