# 🔐 Google Login Setup Guide for UrbanFlow

## ✅ What's Already Done

- ✅ Google OAuth code already implemented in `src/pages/Auth.tsx`
- ✅ Button ready with Google icon
- ✅ Supabase client configured

## 🎯 You Just Need to Enable It (10 Minutes)

---

## Step 1: Create Google OAuth Credentials (5 minutes)

### 1.1 Go to Google Cloud Console

Visit: https://console.cloud.google.com/

### 1.2 Select Your Project

- Use the same project you created for Google Maps
- Or create a new one: Click "Select Project" → "New Project"

### 1.3 Enable Google+ API

- Go to: https://console.cloud.google.com/apis/library/plus.googleapis.com
- Click "Enable" (if not already enabled)

### 1.4 Configure OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Select "External" (unless you have a Google Workspace)
3. Click "Create"

**Fill in the form:**

- **App name:** UrbanFlow
- **User support email:** your-email@gmail.com
- **Developer contact:** your-email@gmail.com
- Click "Save and Continue"

**Scopes (Step 2):**

- Click "Add or Remove Scopes"
- Select: `email`, `profile`, `openid`
- Click "Update" → "Save and Continue"

**Test Users (Step 3):**

- Add your email address for testing
- Click "Save and Continue"

**Summary (Step 4):**

- Review and click "Back to Dashboard"

### 1.5 Create OAuth Client ID

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth client ID"
3. **Application type:** Web application
4. **Name:** UrbanFlow Web App

**Authorized JavaScript origins:**

```
http://localhost:8081
http://localhost:5173
```

**Authorized redirect URIs (IMPORTANT):**

```
https://pzihbdsyoycubpxsryxx.supabase.co/auth/v1/callback
```

5. Click "Create"
6. **COPY** your Client ID and Client Secret (you'll need these!)

---

## Step 2: Configure Supabase (3 minutes)

### 2.1 Open Supabase Dashboard

Visit: https://pzihbdsyoycubpxsryxx.supabase.co

### 2.2 Navigate to Authentication

- Click "Authentication" in left sidebar
- Click "Providers"

### 2.3 Enable Google Provider

1. Find "Google" in the list
2. Toggle it **ON** (enable it)
3. Fill in the credentials:

**Client ID:**

```
paste-your-google-client-id-here
```

**Client Secret:**

```
paste-your-google-client-secret-here
```

4. **Redirect URL** (should be pre-filled):

```
https://pzihbdsyoycubpxsryxx.supabase.co/auth/v1/callback
```

5. Click "Save"

---

## Step 3: Test Google Login (2 minutes)

### 3.1 Restart Your Dev Server (if needed)

```bash
# Press Ctrl+C to stop
npm run dev
```

### 3.2 Test the Login

1. Go to: http://localhost:8081/auth
2. Click the "Google" button
3. You should see Google's login popup
4. Sign in with your Google account
5. Accept permissions
6. You'll be redirected back to your app! 🎉

---

## 🎨 What Happens After Login

1. User clicks "Google" button
2. Popup opens with Google login
3. User signs in
4. Google redirects to Supabase
5. Supabase creates user account automatically
6. User is logged in!

The code in `Auth.tsx` already handles this:

```typescript
const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/passenger/dashboard`,
    },
  });
};
```

---

## 🔒 Security Notes

### Production Setup (Before Going Live)

When you deploy to production (e.g., `https://urbanflow.com`):

1. **Update Google Console:**

   - Add production URL to "Authorized JavaScript origins":
     ```
     https://urbanflow.com
     ```

2. **Update Supabase:**

   - Go to Authentication → URL Configuration
   - Add your production URL to "Site URL"

3. **Update Redirect URLs:**
   - In your Google OAuth settings, add:
     ```
     https://pzihbdsyoycubpxsryxx.supabase.co/auth/v1/callback
     ```

---

## 🐛 Troubleshooting

### "Error 400: redirect_uri_mismatch"

**Solution:**

- Check that you added the exact redirect URI in Google Console:
  ```
  https://pzihbdsyoycubpxsryxx.supabase.co/auth/v1/callback
  ```
- Make sure there are no extra spaces or slashes

### Google login button does nothing

**Solution:**

- Open browser console (F12) and check for errors
- Make sure you enabled Google provider in Supabase
- Check that Client ID and Secret are correct

### "Access blocked: This app's request is invalid"

**Solution:**

- Make sure you configured OAuth Consent Screen
- Add your email to "Test Users"
- Wait 1-2 minutes for changes to propagate

### User created but no profile

**Solution:**

- Run SQL migration 008 (creates automatic profile on signup)
- Go to Supabase SQL Editor
- Run: `supabase/migrations/008_create_auth_triggers.sql`

---

## 📊 How User Data is Stored

When a user logs in with Google:

1. **Supabase creates an auth user** with:

   - ID
   - Email
   - Name
   - Profile picture (from Google)

2. **Trigger auto-creates profile** (if you ran migration 008):

   ```sql
   -- This happens automatically
   INSERT INTO user_profiles (
     id,
     email,
     full_name,
     avatar_url
   ) VALUES (
     new.id,
     new.email,
     new.raw_user_meta_data->>'full_name',
     new.raw_user_meta_data->>'avatar_url'
   );
   ```

3. **User can access the app!**

---

## 🎯 Quick Checklist

- [ ] Create Google OAuth Client ID
- [ ] Copy Client ID and Secret
- [ ] Enable Google provider in Supabase
- [ ] Paste credentials in Supabase
- [ ] Add correct redirect URI
- [ ] Save settings
- [ ] Test login at `/auth`
- [ ] Verify user created in Supabase

---

## 🔗 Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth Credentials](https://console.cloud.google.com/apis/credentials)
- [Supabase Dashboard](https://pzihbdsyoycubpxsryxx.supabase.co)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

## 🎉 That's It!

Your Google login is now fully functional and FREE! No ongoing costs, works perfectly with Supabase.

**Users can now:**

- ✅ Sign up with Google (one click)
- ✅ Sign in with Google (one click)
- ✅ Automatically get a profile created
- ✅ Access their dashboard immediately
