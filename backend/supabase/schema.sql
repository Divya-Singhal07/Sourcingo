
create extension if not exists pgcrypto;

-- User identity and marketplace role.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'New user',
  role text not null default 'buyer'
    check (role in ('buyer', 'manufacturer')),
  city text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Company information shared by buyers and manufacturers.
create table public.business_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  company_name text not null,
  description text,
  website text,
  city text,
  state text,
  industry text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Product listings belong to manufacturer accounts.
create table public.products (
  id uuid primary key default gen_random_uuid(),
  manufacturer_id uuid not null
    references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  material text,
  price_min numeric(14,2) check (price_min is null or price_min >= 0),
  price_max numeric(14,2) check (price_max is null or price_max >= 0),
  moq integer not null default 1 check (moq > 0),
  lead_time_days integer check (lead_time_days is null or lead_time_days >= 0),
  quality_tier text check (
    quality_tier is null or quality_tier in ('best', 'good', 'ok')
  ),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    price_min is null or price_max is null or price_max >= price_min
  )
);

-- One current swipe per user-target pair.
create table public.swipes (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  direction text not null check (direction in ('like', 'pass')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_user_id <> to_user_id),
  unique (from_user_id, to_user_id)
);

-- A mutual like produces one match for a buyer and manufacturer.
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  manufacturer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (buyer_id <> manufacturer_id),
  unique (buyer_id, manufacturer_id)
);

create index products_manufacturer_idx
  on public.products(manufacturer_id);

create index products_category_idx
  on public.products(category);

create index products_active_idx
  on public.products(is_active);

create index profiles_role_idx
  on public.profiles(role);

create index profiles_region_idx
  on public.profiles(state, city);

create index swipes_target_idx
  on public.swipes(to_user_id);

create index matches_buyer_idx
  on public.matches(buyer_id);

create index matches_manufacturer_idx
  on public.matches(manufacturer_id);

-- Create a profile when a new Auth account is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_role text;
  selected_name text;
begin
  selected_role := coalesce(new.raw_user_meta_data ->> 'role', 'buyer');
  selected_name := coalesce(new.raw_user_meta_data ->> 'display_name', 'New user');

  if selected_role not in ('buyer', 'manufacturer') then
    selected_role := 'buyer';
  end if;

  insert into public.profiles (id, display_name, role)
  values (new.id, left(selected_name, 100), selected_role);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Enable RLS on every exposed table.
alter table public.profiles enable row level security;
alter table public.business_profiles enable row level security;
alter table public.products enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;

-- Profiles are discoverable, but role cannot be changed by the user.
grant select on public.profiles to anon, authenticated;
revoke update on public.profiles from authenticated;
grant update (display_name, city, state, updated_at)
  on public.profiles to authenticated;

create policy "Profiles are publicly readable"
on public.profiles for select
to anon, authenticated
using (true);

create policy "Users update their own editable profile fields"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Business information is visible for marketplace discovery.
grant select on public.business_profiles to anon, authenticated;
grant insert, update on public.business_profiles to authenticated;

create policy "Business profiles are publicly readable"
on public.business_profiles for select
to anon, authenticated
using (true);

create policy "Users create their own business profile"
on public.business_profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update their own business profile"
on public.business_profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Product discovery is public; only the owning manufacturer can write.
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

create policy "Active products are discoverable"
on public.products for select
to anon, authenticated
using (is_active = true or (select auth.uid()) = manufacturer_id);

create policy "Manufacturers create their own products"
on public.products for insert
to authenticated
with check (
  (select auth.uid()) = manufacturer_id
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'manufacturer'
  )
);

create policy "Manufacturers update their own products"
on public.products for update
to authenticated
using ((select auth.uid()) = manufacturer_id)
with check (
  (select auth.uid()) = manufacturer_id
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'manufacturer'
  )
);

create policy "Manufacturers delete their own products"
on public.products for delete
to authenticated
using ((select auth.uid()) = manufacturer_id);

-- Users can read swipes involving themselves, allowing reciprocal-like checks.
grant select, insert, update on public.swipes to authenticated;

create policy "Users read swipes involving themselves"
on public.swipes for select
to authenticated
using (
  (select auth.uid()) = from_user_id
  or (select auth.uid()) = to_user_id
);

create policy "Users create their own swipes"
on public.swipes for insert
to authenticated
with check (
  (select auth.uid()) = from_user_id
  and exists (
    select 1
    from public.profiles sender
    join public.profiles target on target.id = to_user_id
    where sender.id = (select auth.uid())
      and sender.role <> target.role
  )
);

create policy "Users update their own swipes"
on public.swipes for update
to authenticated
using ((select auth.uid()) = from_user_id)
with check ((select auth.uid()) = from_user_id);

-- Matches are visible only to the two participants.
grant select, insert on public.matches to authenticated;

create policy "Match participants can read matches"
on public.matches for select
to authenticated
using (
  (select auth.uid()) = buyer_id
  or (select auth.uid()) = manufacturer_id
);

create policy "Only participants with mutual likes can create matches"
on public.matches for insert
to authenticated
with check (
  (
    (select auth.uid()) = buyer_id
    or (select auth.uid()) = manufacturer_id
  )
  and exists (
    select 1
    from public.swipes buyer_swipe
    join public.swipes manufacturer_swipe
      on manufacturer_swipe.from_user_id = buyer_swipe.to_user_id
     and manufacturer_swipe.to_user_id = buyer_swipe.from_user_id
    where buyer_swipe.from_user_id = buyer_id
      and buyer_swipe.to_user_id = manufacturer_id
      and buyer_swipe.direction = 'like'
      and manufacturer_swipe.direction = 'like'
  )
);
