-- =====================================================================
-- FIT Atelier - Çoklu Hesaplı Aile & Squad Planı (4 Kişilik)
-- Supabase Dashboard -> SQL Editor -> New Query -> Çalıştırın.
-- Her üye KENDİ hesabıyla (E-posta / Google / Apple) giriş yapar;
-- sahip (owner) davet kodu veya bağlantı paylaşır, max 3 arkadaş katılır.
-- Tekrar çalıştırılması güvenlidir (idempotent).
-- =====================================================================

-- 1) Aile / Squad Grupları
create table if not exists public.family_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  owner_name text not null default 'Aile Kaptanı',
  invite_code text not null unique,
  max_seats int not null default 4 check (max_seats between 2 and 6),
  created_at timestamptz not null default now()
);

-- 2) Aile / Squad Üyeleri (Her kullanıcının kendi hesabı bağlanır)
create table if not exists public.family_members (
  group_id uuid not null references public.family_groups(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  member_name text not null default 'Sporcu',
  member_email text,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists family_members_group_idx on public.family_members(group_id);
create index if not exists family_groups_code_idx on public.family_groups(invite_code);

alter table public.family_groups enable row level security;
alter table public.family_members enable row level security;

drop policy if exists "Family group members can read group" on public.family_groups;
create policy "Family group members can read group"
  on public.family_groups for select to authenticated
  using (
    owner_id = auth.uid() or
    exists (
      select 1 from public.family_members fm
      where fm.group_id = family_groups.id and fm.user_id = auth.uid()
    )
  );

drop policy if exists "Family members can read squad roster" on public.family_members;
create policy "Family members can read squad roster"
  on public.family_members for select to authenticated
  using (
    exists (
      select 1 from public.family_members self_row
      where self_row.group_id = family_members.group_id and self_row.user_id = auth.uid()
    )
  );

-- 3) Yardımcı: Grup JSON'unu döndür
create or replace function public._build_family_payload(p_group_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.family_groups%rowtype;
  v_members jsonb;
begin
  select * into v_group from public.family_groups where id = p_group_id;
  if not found then
    return null;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'userId', fm.user_id,
        'name', fm.member_name,
        'email', fm.member_email,
        'role', fm.role,
        'joinedAt', fm.joined_at
      )
      order by (fm.role = 'owner') desc, fm.joined_at asc
    ),
    '[]'::jsonb
  )
  into v_members
  from public.family_members fm
  where fm.group_id = p_group_id;

  return jsonb_build_object(
    'id', v_group.id,
    'ownerId', v_group.owner_id,
    'ownerName', v_group.owner_name,
    'inviteCode', v_group.invite_code,
    'maxSeats', v_group.max_seats,
    'members', v_members
  );
end;
$$;

