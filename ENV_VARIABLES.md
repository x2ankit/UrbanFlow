# UrbanFlow Environment Variables Guide

## Current Setup ✅

Your `.env` file already has:

```properties
VITE_SUPABASE_PROJECT_ID="prsilkvkjfebiguabckb"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByc2lsa3ZramZlYmlndWFiY2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NjI5MzAsImV4cCI6MjA3ODMzODkzMH0.JKyUSHCExxN_hMu2cT1_CaNIzRN0zD6IknAV0E57ijQ"
VITE_SUPABASE_URL="https://prsilkvkjfebiguabckb.supabase.co"
```

✅ Supabase is ready to use!

## Variables to Add (Optional but Recommended)

### 1. Google Maps API

**Why:** For distance calculation, route optimization, and address geocoding

**Steps:**

1. Go to: https://console.cloud.google.com
2. Create a new project named "UrbanFlow"
3. Enable APIs:
   - Maps JavaScript API
   - Directions API
   - Geocoding API
   - Places API
4. Create an API key (Restrict to web browsers)
5. Add to `.env`:

```properties
VITE_GOOGLE_MAPS_API_KEY="your-api-key-here"
```

**In code:**

```typescript
// src/lib/maps.ts
const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function calculateDistance(pickup, dropoff) {
  // Use Google Maps API
}
```

### 2. Stripe Payment Processing (Optional)

**Why:** For handling card payments and refunds

**Steps:**

1. Go to: https://stripe.com
2. Create account or login
3. Copy keys from Dashboard > API keys
4. Add to `.env`:

```properties
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
VITE_STRIPE_SECRET_KEY="sk_test_..."
VITE_STRIPE_WEBHOOK_SECRET="whsec_..."
```

**In code:**

```typescript
import Stripe from "@stripe/stripe-js";

const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Process payment
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement },
});
```

### 3. SendGrid (Email Notifications) - Optional

**Why:** Send email receipts, notifications, and confirmations

**Steps:**

1. Go to: https://sendgrid.com
2. Create account
3. Generate API key
4. Add to `.env`:

```properties
VITE_SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="noreply@urbanflow.app"
```

### 4. Twilio (SMS Notifications) - Optional

**Why:** Send SMS for ride updates and alerts

**Steps:**

1. Go to: https://twilio.com
2. Create account
3. Get Account SID and Auth Token
4. Add to `.env`:

```properties
VITE_TWILIO_ACCOUNT_SID="AC...."
VITE_TWILIO_AUTH_TOKEN="your-token"
VITE_TWILIO_PHONE_NUMBER="+1234567890"
```

## Complete `.env` Template

```properties
# Supabase (Already configured ✅)
VITE_SUPABASE_PROJECT_ID="prsilkvkjfebiguabckb"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByc2lsa3ZramZlYmlndWFiY2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NjI5MzAsImV4cCI6MjA3ODMzODkzMH0.JKyUSHCExxN_hMu2cT1_CaNIzRN0zD6IknAV0E57ijQ"
VITE_SUPABASE_URL="https://prsilkvkjfebiguabckb.supabase.co"

# Google Maps (Optional - Add when ready)
VITE_GOOGLE_MAPS_API_KEY=""

# Stripe (Optional - Add when ready)
VITE_STRIPE_PUBLISHABLE_KEY=""
VITE_STRIPE_SECRET_KEY=""
VITE_STRIPE_WEBHOOK_SECRET=""

# Email (Optional - Add when ready)
VITE_SENDGRID_API_KEY=""
SENDGRID_FROM_EMAIL="noreply@urbanflow.app"

# SMS (Optional - Add when ready)
VITE_TWILIO_ACCOUNT_SID=""
VITE_TWILIO_AUTH_TOKEN=""
VITE_TWILIO_PHONE_NUMBER=""

# App Configuration
VITE_APP_NAME="UrbanFlow"
VITE_APP_URL="http://localhost:8080"
```

## Priority Order for Adding Variables

### 🔴 Critical (Do This First)

1. ✅ Supabase - Already done
2. 🟡 Google Maps - Do this second

### 🟡 Important (Next Week)

3. Stripe - For payments

### 🟢 Nice to Have (Later)

4. SendGrid - Better emails
5. Twilio - SMS alerts

## How to Add Variables

### Development (.env local file)

```bash
# Windows PowerShell
"VITE_GOOGLE_MAPS_API_KEY=your-key" | Add-Content .env
```

### Production (Vercel/Similar)

1. Go to project settings
2. Environment Variables section
3. Add each variable
4. Redeploy

## Testing Variables

```typescript
// src/lib/env.ts
export const env = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  },
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "NOT_SET",
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "NOT_SET",
  },
};

// Check in browser console
console.log(env);
```

## Security Notes

⚠️ **IMPORTANT:**

- Never commit `.env` to Git
- `.env` is already in `.gitignore`
- VITE\_ prefixed variables are exposed to frontend (OK for public keys)
- Secret keys (like Stripe secret) should never have VITE\_ prefix
- Backend-only secrets should be in server environment

## Common Issues

### "VITE_GOOGLE_MAPS_API_KEY is undefined"

- Solution: Add the variable to `.env`
- Reload dev server after adding

### "Maps not loading"

- Check API key is valid
- Verify APIs are enabled in Google Cloud Console
- Check API key restrictions

### "Stripe not working"

- Ensure using test keys (pk*test*, sk*test*)
- Check CORS settings
- Verify webhook secret matches

## Next: Run Migrations

Once you have `.env` set up, the next step is:

1. Go to Supabase Dashboard
2. Run SQL migrations from `supabase/migrations/`
3. Enable Realtime on 3 tables

See **BACKEND_SETUP.md** for detailed instructions.
