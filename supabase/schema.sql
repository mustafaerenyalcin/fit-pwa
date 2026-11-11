-- =====================================================================
-- Fit - Supabase şeması
-- Supabase panelinde: SQL Editor -> New query -> bu dosyanın tamamını yapıştır -> Run
-- Tekrar çalıştırmak güvenlidir (if not exists / drop policy if exists).
-- =====================================================================

-- 1) Kullanıcı verileri (senkronizasyon)
create table if not exists public.fit_data (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists fit_data_user_idx on public.fit_data(user_id);
alter table public.fit_data enable row level security;

drop policy if exists "Fit user can read own rows" on public.fit_data;
drop policy if exists "Fit user can insert own rows" on public.fit_data;
drop policy if exists "Fit user can update own rows" on public.fit_data;
drop policy if exists "Fit user can delete own rows" on public.fit_data;
create policy "Fit user can read own rows" on public.fit_data for select to authenticated using (auth.uid() = user_id);
create policy "Fit user can insert own rows" on public.fit_data for insert to authenticated with check (auth.uid() = user_id);
create policy "Fit user can update own rows" on public.fit_data for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Fit user can delete own rows" on public.fit_data for delete to authenticated using (auth.uid() = user_id);

-- 2) AI kullanım kotası (kullanıcı başına günlük limit)
--    Kullanıcı kendi satırlarını okuyabilir ve ekleyebilir; silemez/güncelleyemez.
create table if not exists public.ai_usage (
  id bigserial primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_user_time_idx on public.ai_usage(user_id, created_at desc);
alter table public.ai_usage enable row level security;

drop policy if exists "AI usage read own" on public.ai_usage;
drop policy if exists "AI usage insert own" on public.ai_usage;
create policy "AI usage read own" on public.ai_usage for select to authenticated using (auth.uid() = user_id);
create policy "AI usage insert own" on public.ai_usage for insert to authenticated with check (auth.uid() = user_id);

-- 3) Hesap silme (App Store zorunluluğu)
--    Kullanıcı yalnızca KENDİ hesabını silebilir. fit_data ve ai_usage "on delete cascade" ile silinir.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Giriş yapılmamış';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
