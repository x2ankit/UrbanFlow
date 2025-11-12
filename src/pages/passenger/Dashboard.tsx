import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useRide } from "@/contexts/RideContext";
import { MapPin, Navigation, Clock, DollarSign, User, LogOut, History } from "lucide-react";
import { motion } from "framer-motion";
import MapComponent from "@/components/maps/MapComponent";

const PassengerDashboard = () => {
  const { toast } = useToast();
  const [userName, setUserName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [estimatedFare, setEstimatedFare] = useState(0);

  // Map-related refs removed - MapComponent handles its own refs and services

  

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          toast({
            title: "Error",
            description: "Unable to get your location",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast]);

  // Small runtime diagnostics to help debug deployment issues (visible on page)
  const [maptilerKeyPresent, setMaptilerKeyPresent] = useState<boolean | null>(null);
  const [geoPermission, setGeoPermission] = useState<string | null>(null);
  useEffect(() => {
    setMaptilerKeyPresent(Boolean(import.meta.env.VITE_MAPTILER_KEY));
    if ((navigator as any).permissions && (navigator as any).permissions.query) {
      try {
        (navigator as any).permissions.query({ name: 'geolocation' }).then((p: any) => {
          setGeoPermission(p.state);
          p.onchange = () => setGeoPermission(p.state);
        });
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Load logged-in user's profile (name + avatar) from Supabase
  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) return;
        const user = data?.user;
        if (!user) return;
  // Try several metadata locations for name and avatar
  const anyUser = user as any;
  const meta = anyUser?.user_metadata || anyUser?.raw_user_meta_data || {};
  const name = meta?.full_name || meta?.name || user.email?.split("@")[0] || null;
  const avatar = meta?.avatar_url || meta?.picture || meta?.avatar || null;
        if (mounted) {
          setUserName(name);
          setAvatarUrl(avatar);
        }
      } catch (err) {
        // ignore
      }
    };
    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  // Route calculation moved into MapComponent; use handleRouteCalculated to receive results

  // Handlers for MapComponent
  const handleLocationSelect = (loc: { lat: number; lng: number; address: string; type?: string }) => {
    if (loc.type === 'dropoff') {
      setDestination(loc.address);
      setDropoffCoords({ lat: loc.lat, lng: loc.lng });
    } else {
      // 'pickup' or 'current'
      setPickup(loc.address);
      setPickupCoords({ lat: loc.lat, lng: loc.lng });
      setCurrentLocation({ lat: loc.lat, lng: loc.lng });
    }
  };

  const handleRouteCalculated = (distKm: number, mins: number) => {
    setDistance(`${distKm.toFixed(2)} km`);
    setDuration(`${mins} mins`);
    const basePrice = 50;
    const ratePerKm = 15;
    const calculatedFare = Math.round(basePrice + distKm * ratePerKm);
    setEstimatedFare(calculatedFare);
  };

  // use RideContext to create ride requests
  let createRideRequest: any = null;
  try {
    const ride = useRide();
    createRideRequest = ride.createRideRequest;
  } catch (e) {
    createRideRequest = null;
  }

  const handleConfirmRide = async () => {
    if (!pickupCoords || !dropoffCoords) return toast({ title: 'Error', description: 'Please select pickup and dropoff on the map first', variant: 'destructive' });
    if (!createRideRequest) return toast({ title: 'Info', description: 'Ride booking backend not available in this environment. Use RiderRide for demo.', variant: 'default' });

    // ensure rider exists
    const supabaseClient = supabase as any;
    const user = (await supabaseClient.auth.getUser()).data?.user;
    if (!user) return toast({ title: 'Sign in required', description: 'Please sign in before booking a ride', variant: 'destructive' });

    const { data } = await supabaseClient.from('riders').upsert([{ id: user.id, name: user.user_metadata?.full_name || user.email }], { onConflict: 'id' }).select().single();
    const riderId = data?.id || user.id;

    const created = await createRideRequest(riderId, { lat: pickupCoords.lat, lon: pickupCoords.lng }, { lat: dropoffCoords.lat, lon: dropoffCoords.lng });
    if (created) {
      toast({ title: 'Ride requested', description: 'Nearby drivers will be notified.', variant: 'default' });
    } else {
      toast({ title: 'Error', description: 'Failed to create ride request', variant: 'destructive' });
    }
  };

  // Recent rides removed — real ride history will be loaded from backend when implemented

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">UrbanFlow</h1>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-2 flex items-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <User className="h-3 w-3" />
                )}
                <span>{userName || "John Doe"}</span>
              </Badge>
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Booking Section */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="shadow-elegant-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Book a Ride</CardTitle>
                  <CardDescription>
                    Enter your pickup and destination to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Diagnostic banner: shows MapTiler key presence and geolocation permission state */}
                    <div className="mb-3 text-sm text-muted-foreground">
                      <strong>Runtime diagnostics:</strong>
                      <div>MapTiler key present: {maptilerKeyPresent ? <span className="text-green-600">Yes</span> : <span className="text-red-600">No</span>}</div>
                      <div>Geolocation permission: {geoPermission ?? <span className="text-yellow-600">unknown</span>}</div>
                      <div className="text-xs text-muted-foreground">If MapTiler key is missing, set <code>VITE_MAPTILER_KEY</code> in Vercel and redeploy.</div>
                    </div>
                    <MapComponent showDirections={true} onLocationSelect={handleLocationSelect} onRouteCalculated={handleRouteCalculated} />

                  {pickup && destination && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="pt-4"
                    >
                      <Card className="bg-muted">
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <Clock className="h-4 w-4" />
                              </div>
                              <p className="text-sm font-medium">{duration || "..."}</p>
                              <p className="text-xs text-muted-foreground">ETA</p>
                            </div>
                            <div>
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <Navigation className="h-4 w-4" />
                              </div>
                              <p className="text-sm font-medium">{distance || "..."}</p>
                              <p className="text-xs text-muted-foreground">Distance</p>
                            </div>
                            <div>
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <DollarSign className="h-4 w-4" />
                              </div>
                              <p className="text-sm font-medium">₹{estimatedFare || "..."}</p>
                              <p className="text-xs text-muted-foreground">Est. Fare</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Button onClick={handleConfirmRide} className="w-full h-12 mt-4" size="lg">
                        Confirm Ride
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Your Trips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">No recent trips to show. Your completed rides will appear here.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PassengerDashboard;
