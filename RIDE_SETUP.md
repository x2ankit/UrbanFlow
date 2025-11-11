# Real-time Ride Setup (UrbanFlow)

This document explains what's added for the realtime ride hailing workflow and env vars to configure.

Required environment variables (set in Vercel / local .env):

- VITE_SUPABASE_URL - your Supabase URL (https://...)
- VITE_SUPABASE_PUBLISHABLE_KEY - your Supabase anon/public key
- VITE_MAPTILER_KEY - MapTiler API key for MapLibre styles
- VITE_RAZORPAY_KEY - Razorpay Key ID for payments
- VITE_APP_URL - site URL for OAuth redirects

Database:

- Migration file added: `supabase/migrations/009_create_realtime_rides.sql` — run this in your Supabase SQL editor.

How it works (high level):

- Riders insert a `ride_requests` row (status = pending). Drivers listen to realtime inserts and can accept.
- Drivers run `DriverLocationUpdater` to insert into `driver_locations` and update `drivers.current_lat/current_lon`.
- When a driver accepts a ride the server updates `ride_requests` (status=accepted, driver_id, otp). The rider subscribes to ride updates and receives it in realtime.
- Driver verifies OTP to start the ride (status -> ongoing), and completes ride to set status -> completed. At completion, the Rider can pay via Razorpay.

Notes & next steps:

- For production: add RLS policies and proper authentication checks on Supabase tables.
- Consider server-side matching and push notifications for reliable driver targeting.
- Install dependencies locally: `npm install maplibre-gl @maptiler/geocoding` and ensure TypeScript types if needed.
