# UrbanFlow Backend Setup Guide

## 🎯 Overview

This document contains complete instructions for setting up the UrbanFlow database in Supabase and implementing the backend features.

## 📋 Prerequisites

- Supabase account (free tier available at supabase.com)
- Your Supabase project URL and publishable key (already in `.env`)
- Project ID: `prsilkvkjfebiguabckb`

## 🚀 Setup Steps

### Step 1: Run SQL Migrations

1. **Open Supabase Dashboard**

   - Go to: https://app.supabase.com
   - Login with your credentials
   - Select project `prsilkvkjfebiguabckb`

2. **Navigate to SQL Editor**

   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migrations in Order**

   Copy and paste each SQL file from `supabase/migrations/` in this order:

   - `001_create_user_profiles.sql` - User profile table with RLS
   - `002_create_driver_profiles.sql` - Driver-specific data
   - `003_create_rides.sql` - Ride requests and ride matching
   - `004_create_ratings.sql` - Rating system for drivers & passengers
   - `005_create_location_tracking.sql` - Real-time location tracking
   - `006_create_transactions.sql` - Payment tracking
   - `007_create_notifications.sql` - Notification system
   - `008_create_auth_triggers.sql` - Auto-profile creation on signup

   ⚠️ **Important**: Run each migration separately and verify it succeeds before running the next one.

### Step 2: Enable Realtime

1. **Enable Realtime on Tables**
   - Go to "Replication" in left sidebar
   - For each table, click and toggle "Realtime" ON:
     - `location_updates` ✓
     - `notifications` ✓
     - `rides` ✓

### Step 3: Set Up Authentication

1. **Configure Google OAuth** (already set up if you have Google credentials)

   - Authentication > Providers > Google
   - Add your Google OAuth credentials

2. **Configure Email/Password Auth** (default, already enabled)
   - Authentication > Providers > Email

### Step 4: Frontend API Usage

All API functions are available in `src/lib/api.ts`:

```typescript
// Import API functions
import {
  getCurrentUserProfile,
  createRideRequest,
  updateRideStatus,
  recordLocationUpdate,
  submitDriverRating,
  subscribeToLocationUpdates,
  // ... more functions
} from "@/lib/api";

// Example: Create a ride request
const rideRequest = await createRideRequest(
  40.7128, // pickup latitude
  -74.006, // pickup longitude
  "123 Main St", // pickup address
  40.758, // dropoff latitude
  -73.9855, // dropoff longitude
  "456 Park Ave", // dropoff address
  25.5 // estimated fare
);

// Example: Subscribe to real-time location updates
const subscription = subscribeToLocationUpdates(rideId, (location) => {
  console.log("Driver location updated:", location);
  // Update map with new location
});

// Don't forget to unsubscribe when done
subscription.unsubscribe();
```

## 📊 Database Schema

### user_profiles

- `id`: UUID (auth.users foreign key)
- `email`: User email
- `first_name`, `last_name`: Name
- `phone_number`: Contact
- `avatar_url`: Profile picture
- `user_type`: 'passenger' | 'driver'
- `average_rating`: Calculated from ratings
- `total_ratings`: Count of ratings

### driver_profiles

- `id`: UUID (extends user_profiles)
- `license_number`: Driver license (unique)
- `vehicle_make`, `vehicle_model`, `vehicle_year`: Vehicle info
- `vehicle_plate`: License plate
- `is_verified`: KYC status
- `is_online`: Current status
- `current_latitude`, `current_longitude`: Last known location
- `total_rides`, `total_earnings`: Statistics

### rides

- `id`: UUID
- `passenger_id`, `driver_id`: Foreign keys
- `pickup_*`, `dropoff_*`: Addresses & coordinates
- `distance_km`, `duration_minutes`: Calculated
- `fare`: Price for this ride
- `status`: 'accepted' | 'in_transit' | 'completed' | 'cancelled'
- `started_at`, `completed_at`: Timestamps

### ride_requests

- `id`: UUID
- `passenger_id`: Who requested
- `pickup_*`, `dropoff_*`: Locations
- `estimated_fare`: Quote
- `status`: 'pending' | 'accepted' | 'cancelled' | 'expired'
- `expires_at`: 5 minute expiry

### driver_ratings & passenger_ratings

- `id`: UUID
- `ride_id`, `driver_id`/`passenger_id`: References
- `rating`: 1-5 stars
- `comment`: Optional review

### location_updates

- `id`: UUID
- `ride_id`, `driver_id`: References
- `latitude`, `longitude`: Current position
- `accuracy_meters`, `speed_kmh`: GPS data
- `timestamp`: When recorded

### transactions

- `id`: UUID
- `ride_id`, `passenger_id`, `driver_id`: References
- `amount`, `currency`: Payment details
- `payment_method`: 'card' | 'cash' | 'wallet'
- `stripe_payment_id`: For payment processing
- `driver_earnings`, `platform_fee`: Breakdown
- `status`: 'pending' | 'completed' | 'failed' | 'refunded'

