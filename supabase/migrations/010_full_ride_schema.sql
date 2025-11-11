-- 010_full_ride_schema.sql
-- Full schema for realtime ride flow with enums, RLS, helpers and triggers

-- ===== ENUMS =====
create type if not exists ride_status as enum (
  'pending','accepted','arriving','ongoing','completed','cancelled'
);

-- ===== TABLES =====
create table if not exists public.riders (
  id uuid primary key default auth.uid(),
  name text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists public.drivers (
  id uuid primary key default auth.uid(),
  name text,
  phone text,
  vehicle_number text,
  is_online boolean default false,
  current_lat double precision,
  current_lon double precision,
  updated_at timestamptz default now()
);

create table if not exists public.driver_locations (
  driver_id uuid primary key references public.drivers(id) on delete cascade,
  lat double precision not null,
  lon double precision not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.ride_requests (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references public.riders(id) on delete cascade,
  pickup_lat double precision not null,
  pickup_lon double precision not null,
  drop_lat double precision not null,
  drop_lon double precision not null,
  distance_km numeric(10,2),
  fare_rupees integer,
  status ride_status not null default 'pending',
  driver_id uuid references public.drivers(id) on delete set null,
  otp char(4),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_ride_requests_status on public.ride_requests(status);
create index if not exists idx_driver_locations_updated on public.driver_locations(updated_at);

-- ===== TRIGGERS =====
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists ride_requests_set_updated_at on public.ride_requests;
create trigger ride_requests_set_updated_at
before update on public.ride_requests
for each row execute function public.set_updated_at();

-- ===== Haversine helper (km) =====
create or replace function public.haversine_km(lat1 double precision, lon1 double precision,
                                               lat2 double precision, lon2 double precision)
returns double precision language sql immutable as $$
  select 2 * 6371 * asin(
    sqrt(
      pow(sin(radians(($3 - $1)/2)),2) +
      cos(radians($1)) * cos(radians($3)) * pow(sin(radians(($4 - $2)/2)),2)
    )
  );
$$;

-- Nearby drivers within X km (default 3 km)
create or replace function public.nearby_drivers(p_lat double precision, p_lon double precision, p_radius_km double precision default 3)
returns table (
  driver_id uuid,
  lat double precision,
  lon double precision,
  km double precision
) language sql stable as $$
  select d.driver_id, d.lat, d.lon,
         public.haversine_km(p_lat, p_lon, d.lat, d.lon) as km
  from public.driver_locations d
  join public.drivers dv on dv.id = d.driver_id and dv.is_online = true
  where public.haversine_km(p_lat, p_lon, d.lat, d.lon) <= p_radius_km
  order by km asc
  limit 20;
$$;

-- Verify OTP and move to 'ongoing'
create or replace function public.verify_ride_otp(p_ride uuid, p_driver uuid, p_otp char(4))
returns boolean language plpgsql security definer as $$
declare ok boolean;
begin
  update public.ride_requests
     set status = 'ongoing'
   where id = p_ride
     and driver_id = p_driver
     and otp = p_otp
     and status = 'accepted'
  returning true into ok;

  return coalesce(ok, false);
end $$;

-- ===== RLS =====
alter table public.riders enable row level security;
alter table public.drivers enable row level security;
alter table public.driver_locations enable row level security;
alter table public.ride_requests enable row level security;

-- Riders: can manage self and rides they own
create policy if not exists "rider_self" on public.riders
  for select using (id = auth.uid());
create policy if not exists "rider_self_ins" on public.riders
  for insert with check (id = auth.uid());
create policy if not exists "rider_self_upd" on public.riders
  for update using (id = auth.uid());

-- Drivers: manage self + location
create policy if not exists "driver_self" on public.drivers
  for select using (id = auth.uid());
create policy if not exists "driver_self_ins" on public.drivers
  for insert with check (id = auth.uid());
create policy if not exists "driver_self_upd" on public.drivers
  for update using (id = auth.uid());

create policy if not exists "driver_location_rw" on public.driver_locations
  for select using (driver_id = auth.uid())
  using (true)
  with check (driver_id = auth.uid());

-- Ride requests:
-- rider can read their own; driver can read ones assigned to them; everyone can read 'pending' (to get offers)
create policy if not exists "rides_rider_read" on public.ride_requests
  for select using (rider_id = auth.uid());

create policy if not exists "rides_driver_read" on public.ride_requests
  for select using (driver_id = auth.uid());

create policy if not exists "rides_pending_read_for_drivers" on public.ride_requests
  for select using (exists(select 1 from public.drivers d where d.id = auth.uid()));

create policy if not exists "rides_rider_insert" on public.ride_requests
  for insert with check (rider_id = auth.uid());

create policy if not exists "rides_rider_update_own" on public.ride_requests
  for update using (rider_id = auth.uid());

create policy if not exists "rides_driver_update_assigned" on public.ride_requests
  for update using (driver_id = auth.uid());
