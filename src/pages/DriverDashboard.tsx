import React, { useEffect, useState, useRef } from "react";
import { useRide } from "../contexts/RideContext";
import DriverLocationUpdater from "../components/DriverLocationUpdater";
import { supabase } from "../integrations/supabase/client";
import MapLive from "../components/MapLive";
import { haversineDistanceKm } from "../lib/rideHelpers";

export const DriverDashboard: React.FC = () => {
  const [driverId, setDriverId] = useState<string | null>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [selectedRide, setSelectedRide] = useState<any | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [driverLoc, setDriverLoc] = useState<{ lat: number; lon: number } | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<string>('unknown');
  const watchRef = useRef<number | null>(null);

  const { subscribeOffers, acceptRide, subscribeToRide } = useRide();

  useEffect(() => {
    (async () => {
      const u = (await supabase.auth.getUser()).data?.user;
      if (u) setDriverId(u.id);
    })();
  }, []);

  useEffect(() => {
    if (!driverId) return;
    const sub = subscribeOffers(driverId, async (offer) => {
      try {
        const { data } = await supabase.from("ride_requests").select("*").eq("id", offer.ride_id).single();
        if (data) {
          // compute distance from driver (if known) for sorting
          const dist = driverLoc ? haversineDistanceKm(driverLoc.lat, driverLoc.lon, data.pickup_lat, data.pickup_lon) : null;
          setPending((p) => {
            // avoid dupes
            if (p.find((x) => x.id === data.id)) return p;
            const item = { ...data, distanceFromDriverKm: dist };
            return [item, ...p].sort((a, b) => (a.distanceFromDriverKm ?? 999) - (b.distanceFromDriverKm ?? 999));
          });
        }
      } catch (e) {
        console.error("failed to load ride for offer", e);
      }
    }, (status) => {
      try {
        setRealtimeStatus(typeof status === 'string' ? status : JSON.stringify(status));
      } catch (e) {
        setRealtimeStatus('unknown');
      }
    });
    return () => sub.unsubscribe();
  }, [driverId, driverLoc]);

  // keep local driver position for the map
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const success = (p: GeolocationPosition) => setDriverLoc({ lat: p.coords.latitude, lon: p.coords.longitude });
    const error = () => {};
    navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true });
    const id = navigator.geolocation.watchPosition(success, error, { enableHighAccuracy: true });
    watchRef.current = id as unknown as number;
    return () => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current as any);
    };
  }, []);

  const handleAccept = async (ride: any) => {
    if (!driverId) return alert("Driver not identified");
    try {
      const ok = await acceptRide(ride.id, driverId);
      if (ok) {
        setSelectedRide(ride);
        setPending((p) => p.filter((x) => x.id !== ride.id));
        // subscribe to ride updates
        const sub = subscribeToRide(ride.id, (r) => setSelectedRide(r));
        // keep subscription reference on ride so we can unsubscribe on complete
        (ride as any).__sub = sub;
      } else {
        alert("Failed to accept ride");
      }
    } catch (e) {
      console.error("accept error", e);
      alert("Error accepting ride");
    }
  };

  const handleReject = (rideId: string) => setPending((p) => p.filter((x) => x.id !== rideId));

  const verifyOtpAndStart = async () => {
    if (!selectedRide) return;
    if (otpInput !== String(selectedRide.otp)) return alert("OTP incorrect");
    try {
      await supabase.from("ride_requests").update({ status: "ongoing" }).eq("id", selectedRide.id);
      alert("Ride started");
    } catch (e) {
      console.error(e);
      alert("Failed to start ride");
    }
  };

  const completeRide = async () => {
    if (!selectedRide) return;
    try {
      await supabase.from("ride_requests").update({ status: "completed" }).eq("id", selectedRide.id);
      alert("Ride completed");
      // unsubscribe if we saved sub
      if ((selectedRide as any).__sub) (selectedRide as any).__sub.unsubscribe();
      setSelectedRide(null);
    } catch (e) {
      console.error(e);
      alert("Failed to complete ride");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Status: <span className="ml-2 font-medium text-green-600">Online</span></div>
          <div className="text-sm text-muted-foreground">Realtime: <span className="ml-2 font-medium">{realtimeStatus}</span></div>
        </div>
      </div>

      {driverId && <DriverLocationUpdater driverId={driverId} enabled />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending offers */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-3">Pending Offers</h2>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">No offers yet — waiting for nearby ride requests.</p>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-auto">
                {pending.map((r) => (
                  <div key={r.id} className="border rounded p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium">Pickup</div>
                        <div className="text-xs text-muted-foreground">{r.pickup_lat?.toFixed?.(4)},{' '}{r.pickup_lon?.toFixed?.(4)}</div>
                        <div className="mt-2 text-sm">Fare: <span className="font-semibold">₹{r.fare_rupees}</span></div>
                        {typeof r.distanceFromDriverKm === 'number' && (
                          <div className="text-xs text-muted-foreground">{r.distanceFromDriverKm.toFixed(2)} km away</div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => handleAccept(r)}>Accept</button>
                        <button className="px-3 py-1 border rounded" onClick={() => handleReject(r.id)}>Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle & Right: Map + Active ride */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-3">Live Map</h2>
            <MapLive
              center={driverLoc ? { lat: driverLoc.lat, lon: driverLoc.lon } : undefined}
              driver={driverLoc ?? null}
              pickup={selectedRide ? { lat: selectedRide.pickup_lat, lon: selectedRide.pickup_lon } : null}
              drop={selectedRide ? { lat: selectedRide.drop_lat, lon: selectedRide.drop_lon } : null}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-3">Active Ride</h2>
            {selectedRide ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Rider</div>
                    <div className="font-medium">{selectedRide.rider_id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Fare</div>
                    <div className="font-medium">₹{selectedRide.fare_rupees}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Pickup</div>
                    <div className="text-sm">{selectedRide.pickup_lat?.toFixed?.(4)}, {selectedRide.pickup_lon?.toFixed?.(4)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Dropoff</div>
                    <div className="text-sm">{selectedRide.drop_lat?.toFixed?.(4)}, {selectedRide.drop_lon?.toFixed?.(4)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="Enter OTP" className="input px-3 py-2 border rounded w-1/2" />
                  <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={verifyOtpAndStart}>Verify & Start</button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={completeRide}>Complete</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active ride selected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
