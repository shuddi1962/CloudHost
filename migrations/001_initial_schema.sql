-- CloudHost Supabase Schema Migration
-- Run this entire file in the Supabase Dashboard SQL Editor

-- ============================
-- STEP 1: CREATE TABLES
-- ============================

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text,
  is_admin    boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. ORGANIZATIONS
create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 3. ORGANIZATION MEMBERS
create table if not exists public.organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  role            text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at      timestamptz default now(),
  unique(organization_id, user_id)
);

-- ============================
-- STEP 2: AUTO-PROFILE TRIGGER
-- ============================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Only the trigger can call this; block direct RPC calls
revoke execute on function public.handle_new_user() from public;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================
-- STEP 3: ENABLE RLS
-- ============================

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- ============================
-- STEP 4: RLS POLICIES
-- ============================

-- PROFILES
create policy "users_read_own_profile"
  on public.profiles for select
  to authenticated
  using ( (select auth.uid()) = id );

create policy "admins_read_all_profiles"
  on public.profiles for select
  to authenticated
  using ( (select auth.jwt() ->> 'email') in (
    select email from public.profiles where is_admin = true
  ) );

create policy "users_update_own_profile"
  on public.profiles for update
  to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

-- ORGANIZATIONS
create policy "members_read_orgs"
  on public.organizations for select
  to authenticated
  using (
    (select auth.uid()) in (
      select user_id from public.organization_members where organization_id = id
    )
    or (select auth.jwt() ->> 'email') in (
      select email from public.profiles where is_admin = true
    )
  );

create policy "admins_manage_orgs"
  on public.organizations for update
  to authenticated
  using ( (select auth.jwt() ->> 'email') in (select email from public.profiles where is_admin = true) )
  with check ( (select auth.jwt() ->> 'email') in (select email from public.profiles where is_admin = true) );

create policy "admins_delete_orgs"
  on public.organizations for delete
  to authenticated
  using ( (select auth.jwt() ->> 'email') in (select email from public.profiles where is_admin = true) );

-- ORGANIZATION MEMBERS
create policy "members_read_own_memberships"
  on public.organization_members for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "org_admins_read_members"
  on public.organization_members for select
  to authenticated
  using (
    (select auth.uid()) in (
      select user_id from public.organization_members
      where organization_id = organization_members.organization_id
      and role in ('owner', 'admin')
    )
    or (select auth.uid()) = user_id
  );

create policy "org_admins_manage_members"
  on public.organization_members for insert
  to authenticated
  with check (
    (select auth.uid()) in (
      select user_id from public.organization_members
      where organization_id = organization_members.organization_id
      and role in ('owner', 'admin')
    )
  );

create policy "org_admins_update_members"
  on public.organization_members for update
  to authenticated
  using (
    (select auth.uid()) in (
      select user_id from public.organization_members
      where organization_id = organization_members.organization_id
      and role in ('owner', 'admin')
    )
  )
  with check (
    (select auth.uid()) in (
      select user_id from public.organization_members
      where organization_id = organization_members.organization_id
      and role in ('owner', 'admin')
    )
  );

create policy "org_admins_delete_members"
  on public.organization_members for delete
  to authenticated
  using (
    (select auth.uid()) in (
      select user_id from public.organization_members
      where organization_id = organization_members.organization_id
      and role in ('owner', 'admin')
    )
  );
