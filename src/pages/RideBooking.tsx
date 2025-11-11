import { useState } from 'react';
import { MapComponent } from '@/components/maps/MapComponent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RideBooking = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    console.log('Selected location:', location);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Book a Ride</h1>
            <p className="text-muted-foreground">Select your pickup and dropoff locations</p>
          </div>
        </div>

        {/* Map Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Choose Your Route
            </CardTitle>
            <CardDescription>
              Use the map to select your locations or type an address for autocomplete suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MapComponent 
              onLocationSelect={handleLocationSelect}
              showDirections={true}
            />
          </CardContent>
        </Card>

        {/* Selected Location Info */}
        {selectedLocation && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Pickup Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm"><strong>Address:</strong> {selectedLocation.address}</p>
              <p className="text-sm text-muted-foreground">
                <strong>Coordinates:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Book Ride Button */}
        <Button className="w-full" size="lg">
          Confirm and Book Ride
        </Button>
      </div>
    </div>
  );
};

export default RideBooking;