### notifications

- `id`: UUID
- `user_id`: Recipient
- `ride_id`: Related ride (if any)
- `type`: Message type
- `title`, `message`: Notification content
- `data`: JSON extra info
- `is_read`, `read_at`: Read status

## 🔐 Row-Level Security (RLS)

All tables have RLS enabled:

- **Users can only access their own data** by default
- **Public visibility** for verified driver info (for matching)
- **System-level operations** allowed via authenticated functions

## 🌐 Real-Time Subscriptions

Subscribe to live updates:

```typescript
// Location updates during ride
subscribeToLocationUpdates(rideId, (location) => {
  map.setCenter([location.latitude, location.longitude]);
});

// Notifications
subscribeToNotifications(userId, (notification) => {
  showToast(notification.message);
});

// Ride status changes
subscribeToRideUpdates(rideId, (ride) => {
  setRideStatus(ride.status);
});
```

## 🎯 API Endpoints (Frontend Functions)

### User Management

- `getCurrentUserProfile()` - Fetch current user
- `updateUserProfile(updates)` - Update profile

### Ride Requests

- `createRideRequest(...)` - Create new request
- `getAvailableRideRequests()` - List pending requests
- `cancelRideRequest(requestId)` - Cancel request

### Rides

- `createRide(...)` - Match and create ride
- `getCurrentRide(userId)` - Get active ride
- `updateRideStatus(rideId, status)` - Update status
- `getRideHistory(userId)` - Get past rides

### Driver Operations

- `getDriverProfile(driverId)` - Driver details
- `updateDriverLocation(lat, lng)` - Update position
- `toggleDriverOnlineStatus(isOnline)` - Go online/offline

### Location Tracking

- `recordLocationUpdate(...)` - Log location
- `getLatestDriverLocation(rideId)` - Get current position

### Ratings

- `submitDriverRating(rideId, driverId, rating, comment)` - Rate driver
- `getDriverRatings(driverId)` - Get driver reviews

### Payments

- `createTransaction(...)` - Record payment

### Notifications

- `createNotification(...)` - Send notification
- `getUnreadNotifications(userId)` - Get new messages
- `markNotificationAsRead(notificationId)` - Mark read

## 🔄 Typical Flow

### Passenger Requesting a Ride

```
1. User opens app → getCurrentUserProfile()
2. Enters pickup & dropoff → createRideRequest()
3. Request expires in 5 minutes or driver accepts
4. If accepted → createRide() + createNotification()
5. Watch live location → subscribeToLocationUpdates()
6. Ride completes → updateRideStatus('completed')
7. Submit rating → submitDriverRating()
```

### Driver Accepting a Ride

```
1. Driver comes online → toggleDriverOnlineStatus(true)
2. Gets notified of requests → subscribeToNotifications()
3. Views available rides → getAvailableRideRequests()
4. Accepts ride → createRide() + updateRideStatus('accepted')
5. Starts driving → recordLocationUpdate()
6. Every few seconds → recordLocationUpdate()
7. Completes ride → updateRideStatus('completed')
8. Gets rating → subscribeToNotifications()
```

## 🛠️ Future Enhancements

### Phase 1 (Implemented)

- ✅ User profiles & authentication
- ✅ Ride matching system
- ✅ Real-time location tracking
- ✅ Ratings system
- ✅ Notifications

### Phase 2 (To Implement)

- [ ] Stripe payment integration
- [ ] Fare calculation algorithm
- [ ] Google Maps integration
- [ ] Ride matching algorithm
- [ ] Push notifications

### Phase 3 (Advanced)

- [ ] Email notifications
- [ ] SMS alerts
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Driver verification system

## 🆘 Troubleshooting

### "No overload matches" TypeScript errors

- This is normal until migrations are run
- Errors will resolve once database tables exist
- The API functions will work fine at runtime

### RLS Policy blocks queries

- Check if user is authenticated
- Verify user has permission for the table
- Check `.env` variables are set

### Real-time not working

- Ensure Realtime is enabled on the table
- Check browser console for WebSocket errors
- Verify user has SELECT permission on table

### 403 Unauthorized

- User token may have expired
- Try refreshing the page
- Check Supabase RLS policies

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- Supabase React Guide: https://supabase.com/docs/guides/getting-started/quickstarts/react
- PostgreSQL RLS: https://supabase.com/docs/guides/auth/row-level-security
- Real-time Guide: https://supabase.com/docs/guides/realtime

---

**Next Steps:**

1. ✅ Run all SQL migrations
2. ✅ Enable Realtime on required tables
3. ✅ Test API functions in dashboard
4. ✅ Integrate with frontend components
5. ✅ Implement Google Maps
6. ✅ Add Stripe payment integration
