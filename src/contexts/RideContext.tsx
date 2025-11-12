import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { haversineDistanceKm, calculateFare, generateOTP, estimateETAInMinutes as estimateETAHelper } from "../lib/rideHelpers";

type RideRequest = {
  id: string;
  rider_id: string;
  pickup_lat: number;
  pickup_lon: number;
  drop_lat: number;
  drop_lon: number;
  distance_km?: number;
  fare_rupees?: number;
  status?: string;
  driver_id?: string | null;
  otp?: string | null;
};

type DriverLocation = { driver_id: string; lat: number; lon: number; updated_at?: string };

type RideContextValue = {
  createRideRequest: (riderId: string, pickup: { lat: number; lon: number }, drop: { lat: number; lon: number }) => Promise<RideRequest | null>;
  acceptRide: (rideId: string, driverId: string) => Promise<boolean>;
  subscribeToRide: (rideId: string, cb: (r: RideRequest) => void) => { unsubscribe: () => void };
  subscribeNearbyRideRequests: (driverId: string, cb: (r: RideRequest) => void) => { unsubscribe: () => void };
  subscribeDriverLocations: (driverId: string, cb: (loc: DriverLocation) => void) => { unsubscribe: () => void };
  subscribeOffers: (driverId: string, cb: (offer: { id: string; ride_id: string; driver_id: string }) => void) => { unsubscribe: () => void };
  estimateETA: (distanceKm: number) => number | null;
};

const RideContext = createContext<RideContextValue | undefined>(undefined);

export const RideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const createRideRequest = async (riderId: string, pickup: { lat: number; lon: number }, drop: { lat: number; lon: number }) => {
    const distance = haversineDistanceKm(pickup.lat, pickup.lon, drop.lat, drop.lon);
    const fare = calculateFare(distance);

    const { data, error } = await supabase.from("ride_requests").insert([
      {
        rider_id: riderId,
        pickup_lat: pickup.lat,
        pickup_lon: pickup.lon,
        drop_lat: drop.lat,
        drop_lon: drop.lon,
        distance_km: distance,
        fare_rupees: fare,
        status: "pending",
      },
    ]).select().single();

    if (error) {
      console.error("createRideRequest error", error);
      return null;
    }

    const ride = data as RideRequest;

    // Create ride_offers for nearby drivers so they receive targeted realtime notifications.
    try {
      const nearby = await supabase.rpc('nearby_drivers', { p_lat: pickup.lat, p_lon: pickup.lon, p_radius_km: 3 });
      const drivers = (nearby.data || []) as Array<any>;
      if (drivers.length > 0) {
        const inserts = drivers.map((d) => ({ ride_id: ride.id, driver_id: d.driver_id }));
        await supabase.from('ride_offers').insert(inserts);
      }
    } catch (e) {
      console.warn('Failed to create ride offers', e);
    }

    return ride;
  };

  const acceptRide = async (rideId: string, driverId: string) => {
    const otp = generateOTP(4);
    const { error } = await supabase.from("ride_requests").update({ status: "accepted", driver_id: driverId, otp }).eq("id", rideId);
    if (error) {
      console.error("acceptRide error", error);
      return false;
    }
    return true;
  };

  const subscribeToRide = (rideId: string, cb: (r: RideRequest) => void) => {
    // Subscribe to changes on the specific ride_request row
    const channel = supabase.channel(`ride-${rideId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "ride_requests", filter: `id=eq.${rideId}` }, (payload) => {
        cb(payload.new as RideRequest);
      })
      .subscribe();

    return { unsubscribe: () => channel.unsubscribe() };
  };

  const subscribeNearbyRideRequests = (driverId: string, cb: (r: RideRequest) => void) => {
    // Driver listens for new pending ride_requests; client should filter by distance using driver's current location
    const channel = supabase.channel(`ride-requests-pending`) 
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ride_requests", filter: `status=eq.pending` }, (payload) => {
        cb(payload.new as RideRequest);
      })
      .subscribe();

    return { unsubscribe: () => channel.unsubscribe() };
  };

  const subscribeOffers = (driverId: string, cb: (offer: { id: string; ride_id: string; driver_id: string }) => void) => {
    const channel = supabase.channel(`ride-offers-${driverId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ride_offers', filter: `driver_id=eq.${driverId}` }, (payload) => {
        cb(payload.new as any);
      })
      .subscribe();

    return { unsubscribe: () => channel.unsubscribe() };
  };

  const getNearbyPendingRequests = async (driverLat: number, driverLon: number, radiusKm = 3) => {
    // fetch pending requests and filter client-side by haversine distance
    const { data, error } = await supabase.from('ride_requests').select('*').eq('status', 'pending');
    if (error) {
      console.error('getNearbyPendingRequests error', error);
      return [] as RideRequest[];
    }
    const rows = data as RideRequest[];
    return rows.filter((r) => {
      if (r.pickup_lat == null || r.pickup_lon == null) return false;
      const d = haversineDistanceKm(driverLat, driverLon, r.pickup_lat, r.pickup_lon);
      return d <= radiusKm;
    });
  };

  const subscribeDriverLocations = (driverId: string, cb: (loc: DriverLocation) => void) => {
    const channel = supabase.channel(`driver-locations`) 
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "driver_locations" }, (payload) => {
        cb(payload.new as DriverLocation);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "driver_locations" }, (payload) => {
        cb(payload.new as DriverLocation);
      })
      .subscribe();

    return { unsubscribe: () => channel.unsubscribe() };
  };

  const value = useMemo(() => ({ createRideRequest, acceptRide, subscribeToRide, subscribeNearbyRideRequests, subscribeDriverLocations, subscribeOffers, estimateETA: estimateETAHelper }), []);

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};

export function useRide() {
  const ctx = useContext(RideContext);
  if (!ctx) {
    // Don't throw in production UI — return a safe no-op stub so pages don't crash
    console.warn("useRide called outside RideProvider — returning no-op fallback");
    const noop = async () => null;
    const stub = {
      createRideRequest: noop,
      acceptRide: async () => false,
      subscribeToRide: (_rideId: string, _cb: (r: any) => void) => ({ unsubscribe: () => {} }),
      subscribeNearbyRideRequests: (_driverId: string, _cb: (r: any) => void) => ({ unsubscribe: () => {} }),
      subscribeDriverLocations: (_driverId: string, _cb: (loc: any) => void) => ({ unsubscribe: () => {} }),
      subscribeOffers: (_driverId: string, _cb: (offer: any) => void) => ({ unsubscribe: () => {} }),
      estimateETA: (_distanceKm: number) => null,
    } as unknown as typeof ctx;
    return stub;
  }
  return ctx;
}

