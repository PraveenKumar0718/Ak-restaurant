-- AK Biryani House production database for Supabase
-- Run this in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null default ('AKBH' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  phone text not null,
  address text not null,
  landmark text,
  payment_method text not null check (payment_method in ('cod','upi','card')),
  status text not null default 'placed' check (status in ('placed','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  items jsonb not null,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 40,
  total numeric(10,2) not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.orders enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

drop policy if exists "profiles own read" on public.profiles;
create policy "profiles own read" on public.profiles for select using (id = auth.uid() or public.is_admin());

drop policy if exists "orders own insert" on public.orders;
create policy "orders own insert" on public.orders for insert with check (auth.uid() = user_id);

drop policy if exists "orders own read" on public.orders;
create policy "orders own read" on public.orders for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "admin orders update" on public.orders;
create policy "admin orders update" on public.orders for update using (public.is_admin()) with check (public.is_admin());

-- After you create/login the owner account, find its UUID in
-- Authentication -> Users and run:
-- update public.profiles set role='admin' where id='OWNER-USER-UUID';
