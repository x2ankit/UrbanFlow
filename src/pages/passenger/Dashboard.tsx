import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Navigation, Clock, DollarSign, User, LogOut, History } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete, DirectionsRenderer } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

const PassengerDashboard = () => {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [estimatedFare, setEstimatedFare] = useState(0);

  const pickupRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

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

  const calculateRoute = useCallback(async () => {
    if (!pickup || !destination) return;

    const directionsService = new google.maps.DirectionsService();
    
    try {
      const result = await directionsService.route({
        origin: pickup,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirections(result);
      const leg = result.routes[0]?.legs?.[0];
      setDistance(leg?.distance?.text || "");
      setDuration(leg?.duration?.text || "");
      
      // Calculate estimated fare safely
      const meters = leg?.distance?.value ?? 0;
      const distanceInKm = meters / 1000;
      const basePrice = 50; // Base fare in your currency
      const ratePerKm = 15; // Rate per kilometer
      const calculatedFare = Math.round(basePrice + distanceInKm * ratePerKm);
      setEstimatedFare(calculatedFare);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not calculate route",
        variant: "destructive",
      });
    }
  }, [pickup, destination, toast]);

  const recentRides = [
    {
      id: 1,
      from: "Downtown Plaza",
      to: "Airport Terminal 2",
      date: "2024-01-15",
      fare: "$45.50",
      status: "completed",
    },
    {
      id: 2,
      from: "Central Station",
      to: "Business District",
      date: "2024-01-14",
      fare: "$28.00",
      status: "completed",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">UrbanFlow</h1>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-2">
                <User className="h-3 w-3" />
                John Doe
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Pickup Location
                    </label>
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={(auto) => (pickupRef.current = auto)}
                        onPlaceChanged={() => {
                          const place = pickupRef.current?.getPlace();
                          if (place?.formatted_address) {
                            setPickup(place.formatted_address);
                            if (place.geometry?.location) {
                              const location = {
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng(),
                              };
                              mapRef.current?.panTo(location);
                              calculateRoute();
                            }
                          }
                        }}
                      >
                        <Input
                          placeholder="Enter pickup location"
                          value={pickup}
                          onChange={(e) => setPickup(e.target.value)}
                          className="h-12"
                        />
                      </Autocomplete>
                    ) : (
                      <Input
                        placeholder="Loading..."
                        disabled
                        className="h-12"
                      />
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            async (position) => {
                              const location = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                              };
                              setCurrentLocation(location);
                              mapRef.current?.panTo(location);
                              
                              // Reverse geocode to get address
                              const geocoder = new google.maps.Geocoder();
                              const results = await geocoder.geocode({ location });
                              if (results.results[0]) {
                                setPickup(results.results[0].formatted_address);
                                calculateRoute();
                              }
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
                      }}
                    >
                      <Navigation className="h-4 w-4" />
                      Use My Location
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      Destination
                    </label>
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={(auto) => (destinationRef.current = auto)}
                        onPlaceChanged={() => {
                          const place = destinationRef.current?.getPlace();
                          if (place?.formatted_address) {
                            setDestination(place.formatted_address);
                            if (place.geometry?.location) {
                              calculateRoute();
                            }
                          }
                        }}
                      >
                        <Input
                          placeholder="Where to?"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="h-12"
                        />
                      </Autocomplete>
                    ) : (
                      <Input
                        placeholder="Loading..."
                        disabled
                        className="h-12"
                      />
                    )}
                  </div>

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

                      <Button className="w-full h-12 mt-4" size="lg">
                        Confirm Ride
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Map View */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="shadow-elegant">
                <CardContent className="p-0">
                  {isLoaded ? (
                    <div className="h-96">
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        center={currentLocation || { lat: 20.5937, lng: 78.9629 }}
                        zoom={14}
                        options={{
                          zoomControl: true,
                          streetViewControl: false,
                          mapTypeControl: false,
                          fullscreenControl: false,
                        }}
                        onLoad={(map) => {
                          mapRef.current = map;
                        }}
                      >
                        {currentLocation && <Marker position={currentLocation} />}
                        {directions && (
                          <DirectionsRenderer
                            directions={directions}
                            options={{
                              polylineOptions: {
                                strokeColor: "hsl(var(--primary))",
                                strokeWeight: 5,
                              },
                            }}
                          />
                        )}
                      </GoogleMap>
                    </div>
                  ) : (
                    <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Loading map...</p>
                    </div>
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
                    Recent Rides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentRides.map((ride) => (
                    <div
                      key={ride.id}
                      className="p-4 bg-muted rounded-lg space-y-2 hover:bg-muted/80 transition-smooth cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium">{ride.from}</p>
                          <p className="text-xs text-muted-foreground">to {ride.to}</p>
                        </div>
                        <Badge variant="secondary">{ride.fare}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{ride.date}</span>
                        <Badge variant="outline" className="text-xs">
                          {ride.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
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
