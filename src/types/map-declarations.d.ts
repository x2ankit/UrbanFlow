declare module 'maplibre-gl';
declare module '@maptiler/geocoding';

// Provide minimal types to avoid TS errors in this workspace; install proper @types if available.
interface ImportMetaEnv {
  readonly VITE_MAPTILER_KEY?: string;
  readonly VITE_RAZORPAY_KEY?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
