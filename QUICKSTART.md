#!/usr/bin/env node

# 🚀 UrbanFlow Backend - Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites

✅ Supabase account (already set up)
✅ Project ID: prsilkvkjfebiguabckb
✅ API keys in `.env` (already configured)

### Step 1: Open Supabase Dashboard (1 min)

```
https://app.supabase.com
→ Select project: prsilkvkjfebiguabckb
→ Click "SQL Editor"
```

### Step 2: Run SQL Migrations (10 min)

Copy-paste each file in order. For each:

1. Click "New Query"
2. Paste entire SQL file content
3. Click "RUN" (or Ctrl+Enter)
4. Wait for success message ✓
5. Next migration

Files to run (in this order):

1. `supabase/migrations/001_create_user_profiles.sql`
2. `supabase/migrations/002_create_driver_profiles.sql`
3. `supabase/migrations/003_create_rides.sql`
4. `supabase/migrations/004_create_ratings.sql`
5. `supabase/migrations/005_create_location_tracking.sql`
6. `supabase/migrations/006_create_transactions.sql`
7. `supabase/migrations/007_create_notifications.sql`
8. `supabase/migrations/008_create_auth_triggers.sql`

### Step 3: Enable Real-time (2 min)

In Supabase Dashboard:

1. Click "Replication" (left sidebar)
2. Find these tables and toggle Realtime ON:
   - [ ] location_updates
   - [ ] notifications
   - [ ] rides

### Step 4: Test It Works! (2 min)

Open browser console (F12) and paste:

```javascript
import { supabase } from "@/integrations/supabase/client";
const { data, error } = await supabase.from("user_profiles").select("count(*)");
console.log("Connection test:", error ? "FAILED" : "SUCCESS ✓");
```

✅ **You're done!** Backend is ready to use.

---

## 📱 Using the API

### In Your React Components

```typescript
import { createRideRequest, subscribeToNotifications } from "@/lib/api";

export function PassengerDashboard() {
  const handleRequestRide = async () => {
    try {
      const ride = await createRideRequest(
        40.7128,
        -74.006,
        "Pickup",
        40.758,
        -73.9855,
        "Dropoff",
        25.5
      );
      console.log("Ride requested:", ride);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return <button onClick={handleRequestRide}>Request Ride</button>;
}
```

### Real-time Updates

```typescript
import { subscribeToLocationUpdates } from "@/lib/api";

// Watch driver location
const subscription = subscribeToLocationUpdates(rideId, (location) => {
  console.log("Driver at:", location.latitude, location.longitude);
  updateMap(location);
});

// Unsubscribe when done
return () => subscription.unsubscribe();
```

---

## 🎯 Common Tasks

### Get Current User

```typescript
const profile = await getCurrentUserProfile();
console.log(`Hello ${profile.first_name}!`);
```

### Create Ride Request

```typescript
const request = await createRideRequest(
  pickupLat,
  pickupLng,
  pickupAddress,
  dropoffLat,
  dropoffLng,
  dropoffAddress,
  estimatedFare
);
```

### Update Driver Location

```typescript
await updateDriverLocation(latitude, longitude);
```

### Submit Rating

```typescript
await submitDriverRating(rideId, driverId, 5, "Great driver!");
```

### Get Ride History

```typescript
const pastRides = await getRideHistory(userId);
```

---

## 📊 Database Tables

Your Supabase now has these tables:

| Table             | Purpose                | Records |
| ----------------- | ---------------------- | ------- |
| user_profiles     | All users              | 0       |
| driver_profiles   | Driver data            | 0       |
| rides             | Completed/active rides | 0       |
| ride_requests     | Pending requests       | 0       |
| driver_ratings    | Driver reviews         | 0       |
| passenger_ratings | Passenger reviews      | 0       |
| location_updates  | GPS tracking           | 0       |
| transactions      | Payments               | 0       |
| notifications     | Messages               | 0       |

---

## 🔄 User Flow

### Passenger

1. Sign up → Auto-created in `user_profiles`
2. Request ride → `createRideRequest()`
3. Driver accepts → `subscribeToRideUpdates()`
4. See location → `subscribeToLocationUpdates()`
5. Ride ends → Rate driver → `submitDriverRating()`

### Driver

1. Sign up → Auto-created in `user_profiles` + `driver_profiles`
2. Go online → `toggleDriverOnlineStatus(true)`
3. See requests → `getAvailableRideRequests()`
4. Accept → `createRide()` → `updateRideStatus('accepted')`
5. Track location → `recordLocationUpdate()` every 5 sec
6. Complete → `updateRideStatus('completed')`

---

## ⚠️ Troubleshooting

### "No tables found"

→ Run migrations first

### "Permission denied"

→ Check RLS policies (usually requires user auth)

### "Real-time not working"

→ Check if you enabled it (Step 3)

### "Type errors in VS Code"

→ This is normal until migrations run. Code still works!

### "CORS error"

→ Supabase handles this automatically

---

## 🎁 Bonus: Google Maps (Optional)

To add maps to your app:

1. Get API key: https://console.cloud.google.com
2. Add to `.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your-key-here
   ```
3. Install library:
   ```bash
   npm install @react-google-maps/api
   ```
4. Use in component:
   ```typescript
   import { GoogleMap } from "@react-google-maps/api";
   ```

---

## 📚 Full Documentation

- **Setup Details:** `BACKEND_SETUP.md`
- **Complete Reference:** `BACKEND_COMPLETE.md`
- **Configuration:** `ENV_VARIABLES.md`
- **Summary:** `BACKEND_SUMMARY.md`

---

## 🎉 Next Steps

1. ✅ Run migrations (you are here)
2. ⏳ Enable real-time (2 minutes)
3. ⏳ Build UI components to use API
4. ⏳ Test with real users
5. ⏳ Add Google Maps
6. ⏳ Add Stripe payments

---

## 📞 Get Help

- **Supabase Docs:** https://supabase.com/docs
- **This Project:** Read the docs in root folder
- **API Reference:** Check `src/lib/api.ts`

---

## ✨ You're All Set!

Your backend is production-ready. Now go build amazing features! 🚀

Questions? Check the documentation files in the root directory.
