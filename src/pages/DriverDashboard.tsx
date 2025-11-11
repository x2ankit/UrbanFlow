import React, { useEffect, useState } from "react";
import { useRide } from "../contexts/RideContext";
import DriverLocationUpdater from "../components/DriverLocationUpdater";
import { supabase } from "../integrations/supabase/client";
import MapLive from "../components/MapLive";

export const DriverDashboard: React.FC = () => {
  const [driverId, setDriverId] = useState<string | null>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [selectedRide, setSelectedRide] = useState<any | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [driverLoc, setDriverLoc] = useState<{ lat: number; lon: number } | null>(null);

  const { subscribeNearbyRideRequests, acceptRide, subscribeToRide, subscribeOffers } = useRide();

  useEffect(() => {
    const user = (async () => (await supabase.auth.getUser()).data?.user)();
    user.then((u) => {
      if (u) setDriverId(u.id);
    });
  }, []);

  useEffect(() => {
    if (!driverId) return;
    // subscribe to targeted offers for this driver
    const sub = subscribeOffers(driverId, async (offer) => {
      // fetch ride details for display
      const { data } = await supabase.from('ride_requests').select('*').eq('id', offer.ride_id).single();
      if (data) setPending((p) => [data, ...p]);
    });
    return () => sub.unsubscribe();
  }, [driverId]);

  const handleAccept = async (ride: any) => {
    if (!driverId) return alert("Driver not identified");
    const ok = await acceptRide(ride.id, driverId);
    if (ok) {
      setSelectedRide(ride);
      // also subscribe to ride updates (to listen for status changes)
      const sub = subscribeToRide(ride.id, (r) => setSelectedRide(r));
    }
  };

  const verifyOtpAndStart = async () => {
    if (!selectedRide) return;
    if (otpInput !== selectedRide.otp) return alert("OTP incorrect");
    // update ride status to ongoing
    await supabase.from("ride_requests").update({ status: "ongoing" }).eq("id", selectedRide.id);
    alert("Ride started");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Driver Dashboard</h2>
      {driverId && <DriverLocationUpdater driverId={driverId} enabled />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Pending Requests</h3>
          <div className="space-y-2">
            {pending.map((r) => (
              <div key={r.id} className="p-3 border rounded">
                <p>Pickup: {r.pickup_lat.toFixed(4)}, {r.pickup_lon.toFixed(4)}</p>
                <p>Fare: ₹{r.fare_rupees}</p>
                <div className="flex gap-2 mt-2">
                  <button className="btn btn-sm" onClick={() => handleAccept(r)}>Accept</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPending((p) => p.filter((x) => x.id !== r.id))}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium">Active Ride</h3>
          {selectedRide ? (
            <div className="p-3 border rounded space-y-2">
              <p>Rider: {selectedRide.rider_id}</p>
              <p>Pickup: {selectedRide.pickup_lat.toFixed(4)}, {selectedRide.pickup_lon.toFixed(4)}</p>
              <p>OTP: {selectedRide.otp}</p>
              <div className="flex gap-2">
                <input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="Enter OTP" className="input" />
                <button className="btn" onClick={verifyOtpAndStart}>Start Ride</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active ride selected</p>
          )}
        </div>
      </div>

      <div>
        <MapLive center={driverLoc ?? undefined} driver={driverLoc} />
      </div>
    </div>
  );
};

export default DriverDashboard;
