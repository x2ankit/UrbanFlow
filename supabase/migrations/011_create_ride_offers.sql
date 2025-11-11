-- 011_create_ride_offers.sql
-- Table for notifying nearby drivers of a new ride request

create table if not exists public.ride_offers (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.ride_requests(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  created_at timestamptz default now(),
  accepted boolean default false
);

create index if not exists idx_ride_offers_driver on public.ride_offers(driver_id);
create index if not exists idx_ride_offers_ride on public.ride_offers(ride_id);

-- RLS: drivers can read their own offers
alter table public.ride_offers enable row level security;
create policy if not exists "offers_driver_read" on public.ride_offers
  for select using (driver_id = auth.uid());
create policy if not exists "offers_driver_insert" on public.ride_offers
  for insert with check (exists(select 1 from public.drivers d where d.id = auth.uid()));
create policy if not exists "offers_driver_update" on public.ride_offers
  for update using (driver_id = auth.uid());
