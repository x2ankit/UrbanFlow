import React, { useEffect, useState } from "react";
import { useRide } from "../contexts/RideContext";
import MapLive from "../components/MapLive";
import { haversineDistanceKm, calculateFare, estimateETAInMinutes } from "../lib/rideHelpers";
import { supabase } from "../integrations/supabase/client";

export const RiderRide: React.FC = () => {
  const { createRideRequest, subscribeToRide } = useRide();
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLon, setPickupLon] = useState<number | null>(null);
  const [dropLat, setDropLat] = useState<number | null>(null);
  const [dropLon, setDropLon] = useState<number | null>(null);
  const [rideId, setRideId] = useState<string | null>(null);
  const [ride, setRide] = useState<any | null>(null);
  const [riderId, setRiderId] = useState<string | null>(null);

  useEffect(() => {
    // ensure rider record exists for current user
    const ensureRider = async () => {
      const user = (await supabase.auth.getUser()).data?.user;
      if (!user) return;
      // upsert into riders
      const { data } = await supabase.from("riders").upsert([{ id: user.id, name: user.user_metadata?.full_name || user.email, phone: user.user_metadata?.phone }], { onConflict: "id" }).select().single();
      setRiderId(data.id);
    };
    ensureRider();
  }, []);

  useEffect(() => {
    if (!rideId) return;
    const sub = subscribeToRide(rideId, (r) => {
      setRide(r);
    });
    return () => sub.unsubscribe();
  }, [rideId]);

  const bookRide = async () => {
    if (!pickupLat || !pickupLon || !dropLat || !dropLon || !riderId) return alert("Fill pickup & drop coordinates (for demo)");
    const result = await createRideRequest(riderId, { lat: pickupLat, lon: pickupLon }, { lat: dropLat, lon: dropLon });
    if (result?.ride) setRideId(result.ride.id);
    else {
      console.error('bookRide failed', result?.error);
      alert('Failed to create ride request: ' + (result?.error?.message || String(result?.error || 'unknown')));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Book a Ride</h2>

      {!rideId && (
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Pickup lat" className="input" onChange={(e) => setPickupLat(Number(e.target.value))} />
          <input placeholder="Pickup lon" className="input" onChange={(e) => setPickupLon(Number(e.target.value))} />
          <input placeholder="Drop lat" className="input" onChange={(e) => setDropLat(Number(e.target.value))} />
          <input placeholder="Drop lon" className="input" onChange={(e) => setDropLon(Number(e.target.value))} />
          <button className="btn btn-primary col-span-2" onClick={bookRide}>Book Ride</button>
        </div>
      )}

      {ride && (
        <div className="space-y-3">
          <div className="p-4 border rounded">
            <p className="text-sm">Status: <strong>{ride.status}</strong></p>
            {ride.driver_id && (
              <div>
                <p>Driver: {ride.driver_id}</p>
                <p>OTP: {ride.otp}</p>
                <p>Fare: ₹{ride.fare_rupees}</p>
                <p>ETA: {estimateETAInMinutes(ride.distance_km)} mins</p>
              </div>
            )}
          </div>

          <MapLive
            center={pickupLat && pickupLon ? { lat: pickupLat, lon: pickupLon } : undefined}
            pickup={pickupLat && pickupLon ? { lat: pickupLat, lon: pickupLon } : null}
            drop={dropLat && dropLon ? { lat: dropLat, lon: dropLon } : null}
            driver={ride?.driver_current_location ? { lat: ride.driver_current_location.lat, lon: ride.driver_current_location.lon } : null}
          />
        </div>
      )}
    </div>
  );
};

export default RiderRide;
