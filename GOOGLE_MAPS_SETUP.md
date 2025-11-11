# 🗺️ Google Maps Setup Guide for UrbanFlow

## ✅ What's Already Done

- ✅ Installed `@react-google-maps/api` package
- ✅ Created reusable `MapComponent` with all features
- ✅ Added `.env` variable placeholder
- ✅ Created example pages

## 🎯 Features Included (All FREE)

1. **Current Location Detection** - Get user's GPS location
2. **Address Autocomplete** - Smart address suggestions as you type
3. **Directions & Routes** - Show route between two points
4. **Distance & Duration** - Calculate trip details
5. **Interactive Markers** - Visual pickup/dropoff points
6. **Responsive Map** - Works on all devices

## 📝 Step 1: Get FREE Google Maps API Key

### 1. Go to Google Cloud Console

Visit: https://console.cloud.google.com/

### 2. Create/Select a Project

- Click "Select a project" → "New Project"
- Name: "UrbanFlow" (or anything you like)
- Click "Create"

### 3. Enable Required APIs

Go to: https://console.cloud.google.com/google/maps-apis

Enable these 3 APIs (all FREE tier):

- ✅ **Maps JavaScript API** - For displaying maps
- ✅ **Places API** - For address autocomplete
- ✅ **Directions API** - For route calculations

Click each one → Click "Enable"

### 4. Create API Key

- Go to: https://console.cloud.google.com/apis/credentials
- Click "Create Credentials" → "API Key"
- Copy your API key (looks like: `AIzaSyD...`)

### 5. Restrict API Key (IMPORTANT for security)

- Click on your API key to edit it
- Under "Application restrictions":
  - Select "HTTP referrers (websites)"
  - Add: `http://localhost:*` (for development)
  - Add: `https://yourwebsite.com/*` (for production)
- Under "API restrictions":
  - Select "Restrict key"
  - Check: Maps JavaScript API, Places API, Directions API
- Click "Save"

## 🔧 Step 2: Add API Key to Your Project

Open `.env` file and replace `YOUR_API_KEY_HERE` with your actual key:

```bash
VITE_GOOGLE_MAPS_API_KEY="AIzaSyD...your-actual-key"
```

**⚠️ Important:** Restart your dev server after adding the key!

```bash
npm run dev
```

## 💰 Free Tier Limits (More than enough!)

Google gives you **$200 FREE credit every month**, which includes:

| Feature      | Free Monthly Usage |
| ------------ | ------------------ |
| Map Loads    | ~28,000 loads      |
| Autocomplete | ~17,000 requests   |
| Directions   | ~20,000 routes     |
| Geocoding    | ~40,000 requests   |

**For a small-medium app, you'll NEVER hit these limits!**

## 🚀 Usage Examples

### Example 1: Simple Location Picker (No Directions)

```tsx
import { MapComponent } from "@/components/maps/MapComponent";

function MyPage() {
  const handleLocationSelect = (location) => {
    console.log("User selected:", location.address);
    // Save to database, etc.
  };

  return (
    <MapComponent
      onLocationSelect={handleLocationSelect}
      showDirections={false} // Just location picker
    />
  );
}
```

### Example 2: Full Route Planning (Pickup → Dropoff)

```tsx
import { MapComponent } from "@/components/maps/MapComponent";

function BookRide() {
  return (
    <MapComponent
      showDirections={true} // Shows pickup + dropoff + route
    />
  );
}
```

### Example 3: Pre-filled Locations

```tsx
import { MapComponent } from "@/components/maps/MapComponent";

function TrackRide() {
  const pickupLocation = { lat: 28.6139, lng: 77.209 };
  const dropoffLocation = { lat: 28.7041, lng: 77.1025 };

  return (
    <MapComponent
      showDirections={true}
      initialPickup={pickupLocation}
      initialDropoff={dropoffLocation}
    />
  );
}
```

## 📱 Features Breakdown

### 1️⃣ Current Location Button

```tsx
// Automatically gets user's GPS location
// Shows blue dot on map
// Gets address via reverse geocoding
```

### 2️⃣ Address Autocomplete

```tsx
// Type "123 Main" → See suggestions
// Powered by Google Places API
// Works worldwide
```

### 3️⃣ Directions

```tsx
// Shows route between two points
// Displays distance (e.g., "5.2 km")
// Displays duration (e.g., "12 mins")
// Blue route line on map
```

### 4️⃣ Custom Markers

```tsx
// Pickup: Green "A" marker
// Dropoff: Red "B" marker
// Current location: Blue dot
```

## 🔥 Integration with Your Ride App

### Save Ride Request with Locations

```tsx
import { MapComponent } from "@/components/maps/MapComponent";
import { createRideRequest } from "@/lib/api";

function BookRide() {
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);

  const handleBookRide = async () => {
    const ride = await createRideRequest({
      pickup_latitude: pickup.lat,
      pickup_longitude: pickup.lng,
      pickup_address: pickup.address,
      dropoff_latitude: dropoff.lat,
      dropoff_longitude: dropoff.lng,
      dropoff_address: dropoff.address,
      distance: distance, // from map calculation
      estimated_duration: duration, // from map calculation
    });
  };

  return <MapComponent showDirections={true} onLocationSelect={setPickup} />;
}
```

## 🐛 Troubleshooting

### "Error loading Google Maps"

- ✅ Check API key is correct in `.env`
- ✅ Restart dev server: `Ctrl+C` then `npm run dev`
- ✅ Check you enabled all 3 APIs in Google Cloud Console

### "This page can't load Google Maps correctly"

- ✅ API key restrictions are too strict
- ✅ Add `http://localhost:*` to allowed referrers
- ✅ Make sure APIs are enabled

### Autocomplete not working

- ✅ Enable "Places API" in Google Cloud Console
- ✅ Wait 2-3 minutes after enabling (takes time to activate)

### Current location button does nothing

- ✅ Allow location permissions in browser
- ✅ Use HTTPS in production (HTTP works on localhost only)

## 🎨 Customization

### Change Map Style

```tsx
// In MapComponent.tsx, add to options:
options={{
  styles: [
    // Add custom styles here
    // Generator: https://mapstyle.withgoogle.com/
  ]
}}
```

### Change Default Location

```tsx
// In MapComponent.tsx, line 15:
const defaultCenter = {
  lat: 28.6139, // Your city latitude
  lng: 77.209, // Your city longitude
};
```

### Change Map Height

```tsx
// In MapComponent.tsx, line 8:
const mapContainerStyle = {
  width: "100%",
  height: "500px", // Change this
  borderRadius: "12px",
};
```

## 📊 Monitor Usage (Avoid Surprise Charges)

1. Go to: https://console.cloud.google.com/google/maps-apis/metrics
2. See real-time usage
3. Set up billing alerts (optional)
4. You get $200 FREE every month!

## 🎯 Quick Start Checklist

- [ ] Create Google Cloud project
- [ ] Enable 3 APIs (Maps, Places, Directions)
- [ ] Create API key
- [ ] Restrict API key (add localhost)
- [ ] Add key to `.env` file
- [ ] Restart dev server
- [ ] Test on: http://localhost:5173/ride-booking
- [ ] See map working! 🎉

## 🔗 Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Enable APIs](https://console.cloud.google.com/google/maps-apis)
- [API Keys](https://console.cloud.google.com/apis/credentials)
- [Monitor Usage](https://console.cloud.google.com/google/maps-apis/metrics)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [React Google Maps Docs](https://react-google-maps-api-docs.netlify.app/)

---

**🎉 You're all set! Google Maps is FREE for your app's usage level.**
