create table if not exists public.fit_data (id text not null, user_id uuid not null references auth.users(id) on delete cascade, data jsonb not null, updated_at timestamptz not null default now(), primary key (user_id,id));
create index if not exists fit_data_user_idx on public.fit_data(user_id);
alter table public.fit_data enable row level security;
create policy "Fit user can read own rows" on public.fit_data for select to authenticated using (auth.uid()=user_id);
create policy "Fit user can insert own rows" on public.fit_data for insert to authenticated with check (auth.uid()=user_id);
create policy "Fit user can update own rows" on public.fit_data for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "Fit user can delete own rows" on public.fit_data for delete to authenticated using (auth.uid()=user_id);
