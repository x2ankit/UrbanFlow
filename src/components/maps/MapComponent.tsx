import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, X } from 'lucide-react';

const libraries: ("places" | "geometry")[] = ['places', 'geometry'];

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 28.6139, // Delhi coordinates (change to your city)
  lng: 77.2090
};

interface MapComponentProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  showDirections?: boolean;
  initialPickup?: { lat: number; lng: number };
  initialDropoff?: { lat: number; lng: number };
}

export const MapComponent = ({ 
  onLocationSelect, 
  showDirections = false,
  initialPickup,
  initialDropoff
}: MapComponentProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupLocation, setPickupLocation] = useState<{ lat: number; lng: number; address: string } | null>(
    initialPickup ? { ...initialPickup, address: '' } : null
  );
  const [dropoffLocation, setDropoffLocation] = useState<{ lat: number; lng: number; address: string } | null>(
    initialDropoff ? { ...initialDropoff, address: '' } : null
  );
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

  const pickupAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          if (map) {
            map.panTo(location);
            map.setZoom(15);
          }
          
          // Reverse geocoding to get address
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const locationWithAddress = {
                ...location,
                address: results[0].formatted_address
              };
              setPickupLocation(locationWithAddress);
              onLocationSelect?.(locationWithAddress);
            }
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Error: Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Handle pickup autocomplete selection
  const onPickupPlaceChanged = () => {
    if (pickupAutocompleteRef.current) {
      const place = pickupAutocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || place.name || '',
        };
        setPickupLocation(location);
        if (map) {
          map.panTo({ lat: location.lat, lng: location.lng });
        }
        onLocationSelect?.(location);
      }
    }
  };

  // Handle dropoff autocomplete selection
  const onDropoffPlaceChanged = () => {
    if (dropoffAutocompleteRef.current) {
      const place = dropoffAutocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || place.name || '',
        };
        setDropoffLocation(location);
        if (map) {
          map.panTo({ lat: location.lat, lng: location.lng });
        }
      }
    }
  };

  // Calculate directions
  const calculateRoute = async () => {
    if (!pickupLocation || !dropoffLocation) {
      alert('Please select both pickup and dropoff locations');
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    
    try {
      const results = await directionsService.route({
        origin: { lat: pickupLocation.lat, lng: pickupLocation.lng },
        destination: { lat: dropoffLocation.lat, lng: dropoffLocation.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirections(results);
      if (results.routes[0]?.legs[0]) {
        setDistance(results.routes[0].legs[0].distance?.text || '');
        setDuration(results.routes[0].legs[0].duration?.text || '');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      alert('Error calculating route. Please try again.');
    }
  };

  // Clear route
  const clearRoute = () => {
    setDirections(null);
    setDistance('');
    setDuration('');
    setPickupLocation(null);
    setDropoffLocation(null);
  };

  if (loadError) {
    return <div className="text-red-500 p-4">Error loading Google Maps. Please check your API key.</div>;
  }

  if (!isLoaded) {
    return <div className="p-4">Loading map...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="space-y-3">
        {/* Current Location Button */}
        <Button 
          onClick={getCurrentLocation} 
          className="w-full gap-2"
          variant="outline"
        >
          <Navigation className="h-4 w-4" />
          Use My Current Location
        </Button>

        {/* Pickup Location Autocomplete */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Autocomplete
            onLoad={(autocomplete) => {
              pickupAutocompleteRef.current = autocomplete;
            }}
            onPlaceChanged={onPickupPlaceChanged}
          >
            <Input
              placeholder="Enter pickup location..."
              className="pl-10"
              defaultValue={pickupLocation?.address}
            />
          </Autocomplete>
        </div>

        {/* Dropoff Location Autocomplete (if showing directions) */}
        {showDirections && (
          <>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-red-500" />
              <Autocomplete
                onLoad={(autocomplete) => {
                  dropoffAutocompleteRef.current = autocomplete;
                }}
                onPlaceChanged={onDropoffPlaceChanged}
              >
                <Input
                  placeholder="Enter dropoff location..."
                  className="pl-10"
                  defaultValue={dropoffLocation?.address}
                />
              </Autocomplete>
            </div>

            {/* Direction Controls */}
            <div className="flex gap-2">
              <Button 
                onClick={calculateRoute} 
                className="flex-1"
                disabled={!pickupLocation || !dropoffLocation}
              >
                Get Directions
              </Button>
              {directions && (
                <Button 
                  onClick={clearRoute} 
                  variant="outline"
                  size="icon"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Distance & Duration Display */}
            {distance && duration && (
              <div className="bg-primary/10 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium">
                  Distance: <span className="text-primary">{distance}</span>
                </p>
                <p className="text-sm font-medium">
                  Duration: <span className="text-primary">{duration}</span>
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={currentLocation || pickupLocation || defaultCenter}
        zoom={13}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            position={currentLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        )}

        {/* Pickup Marker */}
        {pickupLocation && !directions && (
          <Marker
            position={{ lat: pickupLocation.lat, lng: pickupLocation.lng }}
            label="A"
          />
        )}

        {/* Dropoff Marker */}
        {dropoffLocation && !directions && (
          <Marker
            position={{ lat: dropoffLocation.lat, lng: dropoffLocation.lng }}
            label="B"
          />
        )}

        {/* Directions */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: '#3b82f6',
                strokeWeight: 5,
              },
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};
