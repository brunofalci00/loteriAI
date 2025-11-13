-- 1. Criar tabela de perfis
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Habilitar RLS na tabela profiles
alter table public.profiles enable row level security;

-- 3. Políticas RLS - usuário só vê seu próprio perfil
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 4. Trigger para criar perfil automaticamente no signup
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
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Criar tabela de análises (cache automático)
create table public.lottery_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lottery_type text not null,
  contest_number integer not null,
  generated_numbers jsonb not null,
  hot_numbers integer[] not null,
  cold_numbers integer[] not null,
  accuracy_rate numeric(5,2) not null,
  strategy_type text not null,
  draws_analyzed integer not null,
  data_source text not null,
  analyzed_at timestamptz default now(),
  
  -- Anti-duplicação: um usuário não pode ter duas análises do mesmo concurso
  unique(user_id, lottery_type, contest_number),
  
  -- Validação de tipo de loteria
  constraint valid_lottery_type check (
    lottery_type in ('mega-sena', 'quina', 'lotofacil', 'lotomania', 
                     'dupla-sena', 'timemania', 'mais-milionaria', 'federal',
                     'dia-de-sorte', 'super-sete')
  ),
  
  -- Validação de acurácia
  constraint valid_accuracy check (accuracy_rate >= 0 and accuracy_rate <= 100)
);

-- 6. Índices para busca rápida
create index idx_lottery_analyses_user_type_contest 
  on public.lottery_analyses(user_id, lottery_type, contest_number);

create index idx_lottery_analyses_user_date 
  on public.lottery_analyses(user_id, analyzed_at desc);

-- 7. RLS na tabela de análises
alter table public.lottery_analyses enable row level security;

create policy "Users can view own analyses"
  on public.lottery_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.lottery_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own analyses"
  on public.lottery_analyses for delete
  using (auth.uid() = user_id);