create extension if not exists "pgcrypto";

create table if not exists public.prompt_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  prompt text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists prompt_history_user_prompt_unique
  on public.prompt_history (user_id, prompt);

alter table public.prompt_history enable row level security;

create policy "Users can read their prompt history"
  on public.prompt_history
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their prompt history"
  on public.prompt_history
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their prompt history"
  on public.prompt_history
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their prompt history"
  on public.prompt_history
  for delete
  using (auth.uid() = user_id);
