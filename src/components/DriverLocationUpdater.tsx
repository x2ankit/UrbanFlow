import React, { useEffect, useRef } from "react";
import { supabase } from "../integrations/supabase/client";

type Props = {
  driverId: string;
  enabled?: boolean;
  intervalMs?: number;
};

export function DriverLocationUpdater({ driverId, enabled = true, intervalMs = 5000 }: Props) {
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled || !driverId || !("geolocation" in navigator)) return;

    const sendLocation = async (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      try {
        // upsert to driver_locations (one row per driver_id)
        await supabase.from("driver_locations").upsert([{ driver_id: driverId, lat, lon }], { onConflict: "driver_id" });
        // update drivers table for quick lookup
        await supabase.from("drivers").upsert([{ id: driverId, current_lat: lat, current_lon: lon, updated_at: new Date().toISOString() }], { onConflict: "id" });
      } catch (err) {
        console.error("DriverLocationUpdater error", err);
      }
    };

    const success = (position: GeolocationPosition) => {
      sendLocation(position);
    };

    const error = (e: GeolocationPositionError) => {
      console.warn("Geolocation error", e);
    };

    // get initial position and then poll
    navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true });

    timerRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [driverId, enabled, intervalMs]);

  return null;
}

export default DriverLocationUpdater;
