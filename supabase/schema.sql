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

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  access_token text not null default encode(gen_random_bytes(32), 'hex'),
  product_id uuid references public.products(id) on delete set null,
  email text not null,
  amount bigint not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  provider_reference text unique,
  provider_notification_token text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.orders
add column if not exists access_token text;

update public.orders
set access_token = encode(gen_random_bytes(32), 'hex')
where access_token is null;

alter table public.orders
alter column access_token set default encode(gen_random_bytes(32), 'hex'),
alter column access_token set not null;

create unique index if not exists orders_access_token_idx
on public.orders(access_token);

alter table public.products
add column if not exists seller_id uuid references public.profiles(id) on delete set null;

alter table public.orders
add column if not exists provider_notification_token text;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Public profiles read" on public.profiles;
drop policy if exists "Allow public read access" on public.products;
drop policy if exists "Allow public insert access" on public.products;
drop policy if exists "Allow public update access" on public.products;
drop policy if exists "Allow public delete access" on public.products;
drop policy if exists "Public can read products" on public.products;
drop policy if exists "Anyone can insert product" on public.products;
drop policy if exists "Anyone can update product" on public.products;
drop policy if exists "Anyone can delete product" on public.products;
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

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and auth.uid() is not null then
    raise exception 'Profile role can only be changed by a trusted server administrator';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_role_change on public.profiles;
create trigger prevent_profile_role_change
before update on public.profiles
for each row execute procedure public.prevent_profile_role_change();

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