-- 4) RPC: Aile Planı Oluştur veya Mevcut Olanı Getir (Owner)
create or replace function public.create_or_get_family_group(
  p_owner_name text default null,
  p_custom_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_existing_group uuid;
  v_code text;
  v_new_id uuid;
begin
  if v_uid is null then
    raise exception 'Giriş yapılmamış';
  end if;

  select email into v_email from auth.users where id = v_uid;

  select group_id into v_existing_group
  from public.family_members
  where user_id = v_uid
  limit 1;

  if v_existing_group is not null then
    return public._build_family_payload(v_existing_group);
  end if;

  v_code := coalesce(
    nullif(upper(trim(p_custom_code)), ''),
    'FIT-FAM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  );

  insert into public.family_groups (owner_id, owner_name, invite_code, max_seats)
  values (v_uid, coalesce(nullif(trim(p_owner_name), ''), split_part(coalesce(v_email, 'Kaptan'), '@', 1)), v_code, 4)
  returning id into v_new_id;

  insert into public.family_members (group_id, user_id, member_name, member_email, role)
  values (
    v_new_id,
    v_uid,
    coalesce(nullif(trim(p_owner_name), ''), split_part(coalesce(v_email, 'Kaptan'), '@', 1)),
    v_email,
    'owner'
  );

  return public._build_family_payload(v_new_id);
end;
$$;

-- 5) RPC: Davet Kodu / Linki ile Kendi Hesabından Katıl (Arkadaş)
create or replace function public.join_family_by_code(
  p_code text,
  p_member_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_group public.family_groups%rowtype;
  v_current_count int;
  v_existing_group uuid;
begin
  if v_uid is null then
    raise exception 'Giriş yapılmamış';
  end if;

  select email into v_email from auth.users where id = v_uid;

  select * into v_group
  from public.family_groups
  where upper(invite_code) = upper(trim(coalesce(p_code, '')))
  limit 1;

  if not found then
    raise exception 'DAVET_KODU_BULUNAMADI';
  end if;

  select group_id into v_existing_group
  from public.family_members
  where user_id = v_uid
  limit 1;

  if v_existing_group = v_group.id then
    return public._build_family_payload(v_group.id);
  elsif v_existing_group is not null then
    raise exception 'ZATEN_BASKA_AILE_GRUBUNDA';
  end if;

  select count(*) into v_current_count
  from public.family_members
  where group_id = v_group.id;

  if v_current_count >= v_group.max_seats then
    raise exception 'AILE_DOLU_MAX_SEAT';
  end if;

  insert into public.family_members (group_id, user_id, member_name, member_email, role)
  values (
    v_group.id,
    v_uid,
    coalesce(nullif(trim(p_member_name), ''), split_part(coalesce(v_email, 'Arkadaş'), '@', 1)),
    v_email,
    'member'
  );

  return public._build_family_payload(v_group.id);
end;
$$;

-- 6) RPC: Kullanıcının Mevcut Aile Planı Durumunu Getir
create or replace function public.get_my_family_status()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_group_id uuid;
begin
  if v_uid is null then
    return null;
  end if;

  select group_id into v_group_id
  from public.family_members
  where user_id = v_uid
  limit 1;

  if v_group_id is null then
    return null;
  end if;

  return public._build_family_payload(v_group_id);
end;
$$;

-- 7) RPC: Üyeyi Çıkar (Owner) veya Gruptan Ayrıl (Member)
create or replace function public.leave_or_remove_family_member(
  p_target_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_target uuid := coalesce(p_target_user_id, v_uid);
  v_group public.family_groups%rowtype;
begin
  if v_uid is null then
    raise exception 'Giriş yapılmamış';
  end if;

  select fg.* into v_group
  from public.family_groups fg
  join public.family_members fm on fm.group_id = fg.id
  where fm.user_id = v_target
  limit 1;

  if not found then
    return null;
  end if;

  -- Yalnızca kişi kendisi ayrılabilir veya grup sahibi üyeyi çıkarabilir
  if v_uid <> v_target and v_group.owner_id <> v_uid then
    raise exception 'YETKISIZ_ISLEM';
  end if;

  if v_target = v_group.owner_id then
    delete from public.family_groups where id = v_group.id;
    return null;
  end if;

  delete from public.family_members
  where group_id = v_group.id and user_id = v_target;

  return public._build_family_payload(v_group.id);
end;
$$;

revoke all on function public._build_family_payload(uuid) from public, anon, authenticated;
revoke all on function public.create_or_get_family_group(text, text) from public, anon;
revoke all on function public.join_family_by_code(text, text) from public, anon;
revoke all on function public.get_my_family_status() from public, anon;
revoke all on function public.leave_or_remove_family_member(uuid) from public, anon;

grant execute on function public.create_or_get_family_group(text, text) to authenticated;
grant execute on function public.join_family_by_code(text, text) to authenticated;
grant execute on function public.get_my_family_status() to authenticated;
grant execute on function public.leave_or_remove_family_member(uuid) to authenticated;
