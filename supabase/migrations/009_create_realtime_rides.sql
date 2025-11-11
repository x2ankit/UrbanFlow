-- 009_create_realtime_rides.sql
-- Creates drivers, riders, ride_requests, driver_locations tables

-- drivers table
create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  vehicle_number text,
  current_lat double precision,
  current_lon double precision,
  is_online boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_drivers_current_location on drivers using gist( ll_to_earth(current_lat, current_lon) );

-- riders table
create table if not exists riders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  created_at timestamptz default now()
);

-- ride_requests table
create table if not exists ride_requests (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid references riders(id) on delete cascade,
  pickup_lat double precision not null,
  pickup_lon double precision not null,
  drop_lat double precision not null,
  drop_lon double precision not null,
  distance_km double precision,
  fare_rupees numeric(10,2),
  status text not null default 'pending', -- pending/accepted/arriving/ongoing/completed/cancelled
  driver_id uuid references drivers(id),
  otp text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_ride_requests_status on ride_requests(status);
create index if not exists idx_ride_requests_geo on ride_requests using gist( ll_to_earth(pickup_lat, pickup_lon) );

-- driver_locations table
create table if not exists driver_locations (
  id bigserial primary key,
  driver_id uuid references drivers(id) on delete cascade,
  lat double precision not null,
  lon double precision not null,
  updated_at timestamptz default now()
);

create index if not exists idx_driver_locations_driver_ts on driver_locations(driver_id, updated_at desc);

-- trigger to update ride_requests.updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_update_ride_requests_updated_at on ride_requests;
create trigger trg_update_ride_requests_updated_at
before update on ride_requests
for each row execute procedure update_updated_at_column();

-- NOTE: enable pgcrypto extension for gen_random_uuid() if not present
-- create extension if not exists pgcrypto;
