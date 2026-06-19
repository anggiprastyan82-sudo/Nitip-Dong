-- NITIP DONG - SUPABASE / POSTGRESQL TABLES SCHEMA
-- #FoodJastipKemayoran

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS TABLE
create table public.users (
  id uuid default gen_random_uuid() primary key,
  role text not null check (role in ('customer', 'driver', 'admin')),
  name text not null,
  phone text unique not null,
  avatar text,
  rating numeric(3, 2) default 5.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. DRIVERS TABLE
create table public.drivers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  online_status text not null check (online_status in ('online', 'offline')),
  latitude double precision not null,
  longitude double precision not null,
  status text default 'free' check (status in ('free', 'working', 'suspended')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CHATS TABLE
create table public.chats (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.users(id) on delete cascade not null,
  driver_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (customer_id, driver_id)
);

-- 4. MESSAGES TABLE
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete cascade not null,
  message text,
  image_url text,
  latitude double precision,
  longitude double precision,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDERS TABLE
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.users(id) on delete cascade not null,
  driver_id uuid references public.users(id) on delete cascade not null,
  item_description text not null,
  food_price numeric(12, 2) not null default 0.00,
  delivery_fee numeric(12, 2) not null default 0.00,
  total_price numeric(12, 2) not null default 0.00,
  payment_proof text,
  status text not null default 'Menunggu Pembayaran' check (status in (
    'Menunggu Pembayaran',
    'Menunggu Verifikasi',
    'Sedang Belanja',
    'Dalam Perjalanan',
    'Selesai',
    'Dibatalkan'
  )),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. PAYMENTS TABLE
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  payment_proof text not null,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) & Realtime Publication Setup
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.drivers enable row level security;
alter table public.orders enable row level security;

-- Simple permissive policies to simplify testing, can be tuned for production
create policy "Allow everyone to read and write for testing" on public.users for all using (true);
create policy "Allow everyone to read and write for testing" on public.drivers for all using (true);
create policy "Allow everyone to read and write for testing" on public.chats for all using (true);
create policy "Allow everyone to read and write for testing" on public.messages for all using (true);
create policy "Allow everyone to read and write for testing" on public.orders for all using (true);
create policy "Allow everyone to read and write for testing" on public.payments for all using (true);

-- Publication for Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.drivers, public.orders, public.chats, public.messages;
