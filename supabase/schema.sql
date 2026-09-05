create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price bigint not null default 0,
  description text not null,
  file_url text not null,
  image_url text,
  category text default 'Design',
  seller_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.products
add column if not exists seller_id uuid references public.profiles(id) on delete set null;

alter table public.profiles enable row level security;
alter table public.products enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Public profiles read" on public.profiles;
drop policy if exists "Allow public read access" on public.products;
drop policy if exists "Allow public insert access" on public.products;
drop policy if exists "Allow public update access" on public.products;
drop policy if exists "Allow public delete access" on public.products;
drop policy if exists "Public can read products" on public.products;
drop policy if exists "Sellers can insert own product" on public.products;
drop policy if exists "Owners and admins can update product" on public.products;
drop policy if exists "Owners and admins can delete product" on public.products;

create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Public can read products"
on public.products for select
using (true);

create policy "Sellers can insert own product"
on public.products for insert
with check (
  auth.uid() = seller_id
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('seller', 'admin')
  )
);

create policy "Owners and admins can update product"
on public.products for update
using (
  seller_id = auth.uid()
  or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  seller_id = auth.uid()
  or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Owners and admins can delete product"
on public.products for delete
using (
  seller_id = auth.uid()
  or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

